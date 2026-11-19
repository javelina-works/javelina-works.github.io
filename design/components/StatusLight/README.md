# StatusLight

A small green light with a label, meaning things are running fine; it blinks slowly and throws a little green light onto the wall around it.

- The blink fades up over a quarter second, holds, fades out and rests for a second and a half; the wall is only redrawn during the fades.
- Green (`light-ok`) means running, done or kept. On rust it reads as a dim olive, because rust soaks up green, which keeps it from competing with the orange.
- With reduced motion turned on it stays lit and does not blink.

## Props (React)
`label`, `blink` (default true).

## Rules
- The label sits on its own small shell plate, so it reads on any wall by day or at night. Text never sits straight on a wall.
- One status light per page, usually in the footer. Never red: errors are words, not lights.
