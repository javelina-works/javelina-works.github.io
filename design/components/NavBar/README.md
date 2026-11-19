# NavBar

The top bar: the javelina and wordmark on the left, three or four links, an optional slot (such as the ThemeToggle) and a small primary on the right; under 640px the links fold behind a Menu button.

- By day it sits on `surface` with a `line` rule; at night it becomes shell sheen with grain.
- The current page link has `aria-current="page"` and turns `land`.
- The logo swaps by theme (`jw-logo--light` / `jw-logo--dark`).

## Props (React)
`links` (`[{ label, href, current }]`), `action` (`{ label, href }`), `lamp` (the action becomes a full-size lamp Button that lights the page as it scrolls under the bar), `homeHref`, `logos` (`{ light: { mark, wordmark }, dark: { mark, wordmark } }`; defaults to this system’s logo files), `children` (shown before the action).
