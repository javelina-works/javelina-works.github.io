# Meter

A treated-acres bar: tip orange by day with a sunlit top edge, a lit tube that glows at night. It fills on first view.

- The fill's width is set once. It fills by `transform: scaleX()` only (the motion rule: only opacity and transform animate).
- The filling is done by the lighting engine (`data-jw-reveal`): a meter below the fold when the page loads waits empty (`is-pending`) and fills when it is 60% in view. A meter already in view at load, a page without the engine, and reduced motion all show it full, with no jump.

## Props (React)
`label`, `value`, `max`, `unit` (default `ac`), `animate` (default true: adds `data-jw-reveal`; reduced motion skips it).

The label and “value of max unit” are always written out above the bar; the bar never carries the number alone. It is a `progressbar` for screen readers.

```html
<div class="jw-meter-block" data-jw-reveal>
  <div class="jw-meter-block__line"><span>Pasture 4 · treated</span><span>212 of 640 ac</span></div>
  <div class="jw-meter" role="progressbar" aria-label="Pasture 4 · treated" aria-valuemin="0" aria-valuemax="640" aria-valuenow="212">
    <div class="jw-meter__fill" style="width: 33.125%"></div>
  </div>
</div>
```
