const fs = require('fs');
const http = require('http');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png'
};

function startLocalServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filePath = path.resolve(root, `.${pathname}`);
    if (!filePath.startsWith(root + path.sep) && filePath !== root) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    fs.readFile(filePath, (error, contents) => {
      if (error) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
      response.end(contents);
    });
  });

  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function generate() {
  const server = await startLocalServer();
  const { port } = server.address();
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    await page.goto(`http://127.0.0.1:${port}/jack-o-lantern.html`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.querySelectorAll('.story-manuscript p').length > 10, { timeout: 10000 });
    await page.evaluate(() => {
      const content = document.querySelector('.story-hero__content');
      const brand = document.createElement('p');
      brand.className = 'pdf-brand';
      brand.innerHTML = '<span aria-hidden="true">✦</span> CAMPFIRE HORROR TALES';
      content.prepend(brand);

      const link = document.createElement('a');
      link.className = 'pdf-site-link';
      link.href = 'https://www.campfirehorrortales.com/jack-o-lantern.html';
      link.textContent = 'Read more tales at campfirehorrortales.com';
      content.append(link);
    });

    await page.addStyleTag({ content: `
      @page { size: A4; margin: 18mm 19mm 20mm; }
      @page:first { margin: 0; }
      @media print {
        :root { color-scheme: light; }
        body { background: #f3eee4 !important; color: #211d18 !important; }
        .site-header, .site-footer, .story-end, .skip-link { display: none !important; }
        .story-hero--lantern {
          box-sizing: border-box; display: flex !important; flex-direction: column !important;
          width: 210mm; height: 297mm; min-height: 0 !important; margin: 0; padding: 17mm 17mm 15mm;
          justify-content: center; gap: 9mm; overflow: hidden; background: #090a0d !important;
          break-after: page; page-break-after: always;
        }
        .story-hero--lantern::before, .story-hero--lantern .story-hero__art::after { display: none !important; }
        .story-hero--lantern .story-hero__art { position: relative !important; inset: auto !important; order: 0; width: 100%; }
        .story-hero--lantern .story-hero__art img {
          position: static !important; display: block; width: 100%; height: auto; max-height: none;
          object-fit: contain !important; filter: none !important;
        }
        .story-hero--lantern .story-hero__content {
          position: relative !important; inset: auto !important; order: 1; width: 100%; max-width: none;
          padding: 0 !important; background: transparent !important; color: #f5ead5 !important;
        }
        .story-hero--lantern .eyebrow { color: #d99a3d !important; }
        .story-hero--lantern h1 { margin: 3mm 0; color: #f5ead5 !important; font-size: 35pt; }
        .story-hero--lantern .story-hero__tagline { margin: 0; max-width: 40ch; color: #e4c291 !important; font-size: 15pt; }
        .pdf-brand { margin: 0 0 3mm; color: #d99a3d; font: 700 10pt Georgia, serif; letter-spacing: .16em; }
        .pdf-brand span { margin-right: 2mm; color: #ed8b26; font-size: 15pt; }
        .pdf-site-link { display: inline-block; margin-top: 7mm; color: #e7bd79 !important; font: 10pt Arial, sans-serif; text-decoration: none; }
        .story-read { display: block !important; margin: 0 !important; padding: 0 !important; background: transparent !important; }
        .story-read__content { max-width: none !important; margin: 0 !important; padding: 0 !important; }
        .story-read__content > .eyebrow, .story-read__content > h1 { display: none !important; }
        .story-manuscript { max-width: none !important; padding: 0 !important; color: #211d18 !important; font: 11.5pt/1.72 Georgia, 'Times New Roman', serif !important; }
        .story-manuscript p { margin: 0 0 1.1em !important; color: #211d18 !important; orphans: 3; widows: 3; }
        .story-manuscript h1, .story-manuscript h2, .story-manuscript h3 { color: #5c3516 !important; break-after: avoid; }
        .story-manuscript a[href]::after { content: none !important; }
        a { color: inherit; }
      }
    ` });

    const output = path.join(root, 'assets', 'pdfs', 'jack-o-lantern.pdf');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    await page.pdf({ path: output, format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
    console.log(`Wrote: ${output}`);
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
