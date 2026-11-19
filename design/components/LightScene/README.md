# LightScene

Starts the lighting engine for the page, so lamps, tubes and status lights light the walls, pools, shadows and rivets around them.

Wrap the page (or the part of it that has lights) once. Without React, call `JavelinaWorks.Lighting.mount()` after the page loads; it finds everything by data attributes and keeps watching for new pieces.

## What it does, and what it costs
- Each LampWall's bumps and flakes are drawn once on the graphics card, at up to 2x screen resolution. After that, one lighting pass per wall runs per frame, and frames only run while something changes: scrolling, resizing, hovering the lamp, a flicker, a blink fading, a tube filling, the day/night switch.
- Up to six lights reach any one wall: the nearest six.
- Light pools, card shadows and rivet glints are pre-drawn and only slide (transform) and fade (opacity).
- With reduced motion turned on there is no flicker or blink: lights are simply on. Without WebGL, walls show a static drawing in their own colors.
- It reads the light colors (`light-*`) and distances (`lamp-reach`, `lamp-height` …) from the tokens, and day or night from `data-theme` on `<html>`.

## Plain HTML
```html
<section class="jw-wall" data-jw-wall="flake" data-jw-seed="3">…cards…</section>
<a class="jw-btn jw-btn--primary" data-jw-light="lamp" data-jw-flicker href="/ballpark"><span class="jw-btn__mark"></span>Get a ballpark</a>
<section class="jw-surface jw-surface--band-shell" data-jw-pool="band">…</section>
<script>JavelinaWorks.Lighting.mount();</script>
```
