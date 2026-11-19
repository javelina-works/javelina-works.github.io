# Button

Seven buttons: the tip-orange primary for the one thing the page is for, burnt for a second strong action, tint and ghost for lighter orange actions, shell or agave for secondary actions, and quiet for everything else.

## By day and at night
- **By day** the primary is tip orange (`action`) with a lighter 1px outline (`action-outline`) and sunlight on its top edge (`shadow-action`). When someone hovers, focuses or presses it, a lit layer fades in over `duration-glow`: an amber body (`lit-body` → `lit-body-mid` → `lit-body-edge`), a lit rim and a halo on every side (`shadow-glow`).
- **At night** the lit layer is on at rest in ember, turned down a touch and held close to the button, and turns up on hover (`shadow-glow-hover`).
- Only the primary lights up. The other six never glow.

## Variants
- `primary`: at most one per view. Leads with the small square mark.
- `burnt` (`action-strong`, white label, a light `action-strong-outline` that matches its square): a second strong action, or orange on an orange tint. Approve plan, Book a survey.
- `tint` and `ghost`: lighter orange actions: See pricing, Download map.
- `shell` / `agave`: secondary actions. Shell is the default; agave fits land and plant topics.
- `quiet`: an outline in `line-strong`. Log in, Cancel.
- `size: 'sm'`: the compact button for nav bars and dense tools: a smaller label and tighter padding, but still 44px tall, because every tap target is at least 44px. Every button is also at least 44px wide, so a short label such as OK still makes a 44px target.

## Props (React)
`variant`, `size`, `href` (renders an `<a>`; otherwise a `<button>`), `mark`, `lamp` (a primary only: the button becomes the page’s lamp, flickers on the first time it comes into view and lights the walls around it; needs a LightScene), `attention` (`'flicker'` | `'glint'` | `'breathe'`, see Attention), `disabled`, `children`. Other props pass through.

## Plain HTML
```html
<a class="jw-btn jw-btn--primary" href="/ballpark"><span class="jw-btn__mark" aria-hidden="true"></span>Get a ballpark</a>
<!-- the page's lamp (once, in the NavBar): -->
<a class="jw-btn jw-btn--primary" href="/tools/ballpark/" data-jw-light="lamp" data-jw-flicker><span class="jw-btn__mark" aria-hidden="true"></span>Get a ballpark</a>
<!-- a <button> sets its type; React defaults to type="button" -->
<button type="submit" class="jw-btn jw-btn--burnt"><span class="jw-btn__mark" aria-hidden="true"></span>Send</button>
```

## Rules
- Labels are short verbs in the `button` style.
- Orange labels are `on-action` (dark ink); burnt labels are `on-action-strong` (white). White on tip or amber fails.
- Never two primaries side by side, and never a rust button.

## Text color
Each variant owns its text color in every state (at rest, hover, press, focus, visited) through `--btn-fg`, held by a rule that link and page styles can’t outrank. A button rendered as a link never picks up the page’s link colors.
