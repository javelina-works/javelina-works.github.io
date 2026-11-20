# LampWall

A section wall that takes light from the lamp, tubes and status lights near it: flaky rust, corrugated tin, or smooth rust.

## Textures
- `flake` (heavy, flaky rust): the hero, the most dramatic.
- `corrugated` (vertical tin, ridges every `corrugation` px): feature and data sections; the ridges catch light on the side facing it.
- `smooth` (fine raking rust): quieter sections and the footer.

## Use
- Put cards, maps, tubes and status lights on a wall. Never put running text straight on it.
- At most one wall per screen height; alternate with plain ground or bands.
- By day the sun lights the wall from the upper left (`light-sun`); at night only the lights do, so a wall far from any light sits nearly dark. Plan where the lamp is.
- `seed` changes the pattern so two walls of the same texture don’t match.

## Props (React)
`texture` (`'flake'` | `'corrugated'` | `'smooth'`), `seed`, `as` (default `section`), plus style and other props. Needs a LightScene on the page.

## Plain HTML
Render the wall with `jw-wall--static`: it shows its static drawing (in its own day and night colors) until the engine has drawn its first WebGL frame, and keeps it without WebGL or JavaScript. The engine removes the class once the wall is lit; until then the canvas stays hidden, so a wall is never black while the page loads. The engine sets walls up one at a time while the page is idle after load, nearest the screen first, so their shader work never lands on first paint or a tap. Where WebGL would be drawn in software (no graphics chip), setting up a wall blocks the page for over a second, so there the wall simply keeps its static drawing; a check that needs the lit walls on such a machine sets localStorage `jw-gl` to `any` first.
```html
<section class="jw-wall jw-wall--flake jw-wall--static" data-jw-wall="flake" data-jw-seed="3">
  <canvas class="jw-wall__canvas" aria-hidden="true"></canvas>
  …cards…
</section>
```
The wall sets no padding; the page does. A change to `data-jw-seed` or the texture of an existing wall is not picked up; replace the element.
