# SurveyMap

A survey photo with a marker on every plant, where the rancher clicks plants to switch them between treat and keep, and the counts update.

## Behavior
- Treat markers are tip-orange rings with a see-through center, so the plant still shows. A ring pulses out every `duration-ping`.
- Hover or focus a marker and it lights up (`shadow-glow-marker-hover`) and shows a label. By day that is the only time markers glow; at night they glow at rest.
- Keep markers are pale sage rings (`juniper-100`) with no glow and no pulse.
- The last plant clicked gets the marigold `selected` ring.
- The treat and keep counts sit bottom-left as chips and are announced to screen readers.
- At night the photo dims to `photo-brightness-dark`.

## Props (React)
`src`, `alt`, `plants` (`[{ id, x, y, status: 'treat' | 'keep' }]`, x and y as percentages of the photo; the starting set), `height` (px, default 260), `editable` (default true), `showCounts` (default true), `onChange(plants)`.

## Rules
- Use a real survey image.
- With more than about 30 treat markers in view, set the pulse off in your page CSS and keep the markers.
