# ImageCard (and ImageCards)

A point that comes with a picture: a paper card with the picture at the top, then a heading and a line or two. The services pages' showcases ("Stewardship", "Control", "Efficacy", "What satellite imagery already tells us"), the service cards on /services/ and "More of what we do". New for the site; derived from the Surface card, Figure and IconCard.

- **Card:** `jw-surface--card`, padding `space-3`, so the picture sits in a 12px paper frame (the prototype's map card). The words below it have `space-4` / `space-2` padding.
- **Picture:** a Figure (`jw-figure`, `radius-md`, photos dim at night, charts and tool screenshots `jw-figure--nodim`). Cropped to one shape with Figure's `ratio` (16:10 for points, 16:9 for service cards) so a row lines up. `jw-imagecard__figure--contain` shows the whole picture (a chart, a composed figure) on the sunken ground instead of cropping it. Real survey images, field photos and charts only; a tool screenshot only where the page describes that tool, with a caption saying so.
- **Heading:** `heading-3` (22px) in `text`. **Text:** 17px `text-body`; links in it are `land` with an underline, `text` on hover.
- **ImageCards** (`jw-imagecards`, a `<ul role="list">`): one column on phones, two from 641px; `jw-imagecards--3`: three from 1024px.
- **Mixed shapes** (`jw-imagecards--mixed`): every picture keeps its own shape and is never cropped. From 1024px three columns, where an item marked `jw-imagecards__item--wide` (a wide chart) spans two columns and `--tall` (a satellite strip) two rows. Below 1024px one column, with tall pictures held to 520px high on the sunken ground.
- **Link card** (`jw-imagecard--link`): the heading's link (`jw-imagecard__link`) stretches over the whole card, so the card takes the tap but the link's name is just the heading. Hover: the edge turns `line-strong` and the heading underlines. Focus: `shadow-focus` around the card. `jw-imagecard__more` adds a "Learn more" line in `land` with a 20px arrow; it is `aria-hidden` (the heading already names the link). Don't give a link card `castShadow`: the lit card's children are positioned, which stops the stretched link at the body.
- **Compact** (`jw-imagecard--compact`): no picture; an icon in the IconCard well (`jw-iconcard__icon`) instead, and IconCard's padding.
- **No motion.** Nothing zooms or slides on hover.

## Plain HTML
```html
<ul class="jw-imagecards jw-imagecards--3" role="list">
  <li class="jw-imagecards__item">
    <div class="jw-surface jw-surface--card jw-imagecard">
      <figure class="jw-figure jw-figure--crop jw-imagecard__figure">
        <div class="jw-figure__media" style="aspect-ratio: 16 / 10"><img src="/assets/images/survey-detections.jpg" alt="Survey image of brushy grassland with an orange box around each woody plant." width="1600" height="864"></div>
      </figure>
      <div class="jw-imagecard__body">
        <h3 class="t-heading-3 jw-imagecard__title">Only the right targets</h3>
        <p class="jw-imagecard__text">Every orange mark on this map is a plant we will treat, and nothing else is.</p>
      </div>
    </div>
  </li>
  <li class="jw-imagecards__item">
    <div class="jw-surface jw-surface--card jw-imagecard jw-imagecard--link">
      <figure class="jw-figure jw-figure--crop jw-imagecard__figure">…</figure>
      <div class="jw-imagecard__body">
        <h3 class="t-heading-3 jw-imagecard__title"><a class="jw-imagecard__link" href="/services/survey-work/">Survey work</a></h3>
        <p class="jw-imagecard__text">A drone survey of your ranch sharp enough to count every mesquite and cedar, sorted by species.</p>
        <span class="jw-imagecard__more" aria-hidden="true">Learn more <svg …lucide ArrowUpRight…></svg></span>
      </div>
    </div>
  </li>
</ul>
```

## Astro
- `<ImageCards items={[{ src, alt, dim?, fit?: "cover" | "contain", titleHtml, textHtml?, href? }]} [level] [castShadow] />` from `src/layouts/components/services/ImageCards.astro`. It picks the grid from the count and marks very tall pictures and wide `contain` charts itself. FeatureShowcase renders it from content.
- `src/layouts/components/cards/ServiceCard.astro`: a link card with a 16:9 picture and "Learn more", or `compact` with the service's icon.

## Rules
- One idea a card; the picture shows that idea.
- Alt text says what the picture shows, not the card's heading again.
- On a band, cards take the band shadow automatically; on a wall, use `castShadow` (not with links).
