# TableOfContents

Links to the sections of a long page: the articles today. New for the site; derived from the Disclosure, the nav bar's active item (`land`) and the 44px tap rule.

- **Entries:** one per `h2` (and an `h3` nested under its `h2`), each a 44px row of 16px Figtree in `text-body` on a 2px `line` rail. Hover: `text` and an underline. Focus: `shadow-focus`.
- **The section being read:** `aria-current="true"` on its link: `land` text at weight 500 on a `land` rail (the system's active-nav color, juniper by day and sage at night). A small script sets it from the scroll position; without the script the list works the same, unmarked.
- **Sources:** a page's footnote list ("Sources", the Markdown pipeline's `#footnote-label`) is not a section of the text. It comes last, after a `space-4` gap, as its own link (`jw-toc__sources`).
- **Sidebar** (`jw-toc--sidebar`): beside the text on wide screens, under a `jw-eyebrow` label, `position: sticky` just under the nav bar. Every entry shows: it only scrolls inside itself when the screen is shorter than the list.
- **Disclosure** (`jw-toc--disclosure`): a closed Disclosure card (`jw-disclosure--solo`) whose summary is the label; it opens to the same list. For phones and narrow screens, above the text.
- No numbers in front of the entries: the headings in the text carry none (one article's headings start with their own "1.", "2.").

## Plain HTML
```html
<nav class="jw-toc jw-toc--sidebar" aria-labelledby="toc-label">
  <p class="jw-eyebrow jw-toc__label" id="toc-label">Table of contents</p>
  <ol class="jw-toc__list" role="list">
    <li class="jw-toc__item"><a class="jw-toc__link" href="#brush-is-habitat-until-it-isnt" aria-current="true">Brush is habitat until it isn’t</a></li>
    <li class="jw-toc__item"><a class="jw-toc__link" href="#tpwds-cover-targets-by-species">TPWD’s cover targets by species</a>
      <ol class="jw-toc__list jw-toc__list--sub" role="list"><li class="jw-toc__item"><a class="jw-toc__link" href="#…">…</a></li></ol>
    </li>
  </ol>
  <p class="jw-toc__sources"><a class="jw-toc__link" href="#footnote-label">Sources</a></p>
</nav>

<nav class="jw-toc jw-toc--disclosure" aria-labelledby="toc-top-label">
  <details class="jw-disclosure jw-disclosure--solo">
    <summary class="jw-disclosure__summary"><span class="jw-disclosure__title"><span id="toc-top-label">Table of contents</span></span><span class="jw-disclosure__icon" aria-hidden="true"></span></summary>
    <div class="jw-disclosure__body"><ol class="jw-toc__list" role="list">…</ol><p class="jw-toc__sources">…</p></div>
  </details>
</nav>
```

## Astro
`<TableOfContents toc={tocHeadings} [variant="sidebar" | "disclosure"] [marker] [id] [label] />` from `src/layouts/components/widgets/TableOfContents.astro` (`toc` from `buildToc(headings)`; the `footnote-label` heading is moved to the Sources link). `marker` adds the scroll script that sets `aria-current`; it reads the headings' positions at most every 120ms while the page scrolls, so nothing runs while it is still.

## Rules
- Never cap the list's height to hide entries behind an inner scroll; the sidebar's own scroll is only for screens shorter than the list.
- One tracked table of contents in view at a time: on a page that renders both forms, show the sidebar on wide screens and the disclosure below that width.
- On the page ground or a card, never on a wall or a sheen.
