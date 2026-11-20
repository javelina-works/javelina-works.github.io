# PageHeader

The top of an inner page: an eyebrow, the page's one `<h1>`, a short intro, and room for a button or a date line. New for the site; derived from the system rules and the prototype's hero card.

- On the ground by default: no card, the words straight on `bg`. Padding space-20 / space-14 (space-14 / space-10 on phones).
- On a wall (`jw-pagehead--wall`, a LampWall): the words sit on a card (text never sits on a wall), up to 760px wide, padded space-8 (space-5 on phones), and its shadow moves with the lamp (`jw-lit` with `data-jw-shadow`). The wall is server-rendered `jw-wall--static` and keeps that drawing without WebGL.
- Eyebrow: `jw-eyebrow` (mono label in `label`). Title: `t-display-m` (42px, 32px on phones) in `text`. Intro: 17px `text-body`, at most 60 characters a line, `text-wrap: pretty` so a last word never sits alone.

## Plain HTML
```html
<!-- on the ground -->
<header class="jw-pagehead">
  <div class="jw-container">
    <div class="jw-pagehead__body">
      <p class="jw-eyebrow jw-pagehead__eyebrow">Frequently asked</p>
      <h1 class="t-display-m jw-pagehead__title">Brush clearing questions</h1>
      <p class="jw-pagehead__intro">…</p>
    </div>
  </div>
</header>

<!-- on a wall -->
<header class="jw-wall jw-wall--flake jw-wall--static jw-pagehead jw-pagehead--wall" data-jw-wall="flake" data-jw-seed="3">
  <canvas class="jw-wall__canvas" aria-hidden="true"></canvas>
  <div class="jw-container"><div class="jw-pagehead__frame">
    <div class="jw-lit" data-jw-shadow><span class="jw-cast" aria-hidden="true"></span><span class="jw-cast" aria-hidden="true"></span>
      <div class="jw-surface jw-surface--card jw-pagehead__card"><div class="jw-pagehead__body">…</div></div>
    </div>
  </div></div>
</header>
```

## Astro
`<PageHeader eyebrow="…" title="…" intro="…" [wall="flake|corrugated|smooth"] [seed] [titleId]>…buttons…</PageHeader>` from `src/layouts/components/jw/PageHeader.astro`. Use the `title` and `intro` slots for markup (for example `markdownify` output).

## Rules
- One per page, and it holds the page's only `h1`.
- At most one wall per screen height: a wall header is not followed straight away by another wall.
- The eyebrow and intro are optional; never invent them to fill the space.
