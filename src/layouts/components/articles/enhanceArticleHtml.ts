// Small fixes to an article's rendered Markdown, done once at build time (no JavaScript in the page).
// The Markdown pipeline (astro.config.mjs) is shared, so these live with the article pages instead:
//   1. Footnote references that sit side by side ("[^3][^4]") render as one superscript, "3, 4", not "34".
//   2. Tables become the system's Table (design/components/Table): column headers with scope, the first cell of each
//      row as its row header, and a data-label on every cell, so on a phone each row stacks into label and value lines
//      instead of squeezing five columns into 358px.
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

export function enhanceArticleHtml(html: string): string {
  if (!html || (!html.includes("data-footnote-ref") && !html.includes("<table"))) return html;
  const { document } = parseHTML(
    `<!doctype html><html><body><div id="jw-article-root">${html}</div></body></html>`,
  );
  const root = document.getElementById("jw-article-root");
  if (!root) return html;
  joinFootnoteRefs(document, root);
  stackTables(document, root);
  return root.innerHTML;
}
