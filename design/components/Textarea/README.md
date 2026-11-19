# Textarea

A labeled box for a few sentences: a contact message, "Anything we should know?". New for the site; it extends the Field.

- The Field's input, several lines tall: at least 132px, padding 10px / 12px, 16px Figtree with a 1.5 line height, `radius-sm`, `line-strong` edge on `surface-input`.
- It grows only downward, by its corner (`resize: vertical`), so it never pushes the page sideways.
- Label, hint, error and focus exactly as in Field.

## Plain HTML
```html
<div class="jw-field">
  <label class="jw-field__label" for="message">What can we do for you?</label>
  <textarea class="jw-input jw-textarea" id="message" name="Message" rows="4" placeholder="Let us know what we can do for you"></textarea>
</div>
```

## Astro
`<Textarea label="…" id="…" name="…" [value] [hint] [error] [reserveError] />` from `src/layouts/components/jw/Textarea.astro`; the value can also be the default slot. Every other prop goes on the `<textarea>` (`rows`, `maxlength`, `required`, `placeholder`…).

## Rules
- Say in the label what you want to hear about; keep the placeholder as an example, never the only label.
