# StatusLight

A small green light with a label, meaning things are running fine; it blinks slowly and throws a little green light onto the wall around it.

- The blink fades up over a quarter second, holds, fades out and rests for a second and a half. It runs only while the light is near the screen (off-screen it is simply on and asks for no frames), its fades step at about 30 frames a second (about 21 frames in 3 seconds), and only walls the green light reaches are redrawn.
- Green (`light-ok`) means running, done or kept. On rust it reads as a dim olive, because rust soaks up green, which keeps it from competing with the orange.
- With reduced motion turned on it stays lit and does not blink.

## Props (React)
`label`, `blink` (default true).

## Plain HTML
```html
<span class="jw-status">
  <span class="jw-pilot jw-pilot--status" aria-hidden="true" data-jw-light="status" data-jw-blink></span>
  <span class="jw-status__label">Taking new surveys</span>
</span>
```

## Rules
- The label sits on its own small shell plate, so it reads on any wall by day or at night. Text never sits straight on a wall.
- One status light per page, usually in the footer. Never red: errors are words, not lights.
