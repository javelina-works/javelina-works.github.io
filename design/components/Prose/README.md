# Prose

Long-form text: articles, legal pages, the about page and service bodies, as the Markdown pipeline renders them. New for the site; derived from the type scale and the contrast rules. Wrap the rendered HTML in `<div class="jw-prose">`.

- Reading text is 18px with a 1.6 line height (17px on phones; the `body-prose` type style), in `text-body`, about 66 characters a line (`max-width: 66ch`; `jw-prose--full` lifts it).
- Headings use the type scale in `text`: `h2` is `heading-2` (28px, 24px on phones), `h3` is `heading-3`, `h4`–`h6` are 18px Figtree 500. One `h1` per page lives in the page header, not in the prose.
- Links are `land` with a 1px underline (2px and `text` on hover, `shadow-focus` on focus). Their color holds against page link styles (`:link`, `:visited`, `:hover`). External links keep the pipeline's arrow icon (`external-link-icon`, 0.8em) and its screen-reader note (`sr-only`).
- Lists use `text-muted` markers; `strong` is weight 500 in `text`.
- Blockquotes have a 3px `line-strong` rule on the left and `text` color.
- Tables fill the column, wrap their cells to fit (never scroll the page sideways), use 16px tabular figures, a `line-strong` rule under the header and `line` between rows.
- Figures: images get `radius-md` and dim to `photo-brightness-dark` at night; captions are 16px `text-muted`.
- Code: `code` sits on `surface-sunken` in IBM Plex Mono (at least 16px); a code block scrolls inside itself. Shiki's light colors are held to `text` at night.
- Footnotes (GFM): reference numbers are small superscript links; the Sources list sits under a `line` rule in 16px, its heading at `heading-3`, and long URLs wrap anywhere.
- Nothing in it is under 16px except the superscript reference numbers.

## Rules
- On the page ground or on a card. Never on a wall or a sheen.
- Prose has no callout or notice style; the site's content uses none. Design one before adding it.

## Plain HTML
```html
<div class="jw-prose">
  <p>…<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup></p>
  <h2>TPWD’s cover targets by species</h2>
  <table>…</table>
  <section data-footnotes class="footnotes"><h2 class="footnote-label" id="footnote-label">Sources</h2><ol>…</ol></section>
</div>
```
