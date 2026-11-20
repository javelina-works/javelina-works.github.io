# RadioGroup

One choice from two to five options, each with a few words: a tool's "Main brush" or "Ground underneath". New for the site; it extends the Checkbox.

- A `<fieldset>` with its `<legend>` styled as a Field label (16px Figtree 500 in `text`), an optional hint under it, then one row per option.
- Each row is the Checkbox row (`jw-check`): the whole row is the `<label>` and takes the tap; it is at least 44px tall; the words are 16px `text-body`. A row can carry a hint of its own.
- The dot (`jw-radio__dot`) is 20px round with a `line-strong` edge on `surface-input`. Checked, a 6px ink (`text`) ring closes around a small `surface-input` center. It stays neutral by day and at night: never orange (action) or green (running, kept).
- Focus draws `shadow-focus` on the dot. Disabled fades to .55. An error goes under the rows in `error` words.
- `jw-radios--inline` sets the rows side by side, wrapping on a phone.
- The arrow keys move the choice (the browser's own radio behavior); the group submits with a form.

## Plain HTML
```html
<fieldset class="jw-radios">
  <legend class="jw-radios__legend">Main brush</legend>
  <div class="jw-radios__list">
    <label class="jw-check jw-radio"><input type="radio" class="jw-radio__dot" name="brush" value="mesquite" checked><span class="jw-check__text">Mesquite</span></label>
    <label class="jw-check jw-radio"><input type="radio" class="jw-radio__dot" name="brush" value="juniper"><span class="jw-check__text">Cedar / juniper</span></label>
  </div>
</fieldset>
```

## Astro
`<RadioGroup name="brush" legend="Main brush" options={[{ value, label, hint?, disabled? }]} value="mesquite" [inline] [hint] [error] [required] [idPrefix] />` from `src/layouts/components/jw/RadioGroup.astro`. Input ids are `<idPrefix or name>-<value>`.

## Rules
- Two to five options. Short ones that read as settings (Dry / Normal / Wet) can be a SegmentedControl instead.
- Always preselect the sensible default when there is one.
