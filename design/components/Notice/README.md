# Notice

A short callout set apart from the text around it: a planning-range caveat, a saved message, a lookup that failed. New for the site; derived from the system rules (and the Prose README's note that a callout had to be designed first).

- A paper card (`surface`, `line` edge, `radius-md`) with a 3px rule on its left, padding `space-4` / `space-5`, 16px Figtree in `text-body`.
- **Tones:** neutral (`line-strong` rule, the default), info (`land` rule), success, warning and error (rule and title in `success`, `warning`, `error`). The title is 16px Figtree 500; in the neutral and info tones it is `text`.
- Words carry the meaning. There is no colored dot, icon light or glow: a light is never red, and green stays small.
- Links inside are `land` with an underline; `strong` is `text` 500.
- Roles: a plain note is `role="note"`. One that appears after the page loads takes `role="status"` (polite) or, for an error, `role="alert"`.
- Inside Prose it keeps the paragraph spacing (`space-5` under it).

## Plain HTML
```html
<aside class="jw-notice jw-notice--info" role="note">
  <p class="jw-notice__title">A planning range, not a bid</p>
  <div class="jw-notice__body"><p>A firm quote takes a scheduled survey flight over your ground.</p></div>
</aside>
```

## Astro
`<Notice tone="neutral|info|success|warning|error" title="…" [live="polite|assertive"]>body</Notice>` from `src/layouts/components/jw/Notice.astro`. The MDX shortcode `<Notice type="…" title="…">` renders it.

## Rules
- One notice in view at a time; more than one means none stands out.
- Never orange: orange means action or treat.
