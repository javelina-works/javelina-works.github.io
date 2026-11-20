# Field

A labeled text input with an optional unit suffix, hint and error, as used in the ballpark tool.

- Labels sit above in `body-strong`; hints below in `body-s`, `text-muted`.
- Units (ac, %, $) go in the suffix, in mono.
- Focus draws `shadow-focus` and a `focus` border. Errors turn the border `error` and say how to fix it.

## Props (React)
`label`, `id`, `hint`, `error` (shown as given), `validate(value)` (returns an error message or nothing; runs on blur), `suffix`, `value` / `defaultValue`, `onChange(value, event)`, `inputMode`, `placeholder`, `type`.
