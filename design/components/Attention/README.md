# Attention

Ways to draw the eye to the main action, as if it were a backlit part: it flickers on, catches a glint of sun, or breathes at night; treat markers ping.

- `attention: 'flicker'` on the primary Button (the default choice): when the button first comes into view, its light stutters on like a lamp warming up (`duration-flicker`). By day it holds, then settles back to sunlit; at night it stays lit. It plays once per page view and never in response to a click, hover or switch; those get the smooth fade.
- `'glint'`: a streak of sunlight crosses every `duration-glint`.
- `'breathe'`: a soft ember glow swells behind the button every `duration-breathe`. Night only; by day it does nothing.
- Ping: the ring on treat markers (see SurveyMap).

## Plain HTML
Add `is-flickering` to a `.jw-btn--primary` to play the flicker once; remove it on `animationend` so it can play again.

## Rules
- One moving thing in view at a time.
- All of these animate only opacity and transform of a pre-drawn layer, so they cost almost nothing. Never animate a shadow’s size or a blur amount.
- Everything stops for people who turn on reduced motion.
