# Listbox

Suggestions under a text field: an address typeahead, or "A few matches — pick yours:" after a search. New for the site (the ballpark tool); derived from the system rules and the Field.

- One box in the input color (`surface-input`) with a `line-strong` edge and `radius-sm` corners, `space-2` under the field.
- Option rows at least 44px tall, split by `line` rules: the name in 16px Figtree `text`, a second line (`<small>`) in 16px `text-muted` (the body-copy floor: a visitor reads it to pick).
- **Hover**: `surface-sunken`. **Highlighted** (`aria-selected="true"`, moved with the arrow keys): `surface` with the marigold `selected` ring and its `selected-hairline` drawn inside the row. **Keyboard focus**: a 2px `focus` ring inside the row.
- Words only: no icons, no color coding.

## Plain HTML
```html
<div class="jw-listbox" id="suggest" role="listbox" aria-label="Address suggestions">
  <button type="button" class="jw-listbox__option" role="option" aria-selected="true">
    <span>03 Ranch Road</span><small>Fort Davis, Texas 79734, United States</small>
  </button>
  <button type="button" class="jw-listbox__option" role="option" aria-selected="false">
    <span>03 Ranch Road</span><small>Davie, Florida 33326, United States</small>
  </button>
</div>
```

## Behaviour
The page's script fills the list, moves `aria-selected` with Up and Down, picks with Enter or a press, and hides the list with Escape. The component has no script. On the site: the ballpark's `#bpSuggest` (`src/layouts/components/ballpark/BallparkTool.astro`).

## Rules
- Six options at most; say what the second line is (town, county) rather than repeating the name.
- Put it right under its field, never over the page.
