# Checkbox

A labeled checkbox for consent and choices (the cookie banner's switches, the newsletter's privacy consent, form agreements). New for the site; derived from the system rules.

- The whole row is the `<label>`, so the label text takes the tap as well as the box; the row is at least 44px tall.
- The box is 20px with a `line-strong` edge, `radius-xs`, on `surface-input`. Checked, it fills with ink (`text`) and shows a check in `surface`, so it stays neutral (not orange, which means action, or green, which means running or kept) and reads by day and at night.
- Focus draws `shadow-focus` on the box. Disabled fades to .55 and the row stops looking clickable.
- The label is 16px `text-body`; a `<strong>` name inside it is `text` at weight 500; links inside it are `land` with an underline and do not wrap. A link takes a 44px-tall tap (an invisible strip centred on the words), so a near miss above or below opens the link instead of ticking the box.

## Plain HTML
```html
<label class="jw-check">
  <input type="checkbox" class="jw-check__box" id="opt-analytics" name="analytics" [checked] [disabled] [required]>
  <span class="jw-check__text"><strong>Analytics</strong> — which pages and tools get used, so we can improve them.</span>
</label>
```

## Astro
`<Checkbox id="privacy-consent" name="privacy-consent" required>I agree with <a href="/privacy-policy/">privacy policy</a></Checkbox>` from `src/layouts/components/jw/Checkbox.astro`. The label is the default slot (or `label`); every other prop goes on the `<input>`.

## Rules
- A checkbox is a choice, not an action: never tip orange.
- Put the consequence in the label in plain words; the name in `<strong>` when there are several.
- Radio buttons and switches are not designed yet.
