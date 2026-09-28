import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.SITE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const panels = [];
const pageFirstViews = [];

async function collect(selector, name, headlineSelector = 'h1,h2,h3', surface = 'screen') {
  const extracted = await page.locator(selector).evaluateAll((elements, options) => elements.map((element, index) => {
    const visible = node => node.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    const normalize = text => text.replace(/\s+/g, ' ').trim();
    const heading = element.querySelector(options.headlineSelector);
    const links = [...element.querySelectorAll('a,button')].filter(visible).filter(node => !node.closest('[role="group"]'));
    const actions = links.map(node => normalize(node.innerText));
    const projectAction = element.querySelector('.project-cta');
    if (projectAction) actions.push(normalize(projectAction.innerText));
    const fragments = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!node.textContent.trim() || !visible(parent)) continue;
      if (parent.closest('[aria-hidden="true"],.sr-only,script,style')) continue;
      if (heading?.contains(node) || projectAction?.contains(node) || links.some(link => link.contains(node))) continue;
      fragments.push(normalize(node.textContent));
    }
    // A linked article title is both the panel heading and its only action.
    if (element.matches('a')) actions.push(normalize(heading?.innerText || element.innerText));
    return {
      screen: `${options.name}${elements.length > 1 ? ` ${index + 1}` : ''}`,
      headline: normalize(heading?.innerText || ''),
      body: fragments,
      actions,
      surface: options.surface,
      route: location.pathname + location.search,
      selector: options.selector,
    };
  }), { selector, name, headlineSelector, surface });
  panels.push(...extracted);
}

try {
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await collect('.site-header', 'Primary navigation', '.wordmark');
  await collect('.site-footer', 'Footer navigation', '.footer-credit');
  await collect('.hero-copy', 'Home introduction');
  await collect('.work-section .section-heading', 'Selected work introduction');
  await collect('.project-information', 'Project preview');
  await collect('.experiments-heading', 'Experiment index heading');
  await collect('.experiments-table tbody tr', 'Experiment entry', 'td:first-child', 'document');
  await collect('.about-copy', 'About');
  await collect('.journey', 'Project journey', 'h3', 'document');
  await collect('.writing-section .section-heading', 'Recent writing heading');
  await collect('.writing-section .post-link', 'Recent note preview');
  await collect('.contact-section', 'Contact');

  for (const [route, name] of [
    ['/blog', 'All writing'],
    ['/blog?q=NONCES&category=systems', 'Filtered writing'],
    ['/blog?q=unlisted', 'Empty search'],
    ['/blog?category=unlisted', 'Unknown category'],
  ]) {
    await page.goto(base + route);
    await page.getByRole('searchbox').waitFor();
    await collect('.blog-intro', `${name} introduction`);
    await collect('.writing-tools', `${name} search and categories`, 'label');
    await collect('.results-summary', `${name} result status`, 'p');
    await collect('.post-link', `${name} note`);
    await collect('.search-empty', `${name} recovery`, 'p');
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/blog/an-api-can-be-a-file`);
  await page.locator('.article-outline-mobile summary').click();
  await collect('.article-outline-mobile', 'Expanded article outline', 'summary', 'document');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async () => { throw new Error('Denied for review'); } },
  }));
  await page.getByRole('button', { name: 'Copy code', exact: true }).first().click();
  await page.getByText('Couldn’t copy. Select the code and copy it manually.', { exact: true }).waitFor();
  await collect('.code-copy:has(.copy-error)', 'Clipboard failure', '.copy-error');

  for (const route of ['/', '/blog', '/blog?q=NONCES&category=systems', '/blog?q=unlisted', '/blog?category=unlisted', '/missing-page']) {
    for (const width of [390, 1440, 1728]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(base + route);
      if (route.startsWith('/blog')) await page.getByRole('searchbox').waitFor();
      await page.evaluate(() => document.fonts.ready);
      const copy = await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const fragments = [];
        const groups = new Set();
        let node;
        while ((node = walker.nextNode())) {
          const parent = node.parentElement;
          if (!node.textContent.trim() || parent.closest('[aria-hidden="true"],.sr-only,script,style')) continue;
          if (!parent.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          if (![...range.getClientRects()].some(box => box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth)) continue;
          fragments.push(node.textContent.replace(/\s+/g, ' ').trim());
          groups.add(parent.closest('h1,h2,h3,p,a,button,label,summary,time') || parent);
        }
        return { fragments, words: fragments.join(' ').split(/\s+/).length, fragmentCount: groups.size };
      });
      pageFirstViews.push({ route, width, ...copy });
    }
  }
} finally {
  await browser.close();
}

await mkdir('.better-design/evidence', { recursive: true });
await writeFile('.better-design/evidence/copy-panels.json', JSON.stringify({ capturedAt: new Date().toISOString(), base, panels, pageFirstViews }, null, 2) + '\n');
console.log(`Captured the visible copy of ${panels.length} panels.`);
console.log(`Whole-page first views: ${Math.max(...pageFirstViews.map(view => view.words))} words and ${Math.max(...pageFirstViews.map(view => view.fragmentCount))} text groups at most.`);
