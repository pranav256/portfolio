import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString } from 'mdast-util-to-string';

const base = process.env.SITE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const results = [];
const browserErrors = [];
page.on('pageerror', error => browserErrors.push(error.message));

async function check(name, action) {
  const started = Date.now();
  try {
    await action();
    results.push({ name, passed: true, durationMs: Date.now() - started });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.stack });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function resultCount(count) {
  await page.waitForFunction(expected => document.querySelectorAll('.post-list .post-link').length === expected, count);
}

try {
  await check('Blog navigation has link semantics and an active Writing location', async () => {
    await page.goto(`${base}/blog`);
    await page.getByRole('searchbox', { name: 'Search notes' }).waitFor();
    assert.equal(await page.locator('header.site-header a[href="/blog"]').getAttribute('role'), 'link');
    assert.equal(await page.locator('header.site-header a[href="/blog"]').getAttribute('aria-current'), 'page');
    await resultCount(3);
  });

  await check('Search matches article body text and persists in the URL', async () => {
    await page.getByRole('searchbox').fill('AES-256-GCM');
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.waitForURL('**/blog?q=AES-256-GCM');
    await resultCount(1);
    assert.equal(await page.locator('.post-list h2').innerText(), 'Local first, by design.');
  });

  await check('Combined filters, empty results, and Back/Forward stay synchronized', async () => {
    await page.getByRole('button', { name: 'Building', exact: true }).click();
    await page.getByText('No notes found.', { exact: true }).waitFor();
    await resultCount(0);
    assert.equal(new URL(page.url()).searchParams.get('category'), 'building');
    await page.goBack();
    await resultCount(1);
    assert.equal(await page.getByRole('searchbox').inputValue(), 'AES-256-GCM');
    await page.goForward();
    await page.getByText('No notes found.', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Building', exact: true }).getAttribute('aria-pressed'), 'true');
  });

  await check('Reset restores all posts and returns focus to search', async () => {
    await page.getByRole('button', { name: 'Show all notes', exact: true }).click();
    await resultCount(3);
    assert.equal(new URL(page.url()).search, '');
    assert.equal(await page.getByRole('searchbox').inputValue(), '');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'note-search');
  });

  await check('Shared queries are case insensitive; article navigation retains filters on Back', async () => {
    await page.goto(`${base}/blog?q=NONCES&category=SYSTEMS`);
    await resultCount(1);
    await page.getByRole('link', { name: /^Local first, by design/ }).click();
    await page.waitForURL('**/blog/local-first-by-design');
    await page.getByRole('heading', { level: 1, name: 'Local first, by design.' }).waitFor();
    await page.goBack();
    await resultCount(1);
    assert.equal(await page.getByRole('searchbox').inputValue(), 'NONCES');
    assert.equal(await page.getByRole('button', { name: 'Systems', exact: true }).getAttribute('aria-pressed'), 'true');
  });

  await check('Unknown categories have a recoverable empty state', async () => {
    await page.goto(`${base}/blog?category=unlisted`);
    await page.getByText('No notes found.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await resultCount(3);
  });

  await check('Table of contents links resolve to article headings', async () => {
    await page.goto(`${base}/blog/an-api-can-be-a-file`);
    const links = await page.getByRole('navigation', { name: 'On this page' }).getByRole('link').evaluateAll(items => items.map(item => item.hash));
    assert.equal(links.length, 4);
    for (const hash of links) assert.equal(await page.locator(hash).count(), 1, `Missing ${hash}`);
    await page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Freshness is part of the interface' }).click();
    assert.equal(new URL(page.url()).hash, '#freshness-is-part-of-the-interface');
  });

  await check('Code copying writes the exact displayed content', async () => {
    const expected = await page.locator('pre code').first().innerText();
    await page.getByRole('button', { name: 'Copy code', exact: true }).first().click();
    await page.getByRole('button', { name: 'Copied', exact: true }).waitFor();
    // Windows clipboard APIs normalize LF to CRLF; preserve the logical text.
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(copied.replace(/\r\n/g, '\n'), expected);
  });

  await check('Clipboard rejection gives an honest recovery message', async () => {
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('Clipboard denied for verification'); } },
    }));
    await page.getByRole('button', { name: 'Copy code', exact: true }).last().click();
    await page.getByText('Couldn’t copy. Select the code and copy it manually.', { exact: true }).waitFor();
  });

  await check('Markdown download preserves frontmatter and content', async () => {
    const response = await context.request.get(`${base}/blog/an-api-can-be-a-file/source`);
    assert.equal(response.status(), 200);
    assert.match(response.headers()['content-type'], /text\/markdown/);
    assert.match(response.headers()['content-disposition'], /attachment; filename="an-api-can-be-a-file.md"/);
    assert.match(await response.text(), /date: "2026-11-05"/);
    assert.match(await response.text(), /## Freshness is part of the interface/);
    assert.equal((await context.request.get(`${base}/blog/missing-note/source`)).status(), 404);
  });

  await check('RSS is valid XML with all three dated articles', async () => {
    const response = await context.request.get(`${base}/feed.xml`);
    assert.equal(response.status(), 200);
    assert.match(response.headers()['content-type'], /application\/rss\+xml/);
    const feed = await page.evaluate(text => {
      const document = new DOMParser().parseFromString(text, 'application/xml');
      return {
        parseError: !!document.querySelector('parsererror'),
        items: [...document.querySelectorAll('item')].map(item => ({ title: item.querySelector('title').textContent, url: item.querySelector('link').textContent, date: item.querySelector('pubDate').textContent })),
      };
    }, await response.text());
    assert.equal(feed.parseError, false);
    assert.equal(feed.items.length, 3);
    assert.equal(feed.items[0].title, 'An API can be a file.');
    assert.ok(feed.items.every(item => item.url.startsWith('http') && item.date.includes('05 Nov 2026')));
  });

  await check('Every Markdown paragraph, heading, list, and code example reaches its article', async () => {
    for (const slug of ['an-api-can-be-a-file', 'local-first-by-design', 'small-tools-long-half-lives']) {
      const { content, data } = matter(await readFile(`content/posts/${slug}.md`, 'utf8'));
      const tree = unified().use(remarkParse).parse(content);
      const response = await page.goto(`${base}/blog/${slug}`);
      assert.equal(response.status(), 200);
      assert.equal(await page.getByRole('heading', { level: 1 }).innerText(), data.title);
      // Markdown lists concatenate nodes; HTML inserts layout whitespace. Compare content independently of that formatting.
      const rendered = (await page.locator('.prose').textContent()).replace(/\s+/g, '');
      for (const node of tree.children) {
        const expected = toString(node).replace(/\s+/g, ' ').trim();
        if (expected) assert.ok(rendered.includes(expected.replace(/\s+/g, '')), `${slug} omitted: ${expected.slice(0, 80)}`);
      }
      assert.equal(await page.locator('.related-posts .post-link').count(), 2);
    }
  });

  await check('Missing pages and notes return 404 with working recovery links', async () => {
    for (const route of ['/missing-page', '/blog/missing-note']) {
      const response = await page.goto(`${base}${route}`);
      assert.equal(response.status(), 404);
      await page.getByRole('heading', { level: 1, name: 'Page not found.' }).waitFor();
      assert.equal(await page.getByRole('link', { name: 'Back to home', exact: true }).getAttribute('href'), '/');
      assert.equal(await page.getByRole('link', { name: 'Browse writing', exact: true }).getAttribute('href'), '/blog');
    }
  });

  await check('Page metadata, social image, sitemap, and robots resolve locally', async () => {
    await page.goto(`${base}/blog/an-api-can-be-a-file`);
    assert.equal(await page.title(), 'An API can be a file. — Pranav');
    assert.match(await page.locator('link[rel="canonical"]').getAttribute('href'), /\/blog\/an-api-can-be-a-file$/);
    assert.equal(await page.locator('meta[property="og:type"]').getAttribute('content'), 'article');
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    assert.equal((await context.request.get(image)).status(), 200);
    const sitemap = await context.request.get(`${base}/sitemap.xml`);
    assert.equal(sitemap.status(), 200);
    assert.equal((await sitemap.text()).match(/<loc>/g)?.length, 5);
    assert.match(await (await context.request.get(`${base}/robots.txt`)).text(), /Sitemap: http/);
    assert.equal((await context.request.get(`${base}/icon.svg`)).status(), 200);
  });

  await check('Keyboard skip link reaches the main content and work action', async () => {
    await page.goto(base);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Skip to content');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'main');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Explore my work');
    assert.ok(await page.evaluate(() => document.activeElement.matches(':focus-visible')));
    await page.keyboard.press('Enter');
    await page.waitForURL('**/#work');
    await page.waitForFunction(() => document.getElementById('work').getBoundingClientRect().top < innerHeight);
  });

  await check('Portfolio, writing index, and complete essays remain readable without JavaScript', async () => {
    const plainContext = await browser.newContext({ javaScriptEnabled: false });
    try {
      const plainPage = await plainContext.newPage();
      for (const route of ['/', '/blog', '/blog/local-first-by-design']) {
        assert.equal((await plainPage.goto(`${base}${route}`)).status(), 200);
        assert.equal(await plainPage.locator('h1').count(), 1);
        if (route === '/') assert.equal(await plainPage.locator('.project-link').count(), 3);
        if (route === '/blog') assert.equal(await plainPage.locator('.post-link').count(), 3);
        if (route.startsWith('/blog/')) assert.match(await plainPage.locator('.prose').innerText(), /Local storage changes the responsibility/);
      }
    } finally { await plainContext.close(); }
  });

  await check('No uncaught browser errors during the tested flows', async () => assert.deepEqual(browserErrors, []));
} finally {
  await browser.close();
  await mkdir('docs/verification', { recursive: true });
  const buildId = await readFile('.next/BUILD_ID', 'utf8').catch(() => 'development');
  await writeFile('docs/verification/behavior.json', JSON.stringify({ checkedAt: new Date().toISOString(), buildId: buildId.trim(), base, results }, null, 2) + '\n');
}

if (results.some(result => !result.passed)) process.exitCode = 1;
