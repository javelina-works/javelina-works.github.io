# ThemeToggle

A two-way switch between By day and At night that sets `data-theme` on the page.

- The lit option shows a small lamp: tip orange by day, a glowing ember at night.
- It is a radio group, so arrow keys and screen readers treat it as one choice.

## Props (React)
`value` and `onChange(theme)` to control it; `target` (an element to set `data-theme` on; defaults to `<html>`); `labels` (`{ light, dark }`).
