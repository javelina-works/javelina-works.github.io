// Checks built pages against the design rules. Run it against the built site (astro build && astro preview).
//
//   node design/checks/check-site.cjs http://localhost:4321 / /how-it-works /pricing …   [--out site-shots]
//
// For every page, by day and at night, at phone (390px) and desktop (1280px) width:
//   - full-page screenshot (these go in the pull request)
//   - contrast: every visible piece of text in a link, button, chip or status plate is 4.5:1 or better, at rest and while hovered
//   - no console errors or page errors
// Once per page:
//   - reduced motion: with prefers-reduced-motion on, no animation keeps running (no flicker, blink or ping)
//   - no WebGL: with WebGL off, the page still renders, walls fall back (.jw-wall--static) and nothing throws
//   - cost: JavaScript bytes, total bytes, long tasks while scrolling, and animation frames while the page sits still
// Exit code 1 if any hard check fails. Cost numbers are reported against the budget in BUILD_BRIEF.md.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const SCAN = require('./contrast-scan.cjs');
const args = process.argv.slice(2); const oi = args.indexOf('--out'); const out = path.resolve(oi >= 0 ? args.splice(oi, 2)[1] : 'site-shots');
const [base, ...pages] = args; if (!base || !pages.length) { console.log('usage: node check-site.cjs <base-url> <path> [path …] [--out dir]'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });
const slug = p => (p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'home');
const setTheme = (p, t) => p.evaluate(t => { document.documentElement.setAttribute('data-theme', t); }, t === 'day' ? 'light' : 'dark');
let hard = 0; const fail = m => { hard++; console.log('FAIL ' + m); };
(async () => {
  const gl = ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'];
  const b = await chromium.launch({ args: gl });
  for (const pg of pages) {
    const url = base.replace(/\/$/, '') + pg;
    for (const [vw, vh, label] of [[390, 844, 'phone'], [1280, 860, 'desktop']]) for (const theme of ['day', 'night']) {
      const ctx = await b.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 }); const p = await ctx.newPage();
      const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
      await p.goto(url, { waitUntil: 'networkidle' }); await setTheme(p, theme); await p.waitForTimeout(600);
      // walk down the page so lazy pieces and the lamp's flicker have run, then back to the top
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += vh * 0.8) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(250); }
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(3000);
      await p.screenshot({ path: path.join(out, `${slug(pg)}-${label}-${theme}.png`), fullPage: true });
      const bad = (await p.evaluate(SCAN)).map(x => ({ ...x, st: 'rest' }));
      const els = await p.$$('a, button');
      for (const el of els) { try { if (!(await el.isVisible())) continue; await el.hover({ timeout: 600 }); } catch (e) { continue; }
        await p.waitForTimeout(200); for (const x of await p.evaluate(SCAN)) if (!bad.find(y => y.text === x.text)) bad.push({ ...x, st: 'hover' }); }
      for (const x of bad) fail(`${pg} ${label} ${theme} contrast (${x.st}): "${x.text}" ${x.fg} at ${x.ratio}:1`);
      for (const e of errs) fail(`${pg} ${label} ${theme} error: ${e}`);
      await ctx.close();
    }
    // reduced motion
    { const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
      await p.goto(url, { waitUntil: 'networkidle' }); await setTheme(p, 'night'); await p.waitForTimeout(3000);
      const running = await p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => (a.animationName || a.constructor.name) + ' on ' + (a.effect && a.effect.target && (a.effect.target.className || a.effect.target.tagName))));
      if (running.length) fail(`${pg} reduced motion: still running: ${running.slice(0, 5).join(', ')}`);
      await ctx.close(); }
    // cost: bytes, long tasks while scrolling, frames while still
    { const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
      let js = 0, all = 0; p.on('response', async r => { try { const n = (await r.body()).length; all += n; if (/javascript/.test(r.headers()['content-type'] || '')) js += n; } catch (e) {} });
      await p.addInitScript(() => { window.__lt = 0; window.__frames = 0; const raf = window.requestAnimationFrame; window.requestAnimationFrame = f => raf(t => { window.__frames++; f(t); });
        try { new PerformanceObserver(l => l.getEntries().forEach(e => { window.__lt += e.duration; })).observe({ type: 'longtask', buffered: true }); } catch (e) {} });
      await p.goto(url, { waitUntil: 'networkidle' }); await setTheme(p, 'night'); await p.waitForTimeout(4000);
      await p.evaluate(() => { window.__lt = 0; });
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += 120) { await p.mouse.wheel(0, 120); await p.waitForTimeout(16); }
      await p.waitForTimeout(800); const lt = await p.evaluate(() => window.__lt);
      await p.evaluate(() => { window.__frames = 0; }); await p.waitForTimeout(3000); const still = await p.evaluate(() => window.__frames);
      console.log(`COST ${pg}: js ${(js / 1024).toFixed(0)} KB, total ${(all / 1024).toFixed(0)} KB, long tasks while scrolling ${lt.toFixed(0)} ms, frames in 3 s sitting still ${still}`);
      await ctx.close(); }
  }
  await b.close();
  // no WebGL
  const b2 = await chromium.launch({ args: ['--disable-webgl', '--disable-3d-apis'] });
  for (const pg of pages) { const p = await b2.newPage({ viewport: { width: 1280, height: 860 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base.replace(/\/$/, '') + pg, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    const st = await p.evaluate(() => ({ walls: document.querySelectorAll('[data-jw-wall]').length, statics: document.querySelectorAll('.jw-wall--static').length }));
    if (st.walls !== st.statics) fail(`${pg} no WebGL: ${st.walls} walls but ${st.statics} fell back`);
    for (const e of errs) fail(`${pg} no WebGL error: ${e}`);
    await p.screenshot({ path: path.join(out, `${slug(pg)}-no-webgl.png`) }); await p.close(); }
  await b2.close();
  console.log(hard ? `${hard} hard failure(s)` : 'all hard checks pass'); process.exit(hard ? 1 : 0);
})();
