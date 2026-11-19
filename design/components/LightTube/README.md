# LightTube

A glowing tube mounted on a wall with brass clamps, which fills to a value when it first comes into view and lights the wall around it; a green pilot on the left clamp comes on with it, and a riveted plate below gives the number.

- The tube’s light is `light-tube`, redder than the lamp, so you can see two lights meet on the wall.
- The plate’s rivets and the right clamp’s rivet catch a glint from each light nearby.
- For screen readers the whole thing reads as one image: “Pasture 4 · treated: 212 of 640 ac”.

## Props (React)
`label`, `value`, `max`, `unit` (default `ac`), `pilot` (default true), `plate` (default true), `animate` (default true). Put it on a LampWall, inside a LightScene.

## Filling
The fill's width is set once and it fills by `transform: scaleX()` only. The lighting engine does the filling (`data-jw-reveal` on the block): below the fold at load the tube waits empty with its pilot off, gives no light, and fills on first view (60% in view); the pilot fades on with it. Already in view at load, without the engine, or with reduced motion, it is simply full with the pilot on.

## Plain HTML
```html
<div class="jw-tube-block" data-jw-reveal>
  <div class="jw-lit jw-tube" data-jw-shadow="" role="img" aria-label="Pasture 4 · treated: 212 of 640 ac">
    <span class="jw-cast" aria-hidden="true"></span><span class="jw-cast" aria-hidden="true"></span>
    <div class="jw-tube__track"><i class="jw-tube__fill" data-jw-light="tube" style="width: 33.125%"></i></div>
    <span class="jw-tube__clamp jw-tube__clamp--l" aria-hidden="true"><span class="jw-pilot is-on" data-jw-light="pilot"></span></span>
    <span class="jw-tube__clamp jw-tube__clamp--r" aria-hidden="true"><span class="jw-rivet" aria-hidden="true"><i></i><i></i><i></i></span></span>
  </div>
  <div class="jw-lit" data-jw-shadow="">
    <span class="jw-cast" aria-hidden="true"></span><span class="jw-cast" aria-hidden="true"></span>
    <div class="jw-surface jw-surface--card jw-plate" aria-hidden="true">
      <span class="jw-plate__label">Pasture 4 · treated</span>
      <span class="jw-plate__value">212 <small>of 640 ac</small></span>
      <span class="jw-rivet jw-rivet--tl" aria-hidden="true"><i></i><i></i><i></i></span> … --tr, --bl, --br
    </div>
  </div>
</div>
```

## Rules
- One tube per section. It is the section’s one figure.
