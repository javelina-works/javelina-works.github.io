# ArticleCard

An article in a list: the article index, its second page, and "Keep reading" under each article. New for the site; derived from the Surface card, the eyebrow, the type scale and Figure's night dimming.

- **Card:** a paper card (`jw-surface jw-surface--card`). On a sheen band it takes the band's card shadow, like any card.
- **Picture:** the article's picture cropped to 16:9 (`object-fit: cover`; the page may set `object-position` so the crop keeps the subject). A photo (`jw-article-card__media--photo`) dims to `photo-brightness-dark` at night; a survey image or map (`--diagram`) keeps its colors. Its alt text says what it shows, never the article's title.
- **Words:** the category as a `jw-eyebrow`; the title at `heading-3` (`heading-2` on the wide card) in `text`; the excerpt at 17px in `text-body`; the date at 16px in `text-muted`; a "Read more" cue in `land`, in the button type, with a drawn arrow.
- **One link:** the title's link is stretched over the whole card (`::after`), so the card is one big tap target and one tab stop. The "Read more" cue is `aria-hidden`: the link's name is the title. Hover underlines the title (2px) and firms the card's edge to `line-strong`; focus puts `shadow-focus` around the card.
- **Wide** (`jw-article-card--wide`): the featured article at the top of the list. From 900px the picture fills the left side and the words sit beside it.
- Nothing in it glows or moves.

## Plain HTML
```html
<article class="jw-surface jw-surface--card jw-article-card">
  <div class="jw-article-card__media jw-article-card__media--photo">
    <picture>…<img src="…" alt="A drone flies over desert grassland and brush under a rain cell, …" loading="lazy"></picture>
  </div>
  <div class="jw-article-card__body">
    <p class="jw-eyebrow jw-article-card__eyebrow">Brush management</p>
    <h2 class="t-heading-3 jw-article-card__title"><a class="jw-article-card__link" href="/articles/brush-and-water-dry-country/">Will clearing brush bring the water back?</a></h2>
    <p class="jw-article-card__excerpt">The honest water answer for 12 to 18 inch country: …</p>
    <div class="jw-article-card__foot">
      <time class="jw-article-card__date" datetime="2026-10-25T17:00:00.000Z">Oct 25, 2026</time>
      <span class="t-button jw-article-card__more" aria-hidden="true">Read More <svg>…</svg></span>
    </div>
  </div>
</article>
```

## Astro
`<BlogCard content={{ ...post.data, ...post }} [layout="horizontal"] [headingLevel={3}] [loading="eager"] />` from `src/layouts/components/cards/BlogCard.astro`. The alt text, the photo/diagram choice and the crop position come from `src/layouts/components/articles/articleImages.ts`, keyed by the article's `image`.

## Rules
- A list of cards is a `<ul role="list">`; card titles are `h2` under the page's `h1`, `h3` under a section's `h2`.
- Show the excerpt the article already has; never write a new teaser for the card.
- Text never sits on the picture.
