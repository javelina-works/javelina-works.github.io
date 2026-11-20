# Disclosure (and Accordion)

A question and its answer that opens in place: the FAQ, service-page questions, any "more detail" row. New for the site; derived from the system rules. It is a native `<details>`/`<summary>`, so it works without JavaScript, the browser's find-in-page opens it, and the keyboard needs nothing extra.

- **Accordion** (`jw-accordion`): the rows share one paper card (`surface`, `line` edge, `radius-md`, `shadow-raise`), split by `line` rules.
- **Solo** (`jw-disclosure--solo`): one row on its own card.
- **Row** (`jw-disclosure__summary`): at least 56px tall, padding `space-3` / `space-5` (`space-4` on phones). The question is 17px Figtree 500 in `text`.
  - A plus on the right (`text-muted`, 20px, drawn with two bars) turns into a minus when open. Only the upright bar turns, by `transform`, over `duration-hover`.
  - Hover fills the row with `surface-sunken`. Focus draws `shadow-focus`.
  - The cursor is a pointer. That also keeps PostHog autocapture recording clicks on the row, with the question as the element text, as it did for the old button toggles.
- **Answer** (`jw-disclosure__body`): Prose at full width (18px, 17px on phones, `text-body`). It fades in (opacity) when the row opens; nothing moves under reduced motion. Height never animates.
- **One open at a time:** give every `<details>` in a group the same `name`. Current browsers then close the others when one opens. The Astro Accordion adds a small script for browsers without that, and opens a row that the address bar's `#hash` points at.
- No orange and no green: opening a row is reading, not an action.

## Plain HTML
```html
<div class="jw-accordion">
  <details class="jw-disclosure" name="faq-ballpark" open id="faq-group-1-1-1">
    <summary class="jw-disclosure__summary">
      <span class="jw-disclosure__title">What is the ballpark estimate?</span>
      <span class="jw-disclosure__icon" aria-hidden="true"></span>
    </summary>
    <div class="jw-disclosure__body"><div class="jw-prose jw-prose--full"><p>…</p></div></div>
  </details>
  <details class="jw-disclosure" name="faq-ballpark">…</details>
</div>

<!-- one on its own -->
<details class="jw-disclosure jw-disclosure--solo">…</details>
```

## Astro
- `src/layouts/components/jw/Accordion.astro`: `<Accordion group="faq-ballpark" items={[{ summary, html, open?, id? }]} />`. Or put `<Disclosure>` children in the slot. `exclusive={false}` lets several rows stay open.
- `src/layouts/components/jw/Disclosure.astro`: `<Disclosure summary="…" name="…" open solo>answer</Disclosure>`.
  - `html` takes trusted markup instead of the slot. The `summary` slot takes markup for the question.
  - `prose={false}` drops the Prose wrapper.

## Rules
- Put the question in plain words in the summary; never a heading inside it (a summary is a button to screen readers, and a heading inside a button is lost).
- Keep answers visible in the HTML (closed rows still carry them): the FAQPage structured data relies on the answers being on the page.
- On the ground or on a band's card. Never straight on a wall or a sheen.
