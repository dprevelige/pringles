/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero variant.
 * Base block: hero
 * Source selector: .pagehero.hero-pringles-party-home
 * Source URL: https://www.pringles.com/en-us/home.html
 * Generated: 2026-05-04
 *
 * Source HTML structure:
 *   div.pagehero.hero-pringles-party-home
 *     > section
 *       > h1 (hidden, SEO title — "Watch Pringleleo on YouTube")
 *       > a.icon--player.ytmobile (YouTube video link)
 *       > a.button-cta (CTA link — "Learn More About Pringles Big Game")
 *
 * Target block structure (from library):
 *   Row 1 (optional): Background image — skipped, no image in source DOM (CSS-based background)
 *   Row 2: Title heading + optional video link + CTA link
 *
 * Validation: Live hook validation fails because pringles.com WAF blocks headless
 * Chromium ("Access denied due to security risk"). All selectors verified against
 * cached source.html and confirmed on live page via interactive Playwright MCP session.
 */
export default function parse(element, { document }) {
  // Extract heading — source has h1 (hidden for SEO)
  // Fallback to h2/h3 for variation across pages
  const heading = element.querySelector('h1, h2, h3');

  // Extract CTA link — source has a.button-cta
  // Fallback to generic CTA selectors for variation
  const ctaLink = element.querySelector('a.button-cta, a.cta');

  // Extract YouTube / video link if present — source has a.icon--player
  const videoLink = element.querySelector('a.icon--player, a[data-ytid]');

  // Build the content cell (single row: heading + video link + CTA)
  const contentCell = [];

  // Add heading if present — create a clean visible h1
  if (heading) {
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent;
    contentCell.push(h1);
  }

  // Add video link if present
  if (videoLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoLink.getAttribute('href') || '';
    a.textContent = videoLink.getAttribute('aria-label') || videoLink.textContent || 'Watch Video';
    p.appendChild(a);
    contentCell.push(p);
  }

  // Add CTA link if present (ensure it is distinct from video link)
  if (ctaLink && ctaLink !== videoLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href') || '';
    a.textContent = ctaLink.textContent.trim();
    p.appendChild(a);
    contentCell.push(p);
  }

  // Build cells array — single content row (no background image row for this instance)
  const cells = [contentCell];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
