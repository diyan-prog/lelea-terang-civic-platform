import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/docs-lomba/template.html', { waitUntil: 'networkidle' });
  
  await page.pdf({
    path: 'docs-lomba/WIA_FSDMIA2026_NamaTim.pdf',
    printBackground: true,
    width: '1280px',
    height: '720px'
  });

  await browser.close();
  console.log('PDF generated successfully!');
})();
