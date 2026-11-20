# Surface

Paper cards, orange tint callouts, and the shell and agave sheen bands that hold them.

## Variants
- `card`: paper (`surface`, `line`, `shadow-raise`). Most content lives here.
- `tint`: an orange tint callout (`action-tint`, `action-tint-outline`) for the one thing to act on in a section.
- `band-shell` / `band-agave`: full-width section backgrounds in the shell or agave sheen, with a soft streak and grain. **A band holds cards, maps and other components, never running text.** Put headings and copy on a card sitting on the band, or above the band on the page ground. Cards on a band lose their border and take `shadow-raise-on-band`.

## Props (React)
`variant`, `href` (cards and tints only; renders an `<a>`), `as` (element), `castShadow` (a card’s shadow moves with the lights: away from the lamp at night, down and right from the sun by day; needs a LightScene), `rivets` (a brass rivet in each corner; use on one or two cards a page), plus any other props (style, id). Bands render a `<section>`; give a band `data-jw-pool="band"` to let the lamp’s light pool across it.

## Rules
- At most one band per screen height; bands alternate with plain `bg`.
- Never put text straight on a sheen.
