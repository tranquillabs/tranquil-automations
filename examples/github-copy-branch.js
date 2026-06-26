const tab = await tranquil.getActiveTab();
await tab.evaluate(() => {
  if (document.getElementById('tranquil-copy-branch')) return;
  const branchEl = document.querySelector('.head-ref');
  if (!branchEl) return;

  const btn = document.createElement('button');
  btn.id = 'tranquil-copy-branch';
  btn.textContent = 'Copy branch';
  btn.style.cssText = [
    'margin-left:6px',
    'padding:2px 8px',
    'font-size:12px',
    'font-family:inherit',
    'cursor:pointer',
    'border-radius:6px',
    'border:1px solid var(--color-border-default,#d0d7de)',
    'background:var(--color-canvas-subtle,#f6f8fa)',
    'color:var(--color-fg-default,#24292f)',
    'vertical-align:middle',
  ].join(';');

  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(branchEl.textContent.trim());
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy branch'; }, 1500);
  });

  branchEl.after(btn);
});
