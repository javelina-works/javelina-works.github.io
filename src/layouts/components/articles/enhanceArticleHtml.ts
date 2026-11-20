// Small fixes to an article's rendered Markdown, done once at build time (no JavaScript in the page).
// The Markdown pipeline (astro.config.mjs) is shared, so these live with the article pages instead:
//   1. Footnote references that sit side by side ("[^3][^4]") render as one superscript, "3, 4", not "34".
//   2. Tables become the system's Table (design/components/Table): column headers with scope, the first cell of each
//      row as its row header, and a data-label on every cell, so on a phone each row stacks into label and value lines
//      instead of squeezing five columns into 358px. Tables that share their column labels (the four "What changes /
//      Today / After" tables of one article) get the same column widths, so their columns line up down the page.
//   3. Sources: the end of each source (its last word or the last part of its URL, the link's arrow and the "back to
//      the text" keys) is held together, so the arrow or a key never wraps onto a line of its own; long URLs get
//      <wbr> seams so they wrap at "/" and the like.
// Heading ids, footnote ids, links and every word are left as they are.
import { parseHTML } from "linkedom";

const isRefSup = (node: any): boolean =>
  !!node &&
  node.nodeType === 1 &&
  node.tagName === "SUP" &&
  [...node.children].some(
    (c: any) => c.tagName === "A" && c.hasAttribute("data-footnote-ref"),
  );

const isBlank = (node: any): boolean =>
  !!node && node.nodeType === 3 && !node.textContent.trim();

function joinFootnoteRefs(document: any, root: any) {
  for (const sup of [...root.querySelectorAll("sup")]) {
    if (!sup.parentNode || !isRefSup(sup)) continue;
    for (;;) {
      let probe = sup.nextSibling;
      while (isBlank(probe)) probe = probe.nextSibling;
      if (!isRefSup(probe)) break;
      // drop the whitespace between the two, then move the second reference into the first superscript
      while (sup.nextSibling !== probe) sup.nextSibling.remove();
      sup.append(document.createTextNode(", "));
      while (probe.firstChild) sup.append(probe.firstChild);
      probe.remove();
    }
  }
}

const cellText = (cell: any): string => {
  const copy = cell.cloneNode(true);
  copy.querySelectorAll("sup, .sr-only").forEach((n: any) => n.remove());
  return copy.textContent.replace(/\s+/g, " ").trim();
};

function stackTables(document: any, root: any) {
  for (const table of [...root.querySelectorAll("table")]) {
    table.classList.add("jw-table", "jw-table--stack");
    table.setAttribute("role", "table");
    const labels: string[] = [];
    table.querySelectorAll("thead, tbody").forEach((g: any) => g.setAttribute("role", "rowgroup"));
    table.querySelectorAll("tr").forEach((tr: any) => tr.setAttribute("role", "row"));
    table.querySelectorAll("thead th").forEach((th: any) => {
      th.setAttribute("scope", "col");
      th.setAttribute("role", "columnheader");
      labels.push(cellText(th));
    });
    for (const tr of [...table.querySelectorAll("tbody tr")]) {
      [...tr.children].forEach((cell: any, i: number) => {
        if (i === 0) {
          // the first cell names the row (a study, a product, a species): make it the row header
          const th = document.createElement("th");
          for (const { name, value } of [...cell.attributes]) th.setAttribute(name, value);
          while (cell.firstChild) th.append(cell.firstChild);
          th.setAttribute("scope", "row");
          th.setAttribute("role", "rowheader");
          cell.replaceWith(th);
          return;
        }
        cell.setAttribute("role", "cell");
        if (labels[i]) cell.setAttribute("data-label", labels[i]);
      });
    }
    const wrap = document.createElement("div");
    wrap.className = "jw-table-wrap article-table";
    table.replaceWith(wrap);
    wrap.append(table);
  }
}

// Tables with the same column labels: one set of column widths for all of them (a colgroup, used from 641px with
// table-layout: fixed; on a phone the rows stack and the widths don't apply). Each column's share follows the longest
// text in that column across the set, so short figures get a narrow column and long words a wide one.
function matchTables(document: any, root: any) {
  const sets = new Map<string, any[]>();
  for (const table of [...root.querySelectorAll("table.jw-table")]) {
    const labels = [...table.querySelectorAll("thead th")].map(cellText);
    if (labels.length < 2) continue;
    const key = labels.join("\u0000");
    sets.set(key, [...(sets.get(key) || []), table]);
  }
  for (const tables of sets.values()) {
    if (tables.length < 2) continue;
    const longest: number[] = [];
    for (const table of tables) {
      for (const tr of [...table.querySelectorAll("tr")]) {
        [...tr.children].forEach((cell: any, i: number) => {
          // a few characters of padding each, so a column of short figures isn't squeezed against its neighbour
          longest[i] = Math.max(longest[i] || 0, Math.min(cellText(cell).length, 40) + 4);
        });
      }
    }
    const total = longest.reduce((a, b) => a + b, 0);
    for (const table of tables) {
      table.classList.add("article-table--matched");
      const colgroup = document.createElement("colgroup");
      for (const n of longest) {
        const col = document.createElement("col");
        col.setAttribute("style", `width: ${((100 * n) / total).toFixed(1)}%`);
        colgroup.append(col);
      }
      table.prepend(colgroup);
    }
  }
}

// How many characters at the end of `text` stay with what follows it: the last word, or for a long word (a URL) its
// longest final part of at most 14 characters that starts after a "/", "-", "_" or "%20" ("wildfire.pdf", "texans/"),
// failing that after other URL punctuation (".", "?", "=" …), or else its last 8 characters.
const PIECE_MAX = 14;
const NBSP = "\u00a0";
function pieceLength(text: string): number {
  const word = /\S+$/.exec(text)?.[0] ?? "";
  if (word.length <= PIECE_MAX) return word.length;
  const core = word.replace(/[/._-]+$/, "");
  for (const cut of [/%20|[/_-]/g, /[.?=&:;,()[\]]/g]) {
    for (const m of core.matchAll(cut)) {
      const start = (m.index ?? 0) + m[0].length;
      if (word.length - start <= PIECE_MAX && start < core.length) return word.length - start;
    }
  }
  return Math.min(8, word.length);
}

// the last text node in `el` that a reader sees (not the screen-reader note or the icon)
function lastVisibleText(el: any): any {
  for (let i = el.childNodes.length - 1; i >= 0; i--) {
    const n = el.childNodes[i];
    if (n.nodeType === 3 && n.textContent.trim()) return n;
    if (n.nodeType === 1 && !n.classList?.contains("sr-only") && n.tagName !== "svg") {
      const t = lastVisibleText(n);
      if (t) return t;
    }
  }
  return null;
}

// Splits the last piece off text node `t` into a span of class `cls`, placed where it was; with `withRest`, everything
// after it in its parent (a link's arrow) goes into the span too. Returns the span.
function splitTail(document: any, t: any, cls: string, withRest = false): any {
  const text = t.textContent.replace(/\s+$/, "");
  const k = pieceLength(text);
  const span = document.createElement("span");
  span.className = cls;
  const after: any[] = [];
  if (withRest) for (let s = t.nextSibling; s; s = s.nextSibling) after.push(s);
  const gap = t.textContent.length > text.length ? NBSP : "";
  const piece = document.createTextNode(text.slice(text.length - k) + gap);
  t.textContent = text.slice(0, text.length - k);
  t.after(span);
  span.append(piece, ...after);
  if (!t.textContent) t.remove();
  return span;
}

// Long URLs in Sources wrap at their own seams: a <wbr> after each "/" (not the two of "://"), "_", "?", "&", "=" and
// "%20". Without them a URL wraps only by Prose's overflow-wrap: anywhere, and Chrome then takes the place just before
// a "back to the text" key as its emergency break, nowrap holder or not. overflow-wrap: anywhere stays the last resort.
const URL_SEAM = /(?<!:\/?)\/|[_?&=]|%20/g;
function addUrlSeams(document: any, t: any) {
  const text: string = t.textContent;
  const parts: any[] = [];
  let at = 0;
  for (const m of text.matchAll(URL_SEAM)) {
    const end = (m.index ?? 0) + m[0].length;
    if (end >= text.length) continue;
    parts.push(document.createTextNode(text.slice(at, end)), document.createElement("wbr"));
    at = end;
  }
  if (!parts.length) return;
  parts.push(document.createTextNode(text.slice(at)));
  t.replaceWith(...parts);
}

// Every link in Sources: its last piece and its arrow held together (one at the end of a source already is, by
// holdSourceEnds), and a long URL seamed.
function holdSourceLinks(document: any, root: any) {
  for (const a of [...root.querySelectorAll(".footnotes a:not(.data-footnote-backref)")]) {
    if (a.querySelector(".external-link-icon") && !a.querySelector(".source-hold")) {
      const t = lastVisibleText(a);
      if (t && t.parentNode === a) splitTail(document, t, "source-hold", true).before(document.createElement("wbr"));
    }
    if (!/^\s*https?:\/\//.test(a.textContent)) continue;
    for (const t of [...a.childNodes]) if (t.nodeType === 3) addUrlSeams(document, t);
  }
}

// Moves the nodes after `holder`, up to and including `last`, into `holder`. The spaces between them become no-break
// spaces: Chrome otherwise takes the space after the link as a place to wrap, nowrap holder or not.
function gather(holder: any, last: any) {
  for (let s = holder.nextSibling; s; s = holder.nextSibling) {
    if (isBlank(s)) s.textContent = NBSP;
    holder.append(s);
    if (s === last) break;
  }
}

// Sources: hold each source's end together. The holder (source-end, nowrap) takes the last word, or the whole link
// with its last piece and arrow in a nowrap span (source-hold; the rest of the link still wraps, see ArticleBody),
// then the first "back to the text" key; with two keys, both. With three or more, the keys between may wrap, but the
// last two stay together so a key never sits alone on a line.
function holdSourceEnds(document: any, root: any) {
  for (const li of [...root.querySelectorAll(".footnotes li")]) {
    const keys = [...li.querySelectorAll("a.data-footnote-backref")];
    if (!keys.length) continue;
    let prev = keys[0].previousSibling;
    while (isBlank(prev)) prev = prev.previousSibling;
    if (!prev) continue;
    const end = document.createElement("span");
    end.className = "source-end";
    if (prev.nodeType === 3) {
      const t = splitTail(document, prev, "source-hold");
      t.replaceWith(end);
      end.append(t);
    } else if (prev.nodeType === 1 && prev.tagName === "A") {
      const t = lastVisibleText(prev);
      // the URL may wrap just before its held end
      if (t && t.parentNode === prev) {
        splitTail(document, t, "source-hold", true).before(document.createElement("wbr"));
      }
      prev.replaceWith(end);
      end.append(prev);
    } else {
      continue;
    }
    gather(end, keys.length === 2 ? keys[1] : keys[0]);
    if (keys.length >= 3) {
      const pair = document.createElement("span");
      pair.className = "source-end";
      keys[keys.length - 2].replaceWith(pair);
      pair.append(keys[keys.length - 2]);
      gather(pair, keys[keys.length - 1]);
    }
  }
}

export function enhanceArticleHtml(html: string): string {
  if (!html || (!html.includes("data-footnote-ref") && !html.includes("<table"))) return html;
  const { document } = parseHTML(
    `<!doctype html><html><body><div id="jw-article-root">${html}</div></body></html>`,
  );
  const root = document.getElementById("jw-article-root");
  if (!root) return html;
  joinFootnoteRefs(document, root);
  stackTables(document, root);
  matchTables(document, root);
  holdSourceEnds(document, root);
  holdSourceLinks(document, root);
  return root.innerHTML;
}
