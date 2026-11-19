# Meter

A treated-acres bar: tip orange by day with a sunlit top edge, a lit tube that glows at night. It fills on first view.

## Props (React)
`label`, `value`, `max`, `unit` (default `ac`), `animate` (default true; reduced motion skips it).

The label and “value of max unit” are always written out above the bar; the bar never carries the number alone. It is a `progressbar` for screen readers.

```html
<div class="jw-meter"><div class="jw-meter__fill" style="width: 33%"></div></div>
```
