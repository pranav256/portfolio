import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.SITE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
const page = await context.newPage();
const results = [];
const errors = [];
let frames;
page.on('pageerror', error => errors.push(error.message));

async function check(name, action) {
  try {
    const evidence = await action();
    results.push({ name, passed: true, evidence });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.stack });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function settle() {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running'));
}

async function stableEdges(selector) {
  const evidence = [];
  for (const target of await page.locator(selector).all()) {
    await target.scrollIntoViewIfNeeded();
    await page.mouse.move(1, 1);
    await settle();
    const before = await target.boundingBox();
    for (const [x, y] of [
      [before.x + before.width / 2, before.y + 2],
      [before.x + before.width - 2, before.y + before.height / 2],
      [before.x + before.width / 2, before.y + before.height - 2],
    ]) {
      await page.mouse.move(x, y);
      await settle();
      const after = await target.boundingBox();
      for (const key of ['x', 'y', 'width', 'height']) {
        assert.ok(Math.abs(before[key] - after[key]) < 0.5, `${selector} changed ${key} on hover`);
      }
      assert.ok(await target.evaluate(element => element.matches(':hover')), 'The pointer lost its hover target');
    }
    evidence.push({ label: await target.getAttribute('aria-label') || (await target.innerText()).split('\n')[0], box: before });
  }
  return evidence;
}

try {
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await settle();

  await check('Pointer motion responds while the hero copy remains stationary', async () => {
    const title = page.locator('h1');
    const before = await title.boundingBox();
    const hero = await page.locator('.hero-art').boundingBox();
    await page.mouse.move(hero.x + hero.width * 0.85, hero.y + hero.height * 0.25);
    await settle();
    const translation = await page.locator('.art-sun').evaluate(element => getComputedStyle(element).translate);
    assert.notEqual(translation, 'none');
    assert.notEqual(translation, '0px 0px');
    assert.deepEqual(await title.boundingBox(), before);
    return { translation, title: before };
  });

  await check('All project links keep their hit area at top, right, and bottom hover edges', async () => stableEdges('.project-link'));

  await check('Project keyboard focus is visible and retains a stationary hit area', async () => {
    const target = page.locator('.project-link').first();
    await target.scrollIntoViewIfNeeded();
    await page.mouse.move(1, 1);
    await settle();
    const before = await target.boundingBox();
    await page.keyboard.press('Tab');
    await target.focus();
    await settle();
    assert.deepEqual(await target.boundingBox(), before);
    const focus = await target.evaluate(element => {
      // A focus-within surface may paint a descendant link's indicator.
      let surface = element;
      while (getComputedStyle(surface).outlineStyle === 'none' && surface.parentElement) surface = surface.parentElement;
      const style = getComputedStyle(surface);
      const box = surface.getBoundingClientRect();
      const extent = Math.max(0, parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset));
      const clippingAncestors = [];
      for (let ancestor = surface.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const ancestorStyle = getComputedStyle(ancestor);
        if (!/(hidden|clip|auto|scroll)/.test(ancestorStyle.overflow)) continue;
        const clip = ancestor.getBoundingClientRect();
        if (box.left - extent < clip.left - 1 || box.right + extent > clip.right + 1 ||
            box.top - extent < clip.top - 1 || box.bottom + extent > clip.bottom + 1) {
          clippingAncestors.push(ancestor.className);
        }
      }
      return { visible: element.matches(':focus-visible'), outline: style.outlineStyle, focusSurface: surface.className, clippingAncestors };
    });
    assert.equal(focus.visible, true);
    assert.notEqual(focus.outline, 'none');
    assert.deepEqual(focus.clippingAncestors, [], 'A container clips the visible focus ring');
    return focus;
  });

  await page.goto(`${base}/blog`);
  await page.getByRole('searchbox').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await check('Writing entries keep their hit area while their arrow moves', async () => stableEdges('.post-link'));

  await page.getByRole('link', { name: 'Pranav, home' }).click();
  await page.locator('.hero-art').waitFor();
  await settle();
  await check('Artwork reconnects after navigation and survives a short frame sample', async () => {
    frames = await page.evaluate(async () => {
      const hero = document.querySelector('.hero-art');
      const rect = hero.getBoundingClientRect();
      const gaps = [];
      const tasks = [];
      const observer = new PerformanceObserver(list => tasks.push(...list.getEntries().map(entry => entry.duration)));
      observer.observe({ type: 'longtask', buffered: false });
      let previous;
      for (let frame = 0; frame < 144; frame++) {
        const time = await new Promise(resolve => requestAnimationFrame(resolve));
        if (previous !== undefined) gaps.push(time - previous);
        previous = time;
        hero.dispatchEvent(new PointerEvent('pointermove', {
          pointerType: 'mouse', clientX: rect.x + rect.width * (0.5 + Math.sin(frame / 12) * 0.4),
          clientY: rect.y + rect.height * 0.3,
        }));
      }
      observer.disconnect();
      const ordered = [...gaps].sort((a, b) => a - b);
      return {
        frames: gaps.length + 1,
        medianFrameMs: ordered[Math.floor(ordered.length / 2)],
        p95FrameMs: ordered[Math.floor(ordered.length * 0.95)],
        longestFrameMs: ordered.at(-1),
        framesOver50Ms: gaps.filter(gap => gap > 50).length,
        longTasksMs: tasks,
        pointerX: hero.style.getPropertyValue('--art-x'),
        note: 'A short headless-browser sample on this machine, not a real-device performance guarantee.',
      };
    });
    assert.equal(frames.frames, 144);
    assert.notEqual(frames.pointerX, '');
    return frames;
  });

  await check('Changing to reduced motion immediately stops decorative movement', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await settle();
    const result = await page.evaluate(() => ({
      translation: getComputedStyle(document.querySelector('.art-sun')).translate,
      pointerX: document.querySelector('.hero-art').style.getPropertyValue('--art-x'),
      activeAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    assert.equal(result.translation, 'none');
    assert.equal(result.pointerX, '');
    assert.equal(result.activeAnimations, 0);
    assert.equal(result.scrollBehavior, 'auto');
    return result;
  });

  await check('Touch devices do not follow pointer movement', async () => {
    const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    try {
      const touchPage = await touch.newPage();
      await touchPage.goto(base);
      await touchPage.locator('.hero-art').waitFor();
      const result = await touchPage.locator('.hero-art').evaluate(element => {
        element.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', clientX: 300, clientY: 300 }));
        return { fine: matchMedia('(hover: hover) and (pointer: fine)').matches, pointerX: element.style.getPropertyValue('--art-x') };
      });
      assert.equal(result.fine, false);
      assert.equal(result.pointerX, '');
      return result;
    } finally { await touch.close(); }
  });

  await check('The motion and hover checks produced no browser errors', async () => assert.deepEqual(errors, []));
} finally {
  await browser.close();
  await mkdir('docs/verification', { recursive: true });
  const buildId = await readFile('.next/BUILD_ID', 'utf8').catch(() => 'development');
  await writeFile('docs/verification/motion.json', JSON.stringify({ checkedAt: new Date().toISOString(), buildId: buildId.trim(), base, results, frames }, null, 2) + '\n');
}

if (results.some(result => !result.passed)) process.exitCode = 1;
