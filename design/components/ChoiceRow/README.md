# ChoiceRow

One way to do something, as a full-width row with a title and a line under it: the ballpark's "See it work on Fox Canyon", "Upload a boundary file", "Draw the fence line on the map". New for the site (the ballpark tool); derived from the system rules. Use it where a Button's short uppercase label can't carry the explanation the choice needs.

- A paper row (`surface`) with a `line-strong` edge and `radius-sm` corners, padding `space-3` / `space-4`, at least 44px tall. It turns `surface-sunken` on hover and takes `shadow-focus` on keyboard focus.
- **Title**: 16px Figtree 500 in `text`. **Line under it**: 15px Figtree in `text-muted` (a card's secondary line). An optional 16px icon (`jw-choice__icon`, Lucide line icon) sits before the words in `text-body`.
- **jw-choice--shell**: the shell plate (the Button's shell gradient, `shell-edge`, `shadow-sheen-shell`) for the one choice to point out, such as the live demo. Its words are `on-shell`. It brightens on hover like a shell button. `jw-choice__play` gives it a round tip-orange (`action`) play mark with an `on-action` triangle.
- It never glows; the page's lit action stays the header lamp.
- Stack rows in `jw-choice-list` (`space-2` apart).

## Plain HTML
```html
<div class="jw-choice-list">
  <button type="button" class="jw-choice">
    <span class="jw-choice__text"><span class="jw-choice__title">Draw the fence line on the map</span><small class="jw-choice__sub">Click the corners, then finish</small></span>
  </button>
  <!-- a file picker: the label is the row; the input stays hidden -->
  <label class="jw-choice" tabindex="0" role="button">
    <span class="jw-choice__text"><span class="jw-choice__title">Upload a boundary file</span><small class="jw-choice__sub">KMZ or KML from Google Earth, or GeoJSON</small></span>
    <input type="file" accept=".kmz,.kml,.geojson,.json" hidden>
  </label>
</div>
<button type="button" class="jw-choice jw-choice--shell">
  <span class="jw-choice__play" aria-hidden="true"></span>
  <span class="jw-choice__text"><span class="jw-choice__title">Watch a live demo</span><small class="jw-choice__sub">Fox Canyon — a real 180-acre West Texas ranch</small></span>
</button>
```
A `<label role="button" tabindex="0">` needs a small script so Enter and Space open the file picker (the ballpark has one).

## Rules
- Two to four choices in a list; more belong behind a disclosure ("More ways").
- One shell row in view at most.
- Not for the page's main action: use a Button (burnt or shell) for that.
