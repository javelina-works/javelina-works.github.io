# Slider

A value picked along a scale, with the number always in view: brush cover, rainfall, ranch size. New for the site; derived from the system rules.

- **Head:** the label in IBM Plex Mono (11.5px, uppercase, tracked, `text-body`) on the left, the readout on the right: the number in Barlow 22px `text` with tabular figures, its unit in mono `text-muted`.
- **Track:** an 8px well (`surface-sunken`, `shadow-well`, round ends), filled in ink (`text`) from the start up to the thumb. Ink, not orange: picking a value is not the page's action, and nothing on it glows.
- **Thumb:** a 24px circle (`surface` center, 2.5px ink ring) inside a 44px hit area, so it takes a thumb or an unsteady hand. Focused from the keyboard, or held, it wears the marigold `selected` ring with its `selected-hairline` outside.
- **Under it:** optional end labels in mono `text-muted`, and an optional hint (16px, like a Field hint).
- The input is 44px tall. The arrow keys, Page Up/Down, Home and End work (the browser's own range input).
- A small script keeps the fill (`--jw-p`, 0 to 1), the readout and `aria-valuetext` ("18 %") in step as it moves. A page script that sets the value itself dispatches `input` afterwards. Without JavaScript the slider still works and submits; the readout and fill keep their first values.
- Nothing animates, so there is nothing to stop under reduced motion.

## Plain HTML
```html
<div class="jw-slider" data-jw-slider data-unit="%">
  <div class="jw-slider__head">
    <label class="jw-slider__label" for="cover">Brush cover today</label>
    <output class="jw-slider__value" for="cover" aria-hidden="true"><span data-jw-slider-text>18</span><span class="jw-slider__unit">%</span></output>
  </div>
  <input type="range" class="jw-slider__input" id="cover" name="coverNow" min="1" max="60" step="1" value="18" aria-valuetext="18 %" style="--jw-p: .2881">
  <div class="jw-slider__scale" aria-hidden="true"><span>1%</span><span>60%</span></div>
</div>
```

## Astro
`<Slider label="Brush cover today" id="cover" name="coverNow" min={1} max={60} value={18} unit="%" [step] [prefix] [decimals] [minLabel] [maxLabel] [hint] />` from `src/layouts/components/jw/Slider.astro`. Other props go on the `<input>`.

## Rules
- Always show the number; never make someone guess where the thumb sits.
- Use a NumberField instead when people know the exact figure (their acreage), and a Slider when they are estimating (cover, rainfall).
