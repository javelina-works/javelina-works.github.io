# CookieBanner

The consent notice at the foot of the screen, and its Choices pane. New for the site (a restyle of the existing banner); derived from the system rules.

- A paper card (`surface`, `line-strong` edge, `radius-md`, `shadow-raise-on-band`), fixed at the bottom: 8px from the edges on phones, 448px wide at the bottom left from 641px. It scrolls inside itself if a short screen can't hold the Choices pane.
- Text is 16px `text-body`; the privacy link is `land` with an underline, and takes a 44px-tall tap (an invisible strip centred on the words) without changing the line.
- It sits at `z-index: 5000`, above the sticky nav bar (40) and above third-party widgets that stack on their own (Leaflet maps reach 1000), so the notice can always be read and answered.
- Its actions do not glow: the header lamp is the page's one glowing action. The yes (OK, Accept all) is `shell`; the other (Choices, Save choices) is `quiet`. Both are the compact 44px size.
- The close button is a 44px square with a 16px ✕ in `text-muted` (`text` on hover, `shadow-focus` on focus), named "Close".
- The Choices pane is a `fieldset` of Checkbox rows under a 16px legend.

## Behaviour (site script, unchanged by the restyle)
The script shows and hides the banner by removing and adding the class `hidden` (so `.jw-consent.hidden` hides it here too), switches panes with the `hidden` attribute on `#cookie-summary` and `#cookie-options`, and changes the OK button's text to "Accept all" where prior consent is needed. `window.openCookiePreferences()` and the footer's Cookie preferences button reopen the Choices pane. The ids, button names, `role="dialog"` and `aria-live` are pinned by `tests/e2e/cookie-consent.spec.ts`.

## Plain HTML
```html
<div id="cookie-banner" class="jw-consent hidden" role="dialog" aria-live="polite" aria-labelledby="cookie-title">
  <button type="button" id="cookie-close" class="jw-consent__close" aria-label="Close">✕</button>
  <div id="cookie-summary" class="jw-consent__summary">
    <p id="cookie-title" class="jw-consent__text">We use cookies and record visits to improve the site. <a href="/privacy-policy/">Privacy policy</a></p>
    <div class="jw-consent__actions">
      <button type="button" id="cookie-customize" class="jw-btn jw-btn--quiet jw-btn--sm">Choices</button>
      <button type="button" id="cookie-accept" class="jw-btn jw-btn--shell jw-btn--sm">OK</button>
    </div>
  </div>
  <div id="cookie-options" class="jw-consent__options" hidden>
    <fieldset class="jw-consent__fieldset">
      <legend class="jw-consent__legend">Choose what we may use</legend>
      <label class="jw-check">…</label>
    </fieldset>
    <div class="jw-consent__actions">…Save choices (quiet), Accept all (shell)…</div>
  </div>
</div>
```
On the site: `src/layouts/components/global/CookieBanner.astro`, rendered once by Base.astro.

## Rules
- No mark on its buttons (the script rewrites the OK button's text).
- Never a primary (glowing) button here, and never a wall or sheen behind its text.
