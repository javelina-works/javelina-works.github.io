# ThemeToggle

A two-way switch between By day and At night that sets `data-theme` on `<html>` and remembers the choice.

- The lit option shows a small lamp: tip orange by day, a glowing ember at night.
- It is a radio group: only the chosen option is a tab stop, and the arrow keys move the choice (and focus) to the other option. Screen readers hear one choice, "Color mode".
- Each option looks 30px tall but takes taps over 44px (a clear `::before` reaches 7px above and below).
- It saves the choice in `localStorage` under `jw-theme` (`light` or `dark`), inside try/catch. A tiny inline script in `<head>` reads it before first paint (falling back to `prefers-color-scheme`), so there is no flash of the wrong theme.
- It follows `data-theme` if something else changes it.
- The lighting engine reads `data-theme` on `<html>` only, so always set it there.

## Props (React)
`value` and `onChange(theme)` to control it; `target` (an element to set `data-theme` on; defaults to `<html>`); `labels` (`{ light, dark }`, default `{ light: 'By day', dark: 'At night' }`); `storageKey` (default `'jw-theme'`; `''` to not save).

## Plain HTML
```html
<div class="jw-toggle" role="radiogroup" aria-label="Color mode">
  <button type="button" role="radio" aria-checked="true" tabindex="0" class="jw-toggle__opt jw-toggle__opt--light is-on"><span class="jw-toggle__lamp" aria-hidden="true"></span>By day</button>
  <button type="button" role="radio" aria-checked="false" tabindex="-1" class="jw-toggle__opt jw-toggle__opt--dark"><span class="jw-toggle__lamp" aria-hidden="true"></span>At night</button>
</div>
```
Without React, a small script sets `is-on`, `aria-checked` and `tabindex` from `<html data-theme>` (right after the markup, so the lit option is right on first paint), handles clicks and arrow keys, and saves the choice.

The head script, before any stylesheet:
```html
<script>(function(){var t;try{t=localStorage.getItem('jw-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})()</script>
```
