# NumberField

A labeled number, with 44px − and + buttons for thumbs: acres to treat, plants per acre. New for the site; it extends the Field.

- The Field's input (44px, `line-strong`, `surface-input`, 16px, tabular figures) with an optional unit suffix in mono, and, either side, a 44×44 step button: `line-strong` edge, `radius-sm`, `surface-input`, an ink (`text`) minus or plus drawn with 2px bars. Hover fills `surface-sunken`; focus draws `shadow-focus`; disabled fades.
- A press moves the value by the input's `step` within `min` and `max` and fires `input` and `change` on the input, just like typing, so page scripts need nothing extra.
- The browser's own tiny spinners are hidden (they are far under 44px). The arrow keys still step the value.
- `steppers={false}` gives the bare input.
- Each step button has a name ("Decrease Acres to treat", "Increase Acres to treat") and `aria-controls` pointing at the input.

## Plain HTML
```html
<div class="jw-field">
  <label class="jw-field__label" for="acres">Acres to treat</label>
  <div class="jw-number" data-jw-number>
    <button type="button" class="jw-number__step jw-number__step--down" data-step="-1" aria-label="Decrease Acres to treat" aria-controls="acres"></button>
    <div class="jw-input-wrap">
      <input class="jw-input jw-number__input jw-input--suffixed" id="acres" name="acres" type="number" min="1" step="1" value="640">
      <span class="jw-input__suffix" aria-hidden="true">ac</span>
    </div>
    <button type="button" class="jw-number__step jw-number__step--up" data-step="1" aria-label="Increase Acres to treat" aria-controls="acres"></button>
  </div>
</div>
```

## Astro
`<NumberField label="Acres to treat" id="acres" name="acres" min={1} step={1} value={640} suffix="ac" [hint] [error] [steppers={false}] [decreaseLabel] [increaseLabel] />` from `src/layouts/components/jw/NumberField.astro`. Every other prop goes on the `<input>`.

## Rules
- Use it for counts and amounts people type; for a value people pick along a scale, use the Slider.
- Put the unit in the label too when it matters (the suffix is hidden from screen readers).
