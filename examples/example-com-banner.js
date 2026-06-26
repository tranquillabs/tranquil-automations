const tab = await tranquil.getActiveTab();
await tab.evaluate(() => {
  const existing = document.getElementById('tranquil-hello');
  if (existing) { existing.remove(); return; }

  const el = document.createElement('p');
  el.id = 'tranquil-hello';
  el.style.cssText = [
    'margin-top:2rem',
    'padding:0.75rem 1rem',
    'background:#f0f4ff',
    'border:1px solid #c7d8ff',
    'border-radius:4px',
    'font-size:0.9rem',
    'color:#333',
  ].join(';');
  el.textContent = 'This page was enhanced by a Tranquil automation.';

  const container = document.querySelector('div') || document.body;
  container.appendChild(el);
});
