const tab = await tranquil.getActiveTab();
await tab.evaluate(() => {
  document.querySelectorAll('a[href^="http"]').forEach(a => {
    a.style.outline = '2px solid orange';
  });
});
