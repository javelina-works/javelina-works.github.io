// Contrast scan, injected into a page with page.evaluate(SCAN).
// For every visible piece of text inside a link, button or chip it finds the text color and the background it sits on
// (walking up to the first solid background; for a gradient, the average of its stops), and returns those under 4.5:1.
// Text that is hidden (opacity under 0.5 anywhere up the chain, or visibility hidden) is skipped; hover it to show it.
module.exports = `(() => {
  const parse = s => { const m = s && s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const avg = cs => ({ r: cs.reduce((s, c) => s + c.r, 0) / cs.length, g: cs.reduce((s, c) => s + c.g, 0) / cs.length, b: cs.reduce((s, c) => s + c.b, 0) / cs.length, a: 1 });
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) { const cols = [...cs.backgroundImage.matchAll(/rgba?\\([^)]+\\)/g)].map(m => parse(m[0])).filter(c => c.a > 0.5); if (cols.length) return avg(cols); }
      const c = parse(cs.backgroundColor); if (c && c.a > 0.5) return c; } return { r: 255, g: 255, b: 255, a: 1 }; };
  const shown = el => { let o = 1; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return false; o *= +cs.opacity; } return o >= 0.5; };
  const out = [], seen = new Set();
  document.querySelectorAll('a, button, [role=button], [role=radio], [role=tab], .jw-chip, .jw-status').forEach(root => {
    const els = [root, ...root.querySelectorAll('*')];
    els.forEach(el => {
      if (seen.has(el)) return; seen.add(el);
      const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
      if (!own) return; const r = el.getBoundingClientRect(); if (!r.width || !r.height || !shown(el)) return;
      const cs = getComputedStyle(el), fg = parse(cs.color); if (!fg) return;
      const v = ratio(fg, bgOf(el));
      if (v < 4.5) out.push({ text: own.slice(0, 32), fg: cs.color, ratio: +v.toFixed(2) });
    });
  });
  return out;
})()`;
