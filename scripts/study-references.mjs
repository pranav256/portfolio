import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('research/references');
const sites = [
  ['andreas-vision', 'https://andreas.vision/'],
  ['beige-zone', 'https://www.beige.zone/'],
  ['griflan-labs', 'https://labs.griflan.com/'],
  ['daiki-fujita', 'https://daikifujita.com/'],
  ['webdrift', 'https://www.webdrift.be/en'],
  ['endcap', 'https://endcap.design/'],
  ['ysuria', 'https://ysuriadesign.co/'],
  ['nader', 'https://nader.io/'],
  ['1stdecember', 'https://1stdecember.com/'],
  ['vadim-carazan', 'https://vadimcarazan.com/'],
  ['suho-studio', 'https://suho.studio/'],
  ['awwwards-portfolios', 'https://www.awwwards.com/websites/portfolio/'],
];
const viewport = { width: 1440, height: 1000 };

await mkdir(root, { recursive: true });
let browser;
try {
  browser = process.env.BROWSER_CDP_URL
    ? await chromium.connectOverCDP(process.env.BROWSER_CDP_URL)
    : await chromium.launch({
        headless: true,
        chromiumSandbox: true,
        ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
        ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } } : {}),
      });
} catch (error) {
  const manifest = {
    attemptedAt: new Date().toISOString(), viewport, status: 'browser-blocked',
    error: error.message,
    sites: sites.map(([slug, url]) => ({ slug, url, status: 'not-opened', screenshots: [] })),
  };
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.error('Browser could not launch. No site has been marked as studied. See research/references/manifest.json.');
  process.exit(1);
}

const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
const results = [];
async function study([slug, url]) {
  const page = await context.newPage();
  const folder = path.join(root, slug);
  await mkdir(folder, { recursive: true });
  const record = { slug, url, attemptedAt: new Date().toISOString(), viewport, status: 'unavailable', screenshots: [], errors: [] };
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
    record.httpStatus = response?.status();
    await page.waitForTimeout(3000);
    record.title = await page.title();
    record.status = /just a moment|access denied|checking your browser|security verification/i.test(record.title)
      ? 'challenge' : response?.ok() ? 'loaded' : 'http-error';
    await page.screenshot({ path: path.join(folder, 'desktop.jpg'), type: 'jpeg', quality: 85 });
    record.screenshots.push('desktop.jpg');
    record.styles = await page.evaluate(() => {
      const pick = (element) => {
        const css = getComputedStyle(element);
        return { tag: element.tagName, fontFamily: css.fontFamily, fontSize: css.fontSize, fontWeight: css.fontWeight,
          lineHeight: css.lineHeight, color: css.color, background: css.backgroundColor,
          cursor: css.cursor, transition: css.transition, animation: css.animationName, transform: css.transform };
      };
      const palette = [...document.querySelectorAll('body,header,main,section,footer,a,button,h1,h2')]
        .slice(0, 120).flatMap(el => { const s = getComputedStyle(el); return [s.color, s.backgroundColor]; });
      return { body: pick(document.body), headings: [...document.querySelectorAll('h1,h2,h3')].slice(0, 10).map(pick),
        links: [...document.querySelectorAll('a,button')].slice(0, 8).map(pick),
        palette: [...new Set(palette)], canvasCount: document.querySelectorAll('canvas').length,
        svgCount: document.querySelectorAll('svg').length, height: document.documentElement.scrollHeight };
    });
    const height = record.styles.height;
    for (let y = 650; y < Math.min(height, 20000); y += 650) {
      await page.evaluate(y => window.scrollTo(0, y), y);
      await page.waitForTimeout(250);
    }
    for (let i = 1; i <= 3; i++) {
      await page.evaluate(y => window.scrollTo(0, y), Math.max(0, (height - viewport.height) * i / 3));
      await page.waitForTimeout(650);
      const file = `scroll-${String(i).padStart(2, '0')}.jpg`;
      await page.screenshot({ path: path.join(folder, file), type: 'jpeg', quality: 80 });
      record.screenshots.push(file);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    if (height < 20000) {
      await page.screenshot({ path: path.join(folder, 'full-page.jpg'), fullPage: true, type: 'jpeg', quality: 75 });
      record.screenshots.push('full-page.jpg');
    }
    const link = page.locator('a').first();
    if (await link.count()) {
      await link.hover({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(350);
      record.hover = await link.evaluate(el => { const s = getComputedStyle(el); return { color: s.color, cursor: s.cursor, transform: s.transform, transition: s.transition }; });
      await page.screenshot({ path: path.join(folder, 'hover.jpg'), type: 'jpeg', quality: 80 });
      record.screenshots.push('hover.jpg');
    }
  } catch (error) {
    record.errors.push(error.message);
    await page.screenshot({ path: path.join(folder, 'unavailable-desktop.jpg'), type: 'jpeg', quality: 65 })
      .then(() => record.screenshots.push('unavailable-desktop.jpg')).catch(() => {});
  }
  await writeFile(path.join(folder, 'observation.json'), JSON.stringify(record, null, 2) + '\n');
  results.push(record);
  console.log(`${slug}: ${record.status}`);
  await page.close();
}
for (let i = 0; i < sites.length; i += 3) await Promise.all(sites.slice(i, i + 3).map(study));
await writeFile(path.join(root, 'manifest.json'), JSON.stringify({ browser: await browser.version(), capturedAt: new Date().toISOString(), results }, null, 2) + '\n');
await browser.close();
if (results.some(result => result.status !== 'loaded')) process.exitCode = 1;
