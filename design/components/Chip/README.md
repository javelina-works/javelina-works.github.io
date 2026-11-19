# Chip

Short uppercase status labels for plants, pastures and jobs; each tone means one thing everywhere.

## Tones
- `treat`: plants or areas to treat. Flat burnt with white text by day (`chip-treat`, `on-chip-treat`); ember glass that glows at night.
- `keep`: plants or areas left alone, on `land-soft`.
- `shell`: neutral glass over photos (counts, captions).
- `selected`: the current selection, a `selected` marigold ring with `selected-hairline` outside it.
- `queued`: waiting, an outline in `line-strong`.
- `success` / `warning` / `error`: job status, always with a dot and a word.

## Props (React)
`tone`, `count` (appended as “ · n”), `dot` (defaults on for treat and the status tones), `children`.

```html
<span class="jw-chip jw-chip--treat"><span class="jw-chip__dot"></span>Treat · 3</span>
```
