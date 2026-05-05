/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards variant.
 * Base block: cards
 * Source: https://www.pringles.com/en-us/home.html
 * Selector: .categorygrid .products-featured-row
 * Generated: 2026-05-04
 *
 * Extracts product category cards from the source DOM.
 * Each a.product-category becomes one row with:
 *   - Column 1: product image (from .product-primary-image picture img)
 *   - Column 2: heading (h2) + description (p) + CTA link (from card href + span.button-cta text)
 *
 * Validated selectors against source.html and live DOM:
 *   - :scope > a.product-category (7 cards found)
 *   - .product-primary-image picture img (image per card)
 *   - .product-category-description h2 (heading per card)
 *   - .product-category-description p (description per card)
 *   - .product-category-description span.button-cta (CTA text per card)
 *
 * Note: Automated validation blocked by pringles.com bot protection.
 * All selectors verified interactively via Playwright browser session on live DOM.
 */
export default function parse(element, { document }) {
  // Each card is an anchor element with class "product-category"
  // Fallback to any direct child anchors if class not present
  let cards = element.querySelectorAll(':scope > a.product-category');
  if (!cards.length) {
    cards = element.querySelectorAll(':scope > a');
  }

  const cells = [];

  cards.forEach((card) => {
    // Column 1: Image - try specific selector first, then broader fallbacks
    const img = card.querySelector('.product-primary-image picture img')
      || card.querySelector('.product-primary-image img')
      || card.querySelector('picture img')
      || card.querySelector('img');

    // Column 2: Text content (heading + description + CTA link)
    const heading = card.querySelector('.product-category-description h2')
      || card.querySelector('.product-category-description h3')
      || card.querySelector('h2, h3');

    const description = card.querySelector('.product-category-description p')
      || card.querySelector('p');

    const ctaSpan = card.querySelector('.product-category-description span.button-cta')
      || card.querySelector('span.button-cta');

    // Build image cell - use the img element directly if found
    const imageCell = img || '';

    // Build content cell
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);

    // Convert span.button-cta to a proper anchor link using the card's href
    if (ctaSpan) {
      const href = card.getAttribute('href') || '#';
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = ctaSpan.textContent;
      const ctaParagraph = document.createElement('p');
      ctaParagraph.append(link);
      contentCell.push(ctaParagraph);
    }

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
