# RangeBar

A low–high band with a mark for the point estimate: the ballpark's budget range, a plant-count range. New for the site; derived from the Meter.

- **Track:** a 12px well like the Meter's (`surface-sunken`, `shadow-well`, round ends), with `space-2` above and below.
- **Band:** the range, filled in `land` (juniper by day, sage at night) with round ends. A range is not an action, so it is never orange and never glows; land holds well over 3:1 against the well by day and at night.
- **Marker** (optional): a 4×28px ink (`text`) bar with a 2px `surface` halo, so it reads over the band and over the well.
- **Ends:** the low and high values written under the two ends (17px Figtree 500 in `text`, tabular figures), each with an optional mono caption above it (11.5px uppercase `text-muted`).
- The bar is one image to screen readers (`role="img"`, `aria-label` such as "180 ac to 240 ac"); the written ends are read as text.
- **Moving it:** the positions are CSS properties on the block, `--jw-lo`, `--jw-hi` and `--jw-at`, as percentages of the scale. A page script sets them and updates the end texts (`[data-jw-range-low]`, `[data-jw-range-high]`) and the `aria-label`. Nothing animates.

## Plain HTML
```html
<div class="jw-range" style="--jw-lo: 30%; --jw-hi: 70%; --jw-at: 48%">
  <div class="jw-range__track" role="img" aria-label="180 ac to 240 ac">
    <span class="jw-range__band"></span><span class="jw-range__marker"></span>
  </div>
  <div class="jw-range__ends">
    <p class="jw-range__end"><span class="jw-range__end-label">Low</span><span class="jw-range__end-value" data-jw-range-low>180 ac</span></p>
    <p class="jw-range__end"><span class="jw-range__end-label">High</span><span class="jw-range__end-value" data-jw-range-high>240 ac</span></p>
  </div>
</div>
```

## Astro
`<RangeBar min={0} max={300} low={180} high={240} value={212} lowText="180 ac" highText="240 ac" [lowLabel] [highLabel] [label] [id] />` from `src/layouts/components/jw/RangeBar.astro`.

## Rules
- Show a range when the honest answer is a range; never a single number the data can't back.
- The scale (`min`, `max`) should give the band room on both sides, so the width of the band reads as the uncertainty.
