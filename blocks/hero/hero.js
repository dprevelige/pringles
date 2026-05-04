export default function decorate(block) {
  const row = block.children[0];
  if (!row) return;

  const cells = [...row.children];
  if (cells.length < 2) return;

  const mediaCell = cells[0];
  const contentCell = cells[1];

  // Check if media cell contains a YouTube link
  const link = mediaCell.querySelector('a');
  if (link && link.href.includes('youtube.com/watch')) {
    const url = new URL(link.href);
    const videoId = url.searchParams.get('v');
    if (videoId) {
      mediaCell.className = 'hero-video-bg';
      mediaCell.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    }
  }

  contentCell.classList.add('hero-content');
}
