# Figure

A photo or diagram in the page, with an optional caption. New for the site; derived from the system's photo rules.

- The image sits in a `radius-md` frame on `surface-sunken` (what shows while it loads), full width of its column. `jw-figure--crop` with an `aspect-ratio` on the frame crops it with `object-fit: cover`.
- At night photos dim to `--photo-brightness-dark` (.82), like every photo in the system. Diagrams, maps and screenshots whose colors carry meaning take `jw-figure--nodim`.
- The caption is 16px `text-muted`, under the image.
- On the site it is served through `astro:assets` `<Picture>`: AVIF and WebP with a responsive `srcset`, the original format as the fallback, lazy by default.

## Plain HTML
```html
<figure class="jw-figure [jw-figure--nodim] [jw-figure--crop]">
  <div class="jw-figure__media" [style="aspect-ratio: 16 / 9"]>
    <picture><source type="image/avif" srcset="…"><source type="image/webp" srcset="…"><img src="…" alt="…" width="…" height="…" loading="lazy" decoding="async"></picture>
  </div>
  <figcaption class="jw-figure__caption">…</figcaption>
</figure>
```

## Astro
`<Figure src={image} alt="…" caption="…" [ratio="16 / 9"] [dim={false}] [widths] [sizes] [loading="eager"] [fetchpriority="high"] />` from `src/layouts/components/jw/Figure.astro`. `src` is an imported image, or a content path such as `/images/process/routes-region.jpg` (looked up in `src/assets/images`). A path that is only in `public/` renders a plain `<img>` and needs `width` and `height`.

## Rules
- Real alt text that says what the image shows; `alt=""` only when the caption says it all.
- Never text on a photo: captions go under it.
- The first image in view may be `loading="eager"`; the rest stay lazy.
