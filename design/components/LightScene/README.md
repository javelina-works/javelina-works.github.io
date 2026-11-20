# LightScene

Starts the lighting engine for the page, so lamps, tubes and status lights light the walls, pools, shadows and rivets around them.

Wrap the page (or the part of it that has lights) once. Without React, import the engine as a module and call `mount()` once (or, with `react/bundle.js` on the page, `JavelinaWorks.Lighting.mount()`); it finds everything by data attributes and keeps watching for new pieces.

## What it does, and what it costs
- Each LampWall's bumps and flakes are drawn once on the graphics card, at up to 2x screen resolution. After that a wall is lit again only when the light falling on it changes, and frames only run while something changes: scrolling, resizing, hovering the lamp, a flicker, a blink fading, a tube filling, the day/night switch. When the page is still, nothing runs.
- A status light blinks only while it is near the screen, and its fades step at about 30 frames a second (about 21 frames in 3 seconds).
- Up to six lights reach any one wall: the nearest six.
- Light pools, card shadows and rivet glints are pre-drawn and only slide (transform) and fade (opacity).
- With reduced motion turned on there is no flicker or blink and nothing waits to fill: lights are simply on. Without WebGL, or where WebGL is drawn in software, walls keep the static drawing (`jw-wall--static`, server-rendered) in their own colors. Walls are set up after load, while the page is idle.
- It also plays the once-only flicker for any `data-jw-flicker` element, and fills Meter and LightTube blocks marked `data-jw-reveal` on first view.
- The flicker length is `duration-flicker`.
- It reads the light colors (`light-*`) and distances (`lamp-reach`, `lamp-height` …) from the tokens, and day or night from `data-theme` on `<html>`.

## Plain HTML
```html
<section class="jw-wall jw-wall--static" data-jw-wall="flake" data-jw-seed="3"><canvas class="jw-wall__canvas" aria-hidden="true"></canvas>…cards…</section>
<a class="jw-btn jw-btn--primary" data-jw-light="lamp" data-jw-flicker href="/ballpark"><span class="jw-btn__mark" aria-hidden="true"></span>Get a ballpark</a>
<section class="jw-surface jw-surface--band-shell" data-jw-pool="band">…</section>
<script type="module">import { mount } from '/components/lighting.js'; mount();</script>
```
