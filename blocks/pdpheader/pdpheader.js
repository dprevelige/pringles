export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cells = [...row.children];
  if (cells.length < 2) return;

  cells[0].classList.add('pdpheader-image');
  cells[1].classList.add('pdpheader-details');

  const categoryLink = cells[1].querySelector('a[href*="/products/"]');
  if (categoryLink) {
    const badge = categoryLink.closest('p');
    if (badge) badge.classList.add('pdpheader-category');
  }

  const ctaLink = cells[1].querySelector('a[href="#"]');
  if (ctaLink) {
    ctaLink.classList.add('pdpheader-cta');
  }
}
