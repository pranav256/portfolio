import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';

const targets = {
  'andreas-vision': 'https://andreas.vision/',
  'daiki-fujita': 'https://daikifujita.com/',
  'ysuria': 'https://ysuriadesign.co/',
  'vadim-carazan': 'https://vadimcarazan.com/',
  'griflan-labs': 'https://labs.griflan.com/',
};
const browser = await chromium.launch({
  headless: true,
  args: ['--enable-unsafe-webgpu'],
  ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
});
for (const slug of process.argv.slice(2)) {
  const folder = `research/references/${slug}`;
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const failedRequests = [];
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  const result = { slug, url: targets[slug], capturedAt: new Date().toISOString(), errors, failedRequests, screenshots: [] };
  try {
    await page.goto(targets[slug], { waitUntil: 'domcontentloaded', timeout: 45000 });
    console.log(`${slug}: document loaded; waiting for scene`);
    await page.waitForTimeout(22000);
    const controls = await page.locator('button,a,[role="button"]').evaluateAll(elements => elements.map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0,100), cls: el.className })).slice(0,30));
    console.log(JSON.stringify({slug, controls}));
    if (slug === 'daiki-fujita' || slug === 'ysuria') {
      const entry = page.getByText(slug === 'ysuria' ? /^enter muted$/i : /^\[?\s*enter\s*\]?$/i).first();
      if (await entry.count()) {
        await entry.dispatchEvent('click');
        result.entryAction = await entry.textContent().catch(() => 'Enter');
        await page.waitForTimeout(10000);
      }
    }
    result.text = await page.locator('body').innerText();
    result.styles = await page.evaluate(() => {
      const pick = el => { const s = getComputedStyle(el); return { tag: el.tagName, fontFamily: s.fontFamily, fontSize: s.fontSize, color: s.color, background: s.backgroundColor, cursor: s.cursor, transition: s.transition }; };
      return { body: pick(document.body), headings: [...document.querySelectorAll('h1,h2,h3')].slice(0,8).map(pick), cursors: [...document.querySelectorAll('[class*="cursor"],[id*="cursor"]')].slice(0,8).map(pick) };
    });
    result.status = /this site needs webgpu/i.test(result.text) ? 'browser-feature-fallback' : 'captured';
    await page.screenshot({ path: `${folder}/settled-desktop.jpg`, type: 'jpeg', quality: 85, timeout: 18000 });
    result.screenshots.push('settled-desktop.jpg');
    for (let index=1; index<=3; index++) {
      await page.mouse.move(1100,650);
      await page.mouse.wheel(0, index===1 ? 900 : 1800);
      await page.waitForTimeout(1800);
      const file = `settled-scroll-${index}.jpg`;
      await page.screenshot({ path: `${folder}/${file}`, type: 'jpeg', quality: 80, timeout: 18000 });
      result.screenshots.push(file);
    }
    console.log(`${slug}: ${result.status}`);
  } catch (error) {
    result.status = 'partial';
    errors.push(error.message);
    console.log(`${slug}: ${error.message.split('\n')[0]}`);
  }
  await writeFile(`${folder}/settled-observation.json`, JSON.stringify(result,null,2)+'\n');
  await page.close();
}
await browser.close();
