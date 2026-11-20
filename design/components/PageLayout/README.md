# PageLayout

How a page is laid out: the **container** (the page width and side gutters) and the **section** (one band of the page and its rhythm). New for the site; the numbers come from the brand book and the night-lamp prototype.

- `jw-container`: centered, 1200px of content (`--narrow` 760px for a reading column or a form, `--wide` 1280px), side gutters `space-4` (16px) on phones and `space-6` from 641px, never under the safe-area inset.
- `jw-section`: padding `space-20` top and bottom (`space-14` on phones); `jw-section--tight` space-10 (space-8); `jw-section--none` none.
- Two ground sections in a row share one gap: the second one's top padding is 0, so the space between them is the first one's bottom padding, not both stacked. Walls and bands keep their own padding. The rule has one class of specificity, so a page can still set a section's top padding itself.
- Tones:
  - ground: the page `bg`. Add `data-jw-pool="ground"` to let the lamp's light pool faintly across it.
  - sheen bands: `jw-surface jw-surface--band-shell` or `--band-agave` plus `jw-section--band`, which makes the band full width and square (its gutters come from the container inside) and keeps the band's sheen, streak and grain. Bands take `data-jw-pool="band"`. They hold cards, never running text.
  - walls: a LampWall (`jw-wall jw-wall--<texture> jw-wall--static` with `data-jw-wall` and `data-jw-seed`) plus `jw-section`. Cards only.
- Pooled sections and walls clip what overflows them (`overflow: hidden`), focus rings included: keep a little room around controls near their edges.

## Plain HTML
```html
<section class="jw-section" [data-jw-pool="ground"]>
  <div class="jw-container">…</div>
</section>
<section class="jw-section jw-surface jw-surface--band-shell jw-section--band" data-jw-pool="band">
  <div class="jw-container">…cards…</div>
</section>
<section class="jw-wall jw-wall--corrugated jw-wall--static jw-section" data-jw-wall="corrugated" data-jw-seed="5">
  <canvas class="jw-wall__canvas" aria-hidden="true"></canvas>
  <div class="jw-container">…cards…</div>
</section>
```

## Astro
`<Container [width="narrow|wide"]>` and `<Section tone="ground|shell|agave|wall" [texture] [seed] [pool] [width="narrow|wide|full"] [pad="tight|none"] [id] [aria-labelledby]>` from `src/layouts/components/jw/`. Inside a Container, lay out cards with Tailwind's layout utilities (`grid`, `gap-6`, `md:grid-cols-3`…): its spacing scale is the token grid.

## Rules
- One wall per screen height; at most two light colors in view.
- Body copy only on the ground or on a card.
