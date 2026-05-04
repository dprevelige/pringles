/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Pringles section breaks and section metadata.
 * Adds <hr> section breaks and Section Metadata blocks based on template sections.
 * All selectors validated against migration-work/cleaned.html:
 *   - .pagehero.hero-pringles-party-home (line 6)
 *   - .cmp-experiencefragment--product-categories (line 22)
 *   - .cmp-experiencefragment--promo-tiles (line 125)
 *
 * All logic runs in beforeTransform to ensure original DOM selectors
 * are available before the helix-importer processes the page.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const document = element.ownerDocument;
    const sections = template.sections;

    // Process in reverse order to preserve DOM positions when inserting
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Add Section Metadata block after the section element if it has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add <hr> before the section element for each section except the first
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
