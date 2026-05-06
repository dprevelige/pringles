export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const row = rows[0];
  const cells = [...row.children];

  if (cells.length >= 2) {
    cells[0].classList.add('nutrition-heading');
    cells[1].classList.add('nutrition-content');
  } else if (cells.length === 1) {
    cells[0].classList.add('nutrition-content');
  }
}
