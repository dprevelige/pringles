import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
  readBlockConfig,
  toClassName,
  toCamelCase,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  if (h1 && picture
    // eslint-disable-next-line no-bitwise
    && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  } else if (h1) {
    const firstSection = main.querySelector(':scope > div');
    if (firstSection && firstSection.contains(h1)) {
      const elems = [...firstSection.children];
      const section = document.createElement('div');
      section.append(buildBlock('hero', { elems }));
      main.prepend(section);
      if (firstSection.children.length === 0) firstSection.remove();
    }
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds a cards block from a repeating pattern of picture + heading + text + link.
 * @param {Element} main The container element
 */
function buildCardsBlock(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const pictures = section.querySelectorAll(':scope > p > picture');
    if (pictures.length < 3) return;
    const cards = [];
    let current = null;
    [...section.children].forEach((el) => {
      if (el.querySelector('picture') && el.tagName === 'P') {
        if (current) cards.push(current);
        current = { image: el, texts: [] };
      } else if (current && (el.tagName === 'H2' || el.tagName === 'P')) {
        current.texts.push(el);
      }
    });
    if (current) cards.push(current);
    if (cards.length < 3) return;

    const rows = cards.map((card) => {
      const imgCell = document.createElement('div');
      imgCell.append(card.image);
      const textCell = document.createElement('div');
      card.texts.forEach((t) => textCell.append(t));
      return [imgCell, textCell];
    });
    const block = buildBlock('cards', rows);
    const firstH2 = section.querySelector('h2');
    if (firstH2 && !firstH2.closest('.cards')) {
      firstH2.after(block);
    } else {
      section.prepend(block);
    }
  });
}

/**
 * Removes metadata section flattened by DA.
 * @param {Element} main The container element
 */
function removeExposedMetadata(main) {
  const sections = main.querySelectorAll(':scope > div');
  const lastSection = sections[sections.length - 1];
  if (lastSection) {
    const firstP = lastSection.querySelector('p');
    if (firstP && firstP.textContent.trim() === 'Title') {
      lastSection.remove();
    }
  }
}

/**
 * Repairs section-metadata that was flattened into plain paragraphs by DA.
 * Detects pattern: <p>style</p><p>value</p> at end of section and wraps in section-metadata div.
 * @param {Element} main The container element
 */
function repairSectionMetadata(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const children = [...section.children];
    for (let i = 0; i < children.length - 1; i += 1) {
      const el = children[i];
      const next = children[i + 1];
      if (el.tagName === 'P' && next.tagName === 'P'
        && el.textContent.trim().toLowerCase() === 'style'
        && !el.querySelector('a, img, picture')) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'section-metadata';
        const row = document.createElement('div');
        const keyCell = document.createElement('div');
        keyCell.textContent = 'style';
        const valCell = document.createElement('div');
        valCell.textContent = next.textContent.trim();
        row.append(keyCell, valCell);
        metaDiv.append(row);
        el.replaceWith(metaDiv);
        next.remove();
        break;
      }
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    removeExposedMetadata(main);
    repairSectionMetadata(main);
    if (!main.querySelector('.hero')) buildHeroBlock(main);
    if (!main.querySelector('.cards')) buildCardsBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates all sections in a container element.
 * @param {Element} main The container element
 */
function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.classList.contains('richtext')) {
        e.removeAttribute('class');
        if (!defaultContent) {
          const wrapper = document.createElement('div');
          wrapper.classList.add('default-content-wrapper');
          wrappers.push(wrapper);
          defaultContent = true;
        }
      } else if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper');
      }
      wrappers[wrappers.length - 1].append(e);
    });

    // Add wrapped content back
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
    section.style.display = 'none';

    // Process section metadata
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'style') {
          const styles = meta.style
            .split(',')
            .filter((style) => style)
            .map((style) => toClassName(style.trim()));
          styles.forEach((style) => section.classList.add(style));
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  doc.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    doc.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadSidekick() {
  if (document.querySelector('aem-sidekick')) {
    import('./sidekick.js');
    return;
  }

  document.addEventListener('sidekick-ready', () => {
    import('./sidekick.js');
  });
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
  loadSidekick();
}

// UE Editor support before page load
if (/\.(stage-ue|ue)\.da\.live$/.test(window.location.hostname)) {
  // eslint-disable-next-line import/no-unresolved
  await import(`${window.hlx.codeBasePath}/ue/scripts/ue.js`).then(({ default: ue }) => ue());
}

loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);

  const lp = searchParams.get('dapreview');
  // eslint-disable-next-line import/no-unresolved
  if (lp) import('https://da.live/scripts/dapreview.js').then((mod) => mod.default(loadPage));

  const exp = searchParams.get('daexperiment');
  // eslint-disable-next-line import/no-unresolved
  if (exp) import('https://da.live/nx/public/plugins/exp/exp.js');
}());
