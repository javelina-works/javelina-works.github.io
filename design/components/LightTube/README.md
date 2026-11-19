# LightTube

A glowing tube mounted on a wall with brass clamps, which fills to a value when it first comes into view and lights the wall around it; a green pilot on the left clamp comes on with it, and a riveted plate below gives the number.

- The tube’s light is `light-tube`, redder than the lamp, so you can see two lights meet on the wall.
- The plate’s rivets and the right clamp’s rivet catch a glint from each light nearby.
- For screen readers the whole thing reads as one image: “Pasture 4 · treated: 212 of 640 ac”.

## Props (React)
`label`, `value`, `max`, `unit` (default `ac`), `pilot` (default true), `plate` (default true). Put it on a LampWall, inside a LightScene.

## Rules
- One tube per section. It is the section’s one figure.
