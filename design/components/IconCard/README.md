# IconCard (and CardGrid)

A paper card that makes one point: an icon, an optional figure, a heading and a line or two. The benefits, values and pillars sections, and the MDX Card shortcode. New for the site; derived from the Surface card.

- `jw-surface--card` with padding `space-6` (`space-5` / `space-4` on phones), `space-3` between its parts; it fills the grid cell's height.
- **Icon:** a Lucide line icon at 20px in `text`, in a 40px `surface-sunken` well with `radius-sm`. Decorative (`aria-hidden`). Never orange, never glowing (the brand book's Iconography).
- **Figure** (optional): Barlow `number` (30px) in `text`, tabular.
- **Heading:** `heading-3` (22px) in `text`. **Text:** 17px `text-body`; links in it are `land` with an underline.
- With `href` the whole card is a link (`a.jw-surface--card`: the edge turns `line-strong` on hover).
- **CardGrid** (`jw-cardgrid`): one column on phones, two from 641px, three from 1024px with `jw-cardgrid--3`; gaps `space-5` / `space-6`. As a list (`<ul role="list">`) when the cards are a set.

## Plain HTML
```html
<ul class="jw-cardgrid jw-cardgrid--3" role="list">
  <li>
    <div class="jw-surface jw-surface--card jw-iconcard">
      <span class="jw-iconcard__icon" aria-hidden="true"><svg …lucide…></svg></span>
      <h3 class="t-heading-3 jw-iconcard__title">Treatment goes to the plant</h3>
      <p class="jw-iconcard__text">Each target gets its own dose, placed to within about 25 cm. Nothing is sprayed across the pasture.</p>
    </div>
  </li>
</ul>
```

## Astro
`<IconCard icon="Crosshair" [value] title | titleHtml [text | textHtml] [level] [href] [castShadow] />` from `src/layouts/components/jw/IconCard.astro`; the grid is the `jw-cardgrid` class. BenefitsSection renders both from content.

## Rules
- Three to six cards in a set; one idea each.
- On a sheen band the cards take the band shadow automatically. On a wall, use `castShadow`.
