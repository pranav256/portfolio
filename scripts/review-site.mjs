import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.SITE_URL || 'http://127.0.0.1:3000';
const theme = process.env.REVIEW_THEME || 'dark';
assert.ok(['dark', 'light'].includes(theme), 'REVIEW_THEME must be dark or light');
const screenshots = `test-results/screenshots/${theme}`;
const scenarios = [
  { name: 'home', route: '/' },
  { name: 'theme-toggle-hover', route: '/', themeHover: true },
  { name: 'theme-toggle-focus', route: '/', themeFocus: true },
  { name: 'home-project-hover', route: '/', projectHover: true },
  { name: 'home-project-focus', route: '/', projectFocus: true },
  { name: 'blog', route: '/blog' },
  { name: 'blog-search-focus', route: '/blog', searchFocus: true },
  { name: 'blog-filtered', route: '/blog?q=NONCES&category=systems' },
  { name: 'blog-empty', route: '/blog?q=unlisted' },
  { name: 'blog-unknown-category', route: '/blog?category=unlisted' },
  { name: 'article-api', route: '/blog/an-api-can-be-a-file' },
  { name: 'article-outline-open', route: '/blog/an-api-can-be-a-file', outlineOpen: true },
  { name: 'article-clipboard-error', route: '/blog/an-api-can-be-a-file', clipboardError: true },
  { name: 'article-local', route: '/blog/local-first-by-design' },
  { name: 'article-small-tools', route: '/blog/small-tools-long-half-lives' },
  { name: 'not-found', route: '/missing-page', status: 404 },
];
const requested = process.argv.slice(2);
const selected = requested.length ? scenarios.filter(scenario => requested.includes(scenario.name)) : scenarios;
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const results = [];
await mkdir(screenshots, { recursive: true });

async function openScenario(page, scenario) {
  await page.addInitScript(theme => localStorage.setItem('pranav-theme', theme), theme);
  const response = await page.goto(new URL(scenario.route, base).href, { waitUntil: 'domcontentloaded' });
  await page.locator('h1').waitFor();
  if (scenario.route.split('?')[0] === '/blog') await page.getByRole('searchbox', { name: 'Search notes' }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  if (scenario.outlineOpen) {
    const summary = page.locator('.article-outline-mobile summary');
    if (await summary.isVisible()) await summary.click();
  }
  if (scenario.clipboardError) {
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('Denied for verification'); } },
    }));
    await page.getByRole('button', { name: 'Copy code', exact: true }).first().click();
    await page.getByText('Couldn’t copy. Select the code and copy it manually.', { exact: true }).waitFor();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  if (scenario.projectHover || scenario.projectFocus) {
    const project = page.locator('.project-link').first();
    await project.scrollIntoViewIfNeeded();
    if (scenario.projectHover) await project.hover();
    if (scenario.projectFocus) {
      await page.keyboard.press('Tab');
      await project.focus();
    }
    await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running'));
  }
  if (scenario.searchFocus) await page.getByRole('searchbox').focus();
  if (scenario.themeHover) await page.locator('.theme-toggle').hover();
  if (scenario.themeFocus) {
    await page.keyboard.press('Tab');
    await page.locator('.theme-toggle').focus();
  }
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running'));
  return response.status();
}

try {
  for (const scenario of selected) {
    for (const width of [390, 1440, 1728]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: scenario.projectHover || scenario.projectFocus ? 'no-preference' : 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        const status = await openScenario(page, scenario);
        assert.equal(status, scenario.status || 200);
        const name = `${scenario.name}-${width}`;
        const evidence = await page.evaluate(() => {
          const visible = element => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
          const normalize = text => text.replace(/\s+/g, ' ').trim();
          const firstView = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
          const fragments = [];
          let node;
          while ((node = firstView.nextNode())) {
            if (!node.textContent.trim() || node.parentElement.closest('[aria-hidden="true"], .sr-only, script, style')) continue;
            if (!visible(node.parentElement)) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            const boxes = [...range.getClientRects()];
            if (boxes.some(box => box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth)) fragments.push(normalize(node.textContent));
          }
          const main = document.querySelector('main');
          const sections = [...main.querySelectorAll(':scope > section, :scope > header, :scope > article')].map((section, index) => ({
            id: section.id || `section-${index}`,
            headline: section.querySelector('h1,h2,h3')?.innerText || '',
            paragraphs: [...section.querySelectorAll('p')].map(p => normalize(p.textContent)),
            actions: [...section.querySelectorAll('a,button')].filter(visible).filter(el => !el.closest('nav,[role="group"]')).map(el => normalize(el.textContent)),
          }));
          return {
            title: document.title,
            headline: normalize(document.querySelector('h1').innerText),
            text: document.querySelector('main').innerText,
            firstView: { fragments, words: fragments.join(' ').split(/\s+/).length, fragmentCount: fragments.length },
            sections,
            overflow: document.documentElement.scrollWidth > innerWidth,
            bodyFont: getComputedStyle(document.body).fontFamily,
            headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
            fonts: [...document.fonts].map(font => ({ family: font.family, status: font.status, style: font.style })),
            controls: [...document.querySelectorAll('a,button,input,summary')].filter(visible).filter(el => !el.closest('.prose') && !el.matches('.skip-link')).map(el => {
              const rect = el.getBoundingClientRect();
              return { text: el.getAttribute('aria-label') || normalize(el.textContent), tag: el.tagName, width: rect.width, height: rect.height, x: rect.x, y: rect.y };
            }),
          };
        });
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze();
        const violations = axe.violations.map(({ id, impact, description, helpUrl, nodes }) => ({ id, impact, description, helpUrl, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }));
        const suffix = width === 390 ? 'mobile' : width === 1440 ? 'desktop' : 'wide';
        await page.screenshot({ path: `${screenshots}/${scenario.name}-${suffix}.png`, fullPage: true, animations: 'disabled' });
        await page.screenshot({ path: `${screenshots}/${scenario.name}-${suffix}-fold.png`, animations: 'disabled' });
        const state = { name, route: scenario.route, width, status, errors, violations, ...evidence };
        results.push(state);
        console.log(`${state.name}: HTTP ${status}, overflow=${state.overflow}, axe=${violations.length}, errors=${errors.length}`);
      } catch (error) {
        results.push({ name: `${scenario.name}-${width}`, route: scenario.route, width, error: error.stack });
        console.error(`FAILED ${scenario.name} ${width}: ${error.message}`);
      } finally { await context.close(); }
    }
  }

  // Layout stress checks are distinct from the three reference widths.
  if (!requested.length) {
    for (const width of [360, 768]) {
      for (const route of ['/', '/blog', '/blog/an-api-can-be-a-file']) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        try {
          await openScenario(page, { route });
          const normalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
          await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
          const enlarged = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            elements: [...document.querySelectorAll('main *, header.site-header *, footer *')]
              .filter(el => { const rect = el.getBoundingClientRect(); return rect.width && (rect.right > innerWidth + 1 || rect.left < -1); })
              .filter(el => !el.closest('svg, pre, .experiments-table')).slice(0, 12)
              .map(el => ({ tag: el.tagName, class: typeof el.className === 'string' ? el.className : '', text: el.textContent.slice(0, 60) })),
          }));
          results.push({ name: `text-resize-${route}-${width}`, width, route, normalOverflow, enlarged });
          console.log(`Text resize ${route} ${width}: normalOverflow=${normalOverflow}, enlargedOverflow=${enlarged.overflow}`);
          if (enlarged.overflow) await page.screenshot({ path: `test-results/text-resize-${route.replace(/\W+/g, '-')}-${width}.png`, fullPage: true });
        } finally { await context.close(); }
      }
    }
  }
} finally {
  await browser.close();
  const buildId = await readFile('.next/BUILD_ID', 'utf8').catch(() => 'development');
  await writeFile(`test-results/review-${theme}${requested.length ? `-${requested.join('-')}` : ''}.json`, JSON.stringify({ checkedAt: new Date().toISOString(), buildId: buildId.trim(), base, theme, results }, null, 2) + '\n');
}

assert.ok(results.every(result => !result.error && !result.overflow && !result.normalOverflow && !result.enlarged?.overflow && !result.errors?.length && !result.violations?.length), 'The review found issues; inspect test-results/review*.json.');
