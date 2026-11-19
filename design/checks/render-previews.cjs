// Renders every component preview in design/components/*/preview.html by day and at night, saves screenshots, and runs the
// contrast scan at rest and while hovering each link and button, with deliberately bad link styles injected
// (a:hover { color: inherit } and friends) to prove buttons hold their own text color.
//
//   npm i -D playwright react@18 react-dom@18
//   node design/checks/render-previews.cjs [outDir]          (exit code 1 if any text is under 4.5:1 or a preview throws)
//
// It serves design/ on a local port, so /assets/…, ../fonts/… and the logos resolve the way they will on the site.
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const SCAN = require('./contrast-scan.cjs');
const D = path.join(__dirname, '..'), out = path.resolve(process.argv[2] || 'design-previews');
fs.mkdirSync(out, { recursive: true });
const HOSTILE = 'a{color:#0000EE} a:visited{color:#551A8B} a:hover{color:inherit} nav a{color:inherit} button{color:inherit}';
const TYPES = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.html': 'text/html' };
const pages = {};
const pkg = n => path.dirname(require.resolve(n + '/package.json'));
const UMD = { '/_umd/react.js': path.join(pkg('react'), 'umd/react.production.min.js'), '/_umd/react-dom.js': path.join(pkg('react-dom'), 'umd/react-dom.production.min.js') };
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  if (pages[u]) { r.writeHead(200, { 'content-type': 'text/html' }); return r.end(pages[u]); }
  const f = UMD[u] || path.join(D, path.normalize(u).replace(/^(\.\.[\/\\])+/, ''));
  fs.readFile(f, (e, buf) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(buf); });
}).listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  let fails = 0;
  for (const comp of fs.readdirSync(path.join(D, 'components')).sort()) {
    const pv = path.join(D, 'components', comp, 'preview.html'); if (!fs.existsSync(pv)) continue;
    const body = fs.readFileSync(pv, 'utf8').split('<body>')[1].split('</body>')[0];
    for (const theme of ['light', 'dark']) {
      const key = `/_preview/${comp}-${theme}.html`;
      pages[key] = `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/tokens/tokens.css"><link rel="stylesheet" href="/components/jw.css"><style>${HOSTILE}</style>
<script src="/_umd/react.js"></script><script src="/_umd/react-dom.js"></script><script src="/components/react/bundle.js"></script></head><body>${body}</body></html>`;
      const p = await b.newPage({ viewport: { width: 960, height: 640 }, deviceScaleFactor: 1 });
      const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('response', r => { if (r.status() >= 400) errs.push('404 ' + r.url().replace(base, '')); });
      await p.goto(base + key); await p.waitForTimeout(3200);
      await p.screenshot({ path: path.join(out, `${comp}-${theme}.png`), fullPage: true });
      const bad = (await p.evaluate(SCAN)).map(x => ({ ...x, state: 'rest' }));
      const n = (await p.$$('a, button')).length;
      for (let i = 0; i < n; i++) { const el = (await p.$$('a, button'))[i]; try { await el.hover({ timeout: 500 }); } catch (e) { continue; }
        await p.waitForTimeout(220); for (const x of await p.evaluate(SCAN)) if (!bad.find(y => y.text === x.text)) bad.push({ ...x, state: 'hover' }); }
      for (const x of bad) console.log(`FAIL ${comp} ${theme} ${x.state}: "${x.text}" ${x.fg} at ${x.ratio}:1`);
      for (const e of errs) console.log(`ERROR ${comp} ${theme}: ${e}`);
      fails += bad.length + errs.length; await p.close();
    }
  }
  await b.close(); server.close();
  console.log(fails ? `${fails} problem(s)` : 'all previews pass'); process.exit(fails ? 1 : 0);
});
