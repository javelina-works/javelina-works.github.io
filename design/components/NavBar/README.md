# NavBar

The top bar: the javelina and wordmark on the left, three or four links (a link can open a NavMenu, such as Services or Tools), an optional slot (such as the ThemeToggle) and the action on the right. The action is the page's lamp: the primary "Get a ballpark".

- By day it sits on `surface` with a `line` rule; at night it becomes shell sheen with grain.
- The current page link has `aria-current="page"` and turns `land`; a menu trigger whose menu holds the current page gets `is-current`.
- The logo swaps by theme (`jw-logo--light` / `jw-logo--dark`). Give the images `width`/`height` so nothing shifts.
- **The action sits outside the links**, so the lamp stays in view at every width, keeps lighting the walls, and flickers on when the page is first seen (never when someone opens a menu).
- `jw-nav--sticky` keeps the bar at the top of the viewport, so the lamp lights each wall as it scrolls under the bar. It sticks within its parent, so the bar must be a child of the page (`<body>` or a full-height wrapper), not of a short `<header>`. Anchor jumps are kept clear of it (`scroll-padding-top`).
- As the bar narrows the wordmark goes first (1023px and below; it stays the link's name for screen readers), then the links fold behind a Menu button (900px and below). The folded panel opens under the bar, scrolls if it is taller than the screen, and holds the menus as indented lists, the `moreLinks` (links that live in the footer on wider screens) and the slot.
- Every link, trigger and button in the bar is at least 44px tall.

## Behaviour (no React needed)
- Menu: `<button class="jw-nav__menu" aria-expanded aria-controls="…links id">` toggles `is-open` on the nav, `aria-expanded`, and its label between Menu and Close.
- Menus are disclosures (see NavMenu): a trigger button with `aria-expanded` and `aria-controls` shows or hides its panel with `hidden`. Opening one closes the other.
- Escape closes an open menu and returns focus to its trigger; a second Escape closes the folded panel and returns focus to Menu. It listens on the document, so it works wherever focus is (Safari does not focus a clicked button); focus moves back only if it was in the nav or nowhere. A click outside closes both. On wide screens, tabbing out of a menu closes it.
- Folded (900px and below), the links move after the action in the DOM, so Tab goes Menu, the lamp, then the open panel, as drawn; on wide screens they move back before it. The links move, never the lamp, so its flicker carries on.

## Props (React)
`links` (`[{ label, href, current }]`, or a menu `{ label, items: [{ label, href, description, current }], all: { label, href }, current, align: 'end' }`), `moreLinks` (`[{ label, href, current }]`, folded panel only), `action` (`{ label, href }`), `lamp` (the action becomes the lamp Button), `sticky`, `id` (base for the `aria-controls` ids), `homeHref`, `logos` (`{ light: { mark, wordmark }, dark: { mark, wordmark } }`; defaults to this system's logo files), `children` (the slot, shown after the links).

## Plain HTML
```html
<nav class="jw-nav jw-nav--sticky" aria-label="Main">
  <a class="jw-nav__brand" href="/">
    <img class="jw-logo--light" src="/assets/logos/javelina-rust.svg" alt="" width="32" height="24" style="height:24px;width:auto">
    <img class="jw-logo--dark" src="/assets/logos/javelina-white.svg" alt="" width="32" height="24" style="height:24px;width:auto">
    <img class="jw-logo--light jw-nav__wordmark" src="/assets/logos/wordmark-ink.svg" alt="Javelina Works" width="152" height="13" style="height:13px;width:auto">
    <img class="jw-logo--dark jw-nav__wordmark" src="/assets/logos/wordmark-white.svg" alt="Javelina Works" width="152" height="13" style="height:13px;width:auto">
  </a>
  <button type="button" class="jw-nav__menu" aria-expanded="false" aria-controls="nav-links">Menu</button>
  <div class="jw-nav__links" id="nav-links">
    <div class="jw-nav__group">
      <button type="button" class="jw-nav__link jw-nav__trigger" aria-expanded="false" aria-controls="nav-menu-services">Services<span class="jw-nav__caret" aria-hidden="true"></span></button>
      <div class="jw-navmenu" id="nav-menu-services" hidden>…see NavMenu…</div>
    </div>
    <a class="jw-nav__link" href="/pricing/" aria-current="page">Pricing</a>
    <a class="jw-nav__link" href="/contact/">Contact</a>
    <div class="jw-nav__more"><a class="jw-nav__link" href="/company/">Company</a> …</div>
    …slot (ThemeToggle)…
  </div>
  <a class="jw-btn jw-btn--primary jw-nav__action" href="/tools/ballpark/" data-jw-light="lamp" data-jw-flicker><span class="jw-btn__mark" aria-hidden="true"></span>Get a ballpark</a>
</nav>
```
Child order matters: brand, Menu button, links, action (the script moves the links after the action at 900px and below; without JS this order stands). Without `lamp`, the action is a `jw-btn--sm` primary.
