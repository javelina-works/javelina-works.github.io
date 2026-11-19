# States: empty, loading, error

What a panel shows before it has anything, while it works, and when something went wrong: a tool's result area, a map frame, a list that came back empty. New for the site; derived from the system rules.

- **Empty** (`jw-state--empty`): a dashed `line-strong` frame on the ground, `radius-md`. A title (17px Figtree 500, `text`) and a line of what to do (16px `text-body`), and optionally an action.
- **Loading** (`jw-state--loading`, `role="status"`): a paper card with a static mono label (11.5px uppercase, `text-body`) such as "Loading", led by one small `text-muted` dot that fades slowly between full and 30% (opacity only, 1.6s each way). Under reduced motion the dot is simply on. The words never pulse, so they always read. Not green and not a light: it is not the status light.
- **Error** (`jw-state--error`, `role="alert"`): words in `error` crimson (the title), the explanation in `text-body`, on paper with a 3px `error` rule on the left. Never a red light, a red dot or a glow.
- Everything is at least 16px except the mono label.
- `jw-state--center` centers the words, for a large area such as an empty map frame.

## Plain HTML
```html
<div class="jw-state jw-state--empty"><p class="jw-state__title">…</p><p class="jw-state__text">Type an address, town, or GPS point first, or tap the map.</p></div>

<div class="jw-state jw-state--loading" role="status">
  <span class="jw-state__label"><span class="jw-state__dot" aria-hidden="true"></span>Loading</span>
  <p class="jw-state__text">Usually under a minute.</p>
</div>

<div class="jw-state jw-state--error" role="alert"><p class="jw-state__title">…</p><p class="jw-state__text">The sample didn't load. Refresh and try again.</p></div>
```

## Astro
`<State kind="empty|loading|error" [title] [text] [label="Loading"] [center]>text<Fragment slot="actions">…</Fragment></State>` from `src/layouts/components/jw/State.astro`.

## Rules
- Say what happened and what to do next, in plain words. No codes, no "Oops".
- A loading state that lasts more than a few seconds says how long it usually takes.
- One moving thing in view: while the dot fades, nothing else on the page moves.
