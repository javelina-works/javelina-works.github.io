# CtaBlock

The closing ask of a page, on a smooth-rust wall: a card with a heading, a few lines and up to two actions. New for the site; it is the prototype's "ballpark ask" section, carrying the site's existing call to action.

- A LampWall (`smooth`, seed 9 by default), padded like any section (space-20, space-14 on phones), holding a card up to 640px wide whose shadow moves with the lamp. The words sit on the card, never on the wall.
- Heading `t-heading-1` in `text`; the lines 17px `text-body`, links `land` with an underline.
- Neither action glows: the header lamp is the page's one glowing action. The first is `burnt` (solid tip orange with white text and a mark), the second `ghost`.

## Plain HTML
```html
<section class="jw-wall jw-wall--smooth jw-wall--static jw-section call-to-action" data-jw-wall="smooth" data-jw-seed="9" id="cta" aria-labelledby="cta-title">
  <canvas class="jw-wall__canvas" aria-hidden="true"></canvas>
  <div class="jw-container"><div class="jw-ask__frame">
    <div class="jw-lit" data-jw-shadow><span class="jw-cast" aria-hidden="true"></span><span class="jw-cast" aria-hidden="true"></span>
      <div class="jw-surface jw-surface--card jw-ask">
        <h2 class="t-heading-1 jw-ask__title" id="cta-title">Tell us about your place</h2>
        <div class="jw-ask__text"><p>…</p><p>…</p></div>
        <div class="jw-ask__actions">
          <a class="jw-btn jw-btn--burnt" href="/contact/" data-cta><span class="jw-btn__mark" aria-hidden="true"></span>Let's Talk</a>
          <a class="jw-btn jw-btn--ghost" href="/tools/ballpark/" data-cta>Get a ballpark</a>
        </div>
      </div>
    </div>
  </div></div>
</section>
```

## Astro
`<CtaBlock title="…" html={markdownify(text, true)} primary={{ label, href }} secondary={{ label, href }} [eyebrow] [texture] [seed] [id] />` from `src/layouts/components/jw/CtaBlock.astro` (or the text as the default slot). `sections/CallToAction.astro` renders it with the content from `src/content/sections/english/call-to-action.md`. A click on either action sends PostHog `cta_button_clicked` `{ label, url }`.

## Rules
- One per page, at the end, before the footer.
- Not straight after another wall (one wall per screen height).
- Never a primary (glowing) button in it.
