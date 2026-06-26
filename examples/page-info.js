const tab = await tranquil.getActiveTab();
const stats = await tab.evaluate(() => {
  const links = document.querySelectorAll('a').length;
  const images = document.querySelectorAll('img').length;
  const headings = document.querySelectorAll('h1,h2,h3').length;
  return `${document.title}\n\nLinks: ${links}  |  Images: ${images}  |  Headings: ${headings}`;
});
await tranquil.openFile(tranquil.writeFile('page-info.txt', stats));
