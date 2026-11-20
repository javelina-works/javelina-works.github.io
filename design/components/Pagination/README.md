# Pagination

Page links under a list that runs to more than one page: the article list today. New for the site; derived from the quiet Button, the Tabs' chosen state and the 44px tap rule.

- **Previous / Next:** quiet Buttons (`jw-btn jw-btn--quiet`) with a drawn arrow. Previous shows from page 2 on, Next before the last page; there are no greyed-out buttons that do nothing.
- **Pages:** a 44px box per page, IBM Plex Mono figures in `text` on a `line-strong` edge; hover fills it with `surface`; focus is `shadow-focus`. Each is named "Page N" to a screen reader (the word is `jw-sr-only`).
- **The page you are on** (`is-current`, `aria-current="page"`) is not a link: a `surface` box with the marigold `selected` ring and its `selected-hairline`, the system's one way of saying "this one".
- Centered under the list, `space-14` above it. Nothing in it glows: the header lamp is the page's one glowing action.

## Plain HTML
```html
<nav class="jw-pages" aria-label="Pagination">
  <ul class="jw-pages__list" role="list">
    <li><a class="jw-btn jw-btn--quiet" href="/articles/" rel="prev"><svg aria-hidden="true">…</svg>Previous</a></li>
    <li><a class="jw-pages__num" href="/articles/"><span class="jw-sr-only">Page </span>1</a></li>
    <li><span class="jw-pages__num is-current" aria-current="page"><span class="jw-sr-only">Page </span>2</span></li>
  </ul>
</nav>
```

## Astro
`<Pagination collection="articles" currentPage={2} totalPages={2} [class] />` from `src/layouts/components/widgets/Pagination.astro` (labels from `src/i18n/en.json`: `common.paginationPrevious`, `common.paginationNext`).

## Rules
- Never more than one chosen page. Never a link to the page you are on.
- With many pages, show the first, the last and the two either side of the current one, with "…" between (not needed yet: the articles run to two pages).
