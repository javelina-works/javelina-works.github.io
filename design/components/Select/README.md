# Select

A labeled choice from a list too long for radio buttons: a contact form's reason, a tool's range site. New for the site; it extends the Field.

- A native `<select>` with the Field's look: 44px tall, `radius-sm`, a `line-strong` edge on `surface-input`, 16px Figtree in `text`. The browser's arrow is replaced by a drawn caret (two 1.5px strokes in `text-muted`), so it reads the same everywhere and holds by day and at night.
- The open list is the browser's own (it follows `color-scheme` from the tokens, so it is dark at night). Options use `surface-input` and `text`.
- Label above (`jw-field__label`), hint and error below, exactly as in Field. Focus: `focus` border and `shadow-focus`. Errors: `error` border and words.
- Disabled fades to .55.

## Plain HTML
```html
<div class="jw-field">
  <label class="jw-field__label" for="subject">Why are you reaching out today?</label>
  <div class="jw-select-wrap">
    <select class="jw-input jw-select" id="subject" name="Contact Subject">
      <option value="Services and Quotes" selected>Services and Quotes</option>
      <option value="General Inquiry">General Inquiry</option>
    </select>
  </div>
  <span class="jw-field__hint" id="subject-hint">…</span>
</div>
```

## Astro
`<Select label="…" id="…" name="…" options={[{ value, label, disabled? }]} value="…" hint="…" error="…" />` from `src/layouts/components/jw/Select.astro`, or `<option>`s in the slot. Every other prop goes on the `<select>`.

## Rules
- Use a select for six or more options; for two to five, use a RadioGroup or a SegmentedControl, so every choice is visible.
- Never style the open list; it belongs to the browser and the phone.
