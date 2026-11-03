import { chromium } from 'playwright';

const pages = [
  { url: 'https://lelea-terang-civic-platform.vercel.app/', name: 'home', wait: 4000 },
  { url: 'https://lelea-terang-civic-platform.vercel.app/anggaran', name: 'anggaran', wait: 3000 },
  { url: 'https://lelea-terang-civic-platform.vercel.app/statistik', name: 'statistik', wait: 3000 },
  { url: 'https://lelea-terang-civic-platform.vercel.app/insight', name: 'insight', wait: 3000 },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const p of pages) {
    console.log(`Capturing ${p.name}...`);
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(p.wait);
    await page.screenshot({ path: `docs-lomba/screenshot-${p.name}.png`, fullPage: false });
  }

  await browser.close();
  console.log('Done!');
})();
