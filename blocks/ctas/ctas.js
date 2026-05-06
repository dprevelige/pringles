export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    row.classList.add('ctas-row');
    [...row.children].forEach((cell) => {
      cell.classList.add('ctas-card');
    });
  });
}
