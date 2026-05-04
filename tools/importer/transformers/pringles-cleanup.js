/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Pringles site-wide cleanup.
 * Removes non-authorable content and cleans attributes.
 * All selectors validated against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove hidden h1 used for SEO/accessibility hack (line 8 of cleaned.html)
    // Found: <h1 style="visibility:hidden; margin:0;">Watch Pringleleo on YouTube</h1>
    const hiddenH1 = element.querySelector('.pagehero.hero-pringles-party-home h1[style*="visibility:hidden"]');
    if (hiddenH1) hiddenH1.remove();
  }

  if (hookName === TransformHook.afterTransform) {
    // Clean non-authorable data attributes from links
    // Found: data-ytid on .icon--player (line 9)
    // Found: data-ps-trigger-sku on promo link (line 138)
    // Found: data-event on promo link (line 150)
    element.querySelectorAll('[data-ytid], [data-ps-trigger-sku], [data-event]').forEach((el) => {
      el.removeAttribute('data-ytid');
      el.removeAttribute('data-ps-trigger-sku');
      el.removeAttribute('data-event');
    });

    // Remove any noscript, iframe, link, or script elements if present
    WebImporter.DOMUtils.remove(element, ['noscript', 'iframe', 'link', 'script']);
  }
}
