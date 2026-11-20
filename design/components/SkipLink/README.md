# SkipLink

The first thing a keyboard reaches on every page: "Skip to main content", which jumps past the nav bar to `<main id="main">`. New for the site; derived from the system rules.

- Out of sight until it has focus (moved above the screen with a transform, so it never takes space or a frame), then a small shell plate at the top left, over the sticky nav bar: mono 11.5px uppercase in `on-shell`, `radius-sm`, `shell-edge`, `shadow-focus`. 44px tall.
- `<main>` carries `tabindex="-1"` so the jump moves focus as well as the scroll; the sticky bar's `scroll-padding-top` keeps the top of main clear of the bar.

## Plain HTML
```html
<body>
  <a class="jw-skip" href="#main">Skip to main content</a>
  <nav class="jw-nav jw-nav--sticky" …>…</nav>
  <main id="main" tabindex="-1">…</main>
```

## Astro
`<SkipLink />` from `src/layouts/components/jw/SkipLink.astro` (props `href`, `label`). Base.astro renders it; pages never add another.

## Rules
- One per page, first in `<body>`.
- It shows only on focus: never style it visible at rest.
