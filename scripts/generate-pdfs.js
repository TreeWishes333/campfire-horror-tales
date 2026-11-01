const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

async function generate() {
  const pages = [
    { html: 'fleshy-findlay.html', out: 'assets/pdfs/fleshy-findlay.pdf' },
    { html: 'the-boy-in-the-bog.html', out: 'assets/pdfs/the-boy-in-the-bog.pdf' },
    { html: 'the-old-woman-in-the-mirror.html', out: 'assets/pdfs/the-old-woman-in-the-mirror.pdf' },
    { html: 'a-doll-for-a-dollar.html', out: 'assets/pdfs/a-doll-for-a-dollar.pdf' }
  ];

  const outDir = path.resolve(__dirname, '..', 'assets', 'pdfs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    for (const p of pages) {
      const filePath = path.resolve(__dirname, '..', p.html);
      const url = pathToFileURL(filePath).href;
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 900 });
      // Allow some time for local resources and scripts to load
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.waitForTimeout(300);
      // Ensure manuscript rendered
      await page.waitForSelector('.story-manuscript', { timeout: 3000 }).catch(() => {});

      const targetPath = path.resolve(__dirname, '..', p.out);
      await page.pdf({
        path: targetPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' }
      });
      console.log('Wrote:', targetPath);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
