/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns variant.
 * Base block: columns
 * Source: https://www.pringles.com/en-us/home.html
 * Selector: .promotiles .promotions-featured-row
 * Generated: 2026-05-04
 *
 * NOTE: Live validation fails because pringles.com blocks headless browsers
 * with CDN bot protection. All parser selectors have been verified against
 * the cached source.html and the interactive Playwright browser session
 * where the DOM was fully accessible.
 *
 * Source structure: .promotions-featured-row contains multiple .promotions-featured-column divs.
 * Each column has an <a> wrapping a .rich-text div with a <picture><img> and
 * a .promotions-description containing span.button-cta text.
 *
 * Target: Columns block with one row, N cells (one per column).
 * Each cell contains the image and CTA text as a paragraph.
 */
export default function parse(element, { document }) {
  // Extract all column containers from the source; fallback to direct child divs
  let columns = element.querySelectorAll(':scope .promotions-featured-column');
  if (!columns.length) {
    columns = element.querySelectorAll(':scope > div:not(.promomodal-box)');
  }

  // Build a single row with one cell per column
  const row = [];

  columns.forEach((col) => {
    const cellContent = [];

    // Extract the image (inside .rich-text picture img)
    const img = col.querySelector('.rich-text picture img, .rich-text img, picture img, img');
    if (img) {
      // Handle lazy-loaded images: use data-src if src is a placeholder
      const dataSrc = img.getAttribute('data-src');
      if (dataSrc && (!img.src || img.src.startsWith('data:'))) {
        img.src = dataSrc;
      }
      // Use the picture element if available for responsive images, otherwise the img
      const picture = img.closest('picture') || img;
      cellContent.push(picture);
    }

    // Extract the CTA text from span.button-cta
    // The parent <a> hrefs are "#" (placeholder), so we render the CTA as plain text
    const ctaSpan = col.querySelector('span.button-cta, .promotions-description span, .button-cta');
    if (ctaSpan) {
      const ctaText = ctaSpan.textContent.trim();
      if (ctaText) {
        // Check if the parent link has a meaningful href (not "#" or empty)
        const parentLink = col.querySelector('a[href]');
        const href = parentLink ? parentLink.getAttribute('href') : null;
        if (href && href !== '#' && href !== '') {
          // Wrap in a link if the href is meaningful
          const link = document.createElement('a');
          link.href = href;
          link.textContent = ctaText;
          const p = document.createElement('p');
          p.appendChild(link);
          cellContent.push(p);
        } else {
          // Use plain text paragraph when href is a placeholder
          const p = document.createElement('p');
          p.textContent = ctaText;
          cellContent.push(p);
        }
      }
    }

    row.push(cellContent);
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
