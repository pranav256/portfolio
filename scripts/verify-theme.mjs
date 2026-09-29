import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.SITE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const results = [];
const errors = [];
const context = await browser.newContext({ colorScheme: 'light' });
context.on('page', page => {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
});
const page = await context.newPage();
const isDark = page => page.evaluate(() => document.documentElement.classList.contains('dark'));
async function check(name, action) {
  try {
    await action();
    results.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.stack });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
try {
  await check('First visit uses dark even when the operating system prefers light', async () => {
    await page.goto(base);
    await page.getByRole('button', { name: 'Switch to light mode' }).waitFor();
    assert.equal(await isDark(page), true);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'dark');
  });
  await check('Keyboard switching keeps focus and geometry, with the correct outcome label', async () => {
    const toggle = page.getByRole('button', { name: 'Switch to light mode' });
    await page.keyboard.press('Tab');
    await toggle.focus();
    const before = await toggle.boundingBox();
    assert.ok(await toggle.evaluate(el => el.matches(':focus-visible')));
    assert.ok(before.width >= 44 && before.height >= 44);
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Switch to dark mode' }).waitFor();
    assert.equal(await isDark(page), false);
    assert.equal(await page.evaluate(() => localStorage.getItem('pranav-theme')), 'light');
    await page.waitForFunction(() => !document.documentElement.classList.contains('theme-switching'));
    assert.deepEqual(await page.locator('.theme-toggle').boundingBox(), before);
    assert.ok(await page.locator('.theme-toggle').evaluate(el => el === document.activeElement && el.matches(':focus-visible')));
  });
  await check('Light preference survives navigation, reload, and an opposite system preference', async () => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.getByRole('link', { name: 'Writing', exact: true }).click();
    await page.waitForURL('**/blog');
    assert.equal(await isDark(page), false);
    await page.reload();
    await page.getByRole('button', { name: 'Switch to dark mode' }).waitFor();
    assert.equal(await isDark(page), false);
  });
  await check('Saved light is applied before hydration when application JavaScript is blocked', async () => {
    const fresh = await context.newPage();
    try {
      await fresh.route('**/_next/**/*.js*', route => route.abort());
      await fresh.goto(base, { waitUntil: 'domcontentloaded' });
      assert.equal(await isDark(fresh), false);
      assert.equal(await fresh.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'light');
      assert.equal(await fresh.getByRole('button', { name: 'Switch to dark mode' }).count(), 1);
    } finally { await fresh.close(); }
    // Intentionally aborted scripts are expected network errors, not app errors.
    errors.splice(0, errors.length, ...errors.filter(message => !/net::ERR_FAILED/.test(message)));
  });
  await check('Other tabs synchronize changes and clearing the saved preference restores dark', async () => {
    const other = await context.newPage();
    try {
      await other.goto(base);
      await other.getByRole('button', { name: 'Switch to dark mode' }).waitFor();
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();
      await other.getByRole('button', { name: 'Switch to light mode' }).waitFor();
      await other.getByRole('button', { name: 'Switch to light mode' }).click();
      await page.getByRole('button', { name: 'Switch to dark mode' }).waitFor();
      await other.evaluate(() => localStorage.removeItem('pranav-theme'));
      await page.getByRole('button', { name: 'Switch to light mode' }).waitFor();
    } finally { await other.close(); }
  });
  await check('Blocked storage still permits switching and navigation without errors', async () => {
    const denied = await browser.newContext();
    const localErrors = [];
    try {
      await denied.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }));
      const tab = await denied.newPage();
      tab.on('pageerror', error => localErrors.push(error.message));
      await tab.goto(base);
      await tab.getByRole('button', { name: 'Switch to light mode' }).click();
      assert.equal(await isDark(tab), false);
      await tab.getByRole('link', { name: 'Writing', exact: true }).click();
      await tab.waitForURL('**/blog');
      assert.equal(await isDark(tab), false);
      await tab.getByRole('button', { name: 'Switch to dark mode' }).click();
      assert.equal(await isDark(tab), true);
      assert.deepEqual(localErrors, []);
    } finally { await denied.close(); }
  });
  await check('Both themes preserve complete page content', async () => {
    for (const route of ['/', '/blog', '/blog/an-api-can-be-a-file', '/blog/local-first-by-design', '/blog/small-tools-long-half-lives', '/missing-page']) {
      await page.goto(`${base}${route}`);
      const before = await page.locator('main').innerText();
      await page.locator('.theme-toggle').click();
      assert.equal(await page.locator('main').innerText(), before, route);
    }
  });
  await check('No JavaScript still renders dark readable pages with no inert theme button', async () => {
    const plain = await browser.newContext({ javaScriptEnabled: false });
    try {
      const tab = await plain.newPage();
      await tab.goto(`${base}/blog/an-api-can-be-a-file`);
      assert.equal(await tab.locator('html').getAttribute('class'), 'dark');
      assert.equal(await tab.locator('.theme-toggle').isVisible(), false);
      assert.ok((await tab.locator('.prose').innerText()).length > 500);
    } finally { await plain.close(); }
  });
  await check('No hydration or uncaught errors in theme interactions', async () => {
    assert.deepEqual(errors.filter(message => !/404 \(Not Found\)/.test(message)), []);
  });
} finally {
  await browser.close();
  await mkdir('test-results', { recursive: true });
  await writeFile('test-results/theme.json', JSON.stringify({ checkedAt: new Date().toISOString(), buildId: (await readFile('.next/BUILD_ID', 'utf8')).trim(), base, results }, null, 2) + '\n');
}
if (results.some(result => !result.passed)) process.exitCode = 1;
