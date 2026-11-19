# SegmentedControl

One choice from two to five short options, side by side: "This kind of year: Dry, Normal, Wet", a ladder's ranch size, a map's view. New for the site; derived from the ThemeToggle's well.

- **Well** (`jw-seg__track`): `surface-sunken` with `shadow-well`, `radius-sm`, 3px padding; options wrap onto a second row on a narrow phone rather than overflow.
- **Option** (`jw-seg__label`): 44px tall (at least 44px wide), IBM Plex Mono 11.5px uppercase in `text-body`; hover `text`.
- **Chosen:** a paper plate (`surface`, `text`) with the marigold `selected` ring (2px, inside) and its `selected-hairline` outside. Never orange, never a lamp.
- **Focus:** `shadow-focus` on the option; the chosen one keeps its ring inside the focus ring.
- **Legend** above it, styled as a Field label (or kept for screen readers only with `jw-sr-only` when a visible heading already names the choice).
- Real radio inputs (invisible, laid over each option): the arrow keys move the choice, it submits with a form, and it needs no JavaScript. Listen for `change`.
- **Button form** for pages that keep their own state (the pricing page's ladder): `<button class="jw-seg__btn" aria-pressed="true|false">` in the same well, styled the same. The page's script sets `aria-pressed`.

## Plain HTML
```html
<fieldset class="jw-seg">
  <legend class="jw-seg__legend">This kind of year</legend>
  <div class="jw-seg__track">
    <label class="jw-seg__opt" for="year-low"><input type="radio" class="jw-seg__input" id="year-low" name="yearType" value="low"><span class="jw-seg__label">Dry</span></label>
    <label class="jw-seg__opt" for="year-normal"><input type="radio" class="jw-seg__input" id="year-normal" name="yearType" value="normal" checked><span class="jw-seg__label">Normal</span></label>
    <label class="jw-seg__opt" for="year-high"><input type="radio" class="jw-seg__input" id="year-high" name="yearType" value="high"><span class="jw-seg__label">Wet</span></label>
  </div>
</fieldset>

<!-- button form -->
<div class="jw-seg" role="group" aria-label="Ranch size">
  <div class="jw-seg__track">
    <button type="button" class="jw-seg__btn" aria-pressed="true">…</button>
    <button type="button" class="jw-seg__btn" aria-pressed="false">…</button>
  </div>
</div>
```

## Astro
`<SegmentedControl name="yearType" legend="This kind of year" options={[{ value: "low", label: "Dry" }, …]} value="normal" [hideLegend] [idPrefix] />` from `src/layouts/components/jw/SegmentedControl.astro` (radio form only).

## Rules
- Two to five options of one or two words. Longer labels belong in a RadioGroup.
- Every option is always visible; never hide one behind "More".
