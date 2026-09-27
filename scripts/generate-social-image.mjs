import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';

const base = new URL(process.env.SITE_URL || 'http://127.0.0.1:3000').origin;
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'networkidle' });
  const art = await page.locator('.workbench-art').evaluate(element => element.outerHTML);
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return ['--background', '--foreground', '--primary', '--primary-foreground', '--accent', '--card', '--border', '--muted-foreground', '--font-mono']
      .map(name => `${name}:${style.getPropertyValue(name)};`).join('');
  });
  const fonts = await readFile('app/fonts.css', 'utf8');
  await page.setContent(`<!doctype html><html lang="en"><head><base href="${base}/"><style>
    ${fonts}
    :root { ${tokens} }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 2.5rem 3.5rem; color: var(--foreground); background: var(--background); }
    header { display: flex; align-items: center; justify-content: space-between; border-bottom: 0.0625rem solid var(--border); padding-bottom: 1.5rem; }
    .brand { font: 500 2rem Fraunces, serif; letter-spacing: -0.05em; }
    .brand span { color: var(--primary); }
    .address { font: 0.875rem Inter, sans-serif; color: var(--muted-foreground); }
    main { display: grid; grid-template-columns: 1.1fr 1fr; align-items: center; gap: 0.5rem; padding-top: 2rem; }
    h1 { font: 450 5rem/1.08 Fraunces, serif; letter-spacing: -0.05em; margin: 0; }
    em { color: var(--primary); }
    p { font: 1.125rem/1.7 Inter, sans-serif; margin: 2rem 0 0; color: var(--muted-foreground); }
    svg { display: block; width: 100%; height: auto; }
  </style></head><body>
    <header><div class="brand">Pranav<span>.</span></div><div class="address">pranav256 on GitHub</div></header>
    <main><div><h1>I turn curiosity<br><em>into code.</em></h1><p>Open-source tools, web experiments,<br>and notes on building.</p></div><div>${art}</div></main>
  </body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'app/opengraph-image.png', animations: 'disabled' });
  await writeFile('app/opengraph-image.alt.txt', 'Pranav — open-source tools, web experiments, and notes on building, beside an illustrated workbench.\n');
  console.log('Generated 1200 × 630 social image from the site’s original art, palette, and fonts.');
} finally { await browser.close(); }
