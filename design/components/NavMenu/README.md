# NavMenu

The panel under a NavBar menu trigger (Services, Tools): a short list of links, each with an optional one-line description, and an optional "all" link at the foot. New for the site; derived from the system rules.

- It is a disclosure, not an ARIA menu: the trigger is a `<button>` with `aria-expanded` and `aria-controls`, the panel is shown or hidden with the `hidden` attribute, and the items are plain links, so Tab, screen readers and middle-click work as they do for any link.
- On wide screens it is a paper card (`surface`, `line` edge, `radius-md`, `shadow-raise`) just under the bar, by day and at night. It is not a sheen, because it holds short running text. `jw-navmenu--end` lines it up with the trigger's right edge instead of its left.
- Each item is at least 44px tall: the label in 16px `text` (weight 500) and the description in 16px `text-muted`. Hover fills it with `surface-sunken`; focus draws `shadow-focus`; the current page's label turns `land` (`aria-current="page"` on the link).
- The "all" link (`jw-navmenu__all`) sits under a `line` rule, in `land`.
- Folded (900px and below, inside the NavBar's Menu panel) it is an indented list of nav links on the bar, without the card or the descriptions.
- The caret turns over when the menu is open (a transform; off for reduced motion).

## Behaviour
Escape closes it and returns focus to the trigger; a click outside closes it; opening one menu closes the other; on wide screens, tabbing out of it closes it. It never opens on hover.

## Plain HTML
```html
<div class="jw-nav__group">
  <button type="button" class="jw-nav__link jw-nav__trigger [is-current]" aria-expanded="false" aria-controls="nav-menu-services">Services<span class="jw-nav__caret" aria-hidden="true"></span></button>
  <div class="jw-navmenu [jw-navmenu--end]" id="nav-menu-services" hidden>
    <ul class="jw-navmenu__list">
      <li><a class="jw-navmenu__item" href="/services/brush-targeting/" [aria-current="page"]>
        <span class="jw-navmenu__label">Brush targeting</span><span class="jw-navmenu__desc">Plant-by-plant treatment from the air.</span></a></li>
      …
    </ul>
    <a class="jw-navmenu__all" href="/services/">All services</a>
  </div>
</div>
```

## Rules
- Four or five items at most; the label says where the link goes.
- No icons, images or buttons in the panel, and never the lamp: the one action stays in the bar.
