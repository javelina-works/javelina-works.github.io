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
