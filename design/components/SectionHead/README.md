# SectionHead

The heading block at the top of a page section: an optional eyebrow, the section's `h2`, and a line or two of intro. New for the site; derived from the PageHeader and the type scale.

- Eyebrow: `jw-eyebrow` (mono in `label`). Title: `heading-1` (34px, 28px on phones) in `text`. Intro: 17px `text-body`, at most 60 characters a line. Buttons may follow in a row.
- Up to 760px wide, `space-10` below it (`space-8` on phones). `jw-sechead--center` centers it.
- Words marked bold or italic in content titles ("Why treat brush *plant by plant*") read as the rest of the headline: the system has one headline weight and no italic (see the HeadingEmphasis rule in `jw.css`).
- On the page ground or a card. Over a sheen band or a wall, put it on a card.

## Plain HTML
```html
<div class="jw-sechead">
  <p class="jw-eyebrow">…</p>
  <h2 class="t-heading-1 jw-sechead__title" id="benefits-title">Why treat brush plant by plant</h2>
  <p class="jw-sechead__text">…</p>
</div>
```

## Astro
`<SectionHead title="…" | titleHtml={markdownify(title)} [text | textHtml] [eyebrow] [titleId] [center] [level={3}]>buttons</SectionHead>` from `src/layouts/components/jw/SectionHead.astro`.

## Rules
- One `h2` per section. Give it an id and point the section's `aria-labelledby` at it.
- Never invent an eyebrow or intro to fill space.
