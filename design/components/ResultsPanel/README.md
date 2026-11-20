# ResultsPanel

The answer card of a calculator or estimate: the ballpark's result, the brush return calculator's headline. New for the site; derived from the Surface card and the type scale.

- A paper card (`jw-surface--card`; on a band it takes `shadow-raise-on-band`; on a wall it can cast its shadow with `castShadow`), padding `space-6` (`space-5` / `space-4` on phones), `space-4` between its parts.
- **Eyebrow** (`jw-eyebrow`, mono in `label`), then the **headline figure** in Barlow (`display-m`, tabular figures, `text`), then **one line** under it (17px `text-body`).
- **Any graphic** next: a RangeBar, a Meter.
- **Facts** (`jw-results__facts`, a `<dl>`): label–value rows between `line` rules; the label is 16px `text-body` on the left, the value 16px `text` 500 on the right with tabular figures.
- **Note:** 16px `text-muted` (the caveat: "a planning range, not a bid").
- **Actions:** shell, burnt or ghost buttons. Never the glowing primary in the panel: the header lamp stays the page's one glowing action.
- With `aria-live="polite"` (the Astro `live` prop) a screen reader hears the new figure when a script fills it.
- Orange appears only if a button in it is orange; the figure itself is ink. Green only as a small keep chip.

## Plain HTML
```html
<div class="jw-surface jw-surface--card jw-results" aria-live="polite">
  <p class="jw-eyebrow jw-results__eyebrow">Your ballpark</p>
  <p class="t-display-m jw-results__value" id="price">…</p>
  <p class="jw-results__sub">…</p>
  <div class="jw-range">…</div>
  <dl class="jw-results__facts">
    <dt>Area inside the fence</dt><dd id="acres">640 ac</dd>
    <dt>Time on the ranch</dt><dd>1–2 weeks</dd>
  </dl>
  <p class="jw-results__note">This is a planning range, not a bid — a firm quote takes a scheduled survey flight over your ground.</p>
  <div class="jw-results__actions"><a class="jw-btn jw-btn--shell" href="…">…</a></div>
</div>
```

## Astro
`<ResultsPanel eyebrow value sub facts={[{ label, value, id? }]} note [valueId] [factsId] [live] [castShadow] [headingLevel]>graphic<Fragment slot="actions">…</Fragment></ResultsPanel>` from `src/layouts/components/jw/ResultsPanel.astro`.

## Rules
- One headline figure. If there are two answers, make two panels or make one of them a fact row.
- Say what the figure is in plain words with its unit ("212 ac", "1–2 weeks"); a range stays a range.
