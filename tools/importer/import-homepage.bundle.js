/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const heading = element.querySelector("h1, h2, h3");
    const ctaLink = element.querySelector("a.button-cta, a.cta");
    const videoLink = element.querySelector("a.icon--player, a[data-ytid]");
    const contentCell = [];
    if (heading) {
      const h1 = document.createElement("h1");
      h1.textContent = heading.textContent;
      contentCell.push(h1);
    }
    if (videoLink) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = videoLink.getAttribute("href") || "";
      a.textContent = videoLink.getAttribute("aria-label") || videoLink.textContent || "Watch Video";
      p.appendChild(a);
      contentCell.push(p);
    }
    if (ctaLink && ctaLink !== videoLink) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = ctaLink.getAttribute("href") || "";
      a.textContent = ctaLink.textContent.trim();
      p.appendChild(a);
      contentCell.push(p);
    }
    const cells = [contentCell];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    let cards = element.querySelectorAll(":scope > a.product-category");
    if (!cards.length) {
      cards = element.querySelectorAll(":scope > a");
    }
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector(".product-primary-image picture img") || card.querySelector(".product-primary-image img") || card.querySelector("picture img") || card.querySelector("img");
      const heading = card.querySelector(".product-category-description h2") || card.querySelector(".product-category-description h3") || card.querySelector("h2, h3");
      const description = card.querySelector(".product-category-description p") || card.querySelector("p");
      const ctaSpan = card.querySelector(".product-category-description span.button-cta") || card.querySelector("span.button-cta");
      const imageCell = img || "";
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (description) contentCell.push(description);
      if (ctaSpan) {
        const href = card.getAttribute("href") || "#";
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = ctaSpan.textContent;
        const ctaParagraph = document.createElement("p");
        ctaParagraph.append(link);
        contentCell.push(ctaParagraph);
      }
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    let columns = element.querySelectorAll(":scope .promotions-featured-column");
    if (!columns.length) {
      columns = element.querySelectorAll(":scope > div:not(.promomodal-box)");
    }
    const row = [];
    columns.forEach((col) => {
      const cellContent = [];
      const img = col.querySelector(".rich-text picture img, .rich-text img, picture img, img");
      if (img) {
        const dataSrc = img.getAttribute("data-src");
        if (dataSrc && (!img.src || img.src.startsWith("data:"))) {
          img.src = dataSrc;
        }
        const picture = img.closest("picture") || img;
        cellContent.push(picture);
      }
      const ctaSpan = col.querySelector("span.button-cta, .promotions-description span, .button-cta");
      if (ctaSpan) {
        const ctaText = ctaSpan.textContent.trim();
        if (ctaText) {
          const parentLink = col.querySelector("a[href]");
          const href = parentLink ? parentLink.getAttribute("href") : null;
          if (href && href !== "#" && href !== "") {
            const link = document.createElement("a");
            link.href = href;
            link.textContent = ctaText;
            const p = document.createElement("p");
            p.appendChild(link);
            cellContent.push(p);
          } else {
            const p = document.createElement("p");
            p.textContent = ctaText;
            cellContent.push(p);
          }
        }
      }
      row.push(cellContent);
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/pringles-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      const hiddenH1 = element.querySelector('.pagehero.hero-pringles-party-home h1[style*="visibility:hidden"]');
      if (hiddenH1) hiddenH1.remove();
    }
    if (hookName === TransformHook.afterTransform) {
      element.querySelectorAll("[data-ytid], [data-ps-trigger-sku], [data-event]").forEach((el) => {
        el.removeAttribute("data-ytid");
        el.removeAttribute("data-ps-trigger-sku");
        el.removeAttribute("data-event");
      });
      WebImporter.DOMUtils.remove(element, ["noscript", "iframe", "link", "script"]);
    }
  }

  // tools/importer/transformers/pringles-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.beforeTransform) {
      const { template } = payload;
      if (!template || !template.sections || template.sections.length < 2) return;
      const document = element.ownerDocument;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "columns": parse3
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Pringles US homepage with hero, product showcases, and promotional content",
    urls: [
      "https://www.pringles.com/en-us/home.html"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".pagehero.hero-pringles-party-home"]
      },
      {
        name: "cards",
        instances: [".categorygrid .products-featured-row"]
      },
      {
        name: "columns",
        instances: [".promotiles .promotions-featured-row"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero Section",
        selector: ".pagehero.hero-pringles-party-home",
        style: "brand-red",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2-products",
        name: "Product Categories Section",
        selector: ".cmp-experiencefragment--product-categories",
        style: null,
        blocks: ["cards"],
        defaultContent: [".content_wrapper.products-featured h2"]
      },
      {
        id: "section-3-promo",
        name: "Promotional Tiles Section",
        selector: ".cmp-experiencefragment--promo-tiles",
        style: "brand-red",
        blocks: ["columns"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
