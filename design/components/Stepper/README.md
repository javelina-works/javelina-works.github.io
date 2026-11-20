# Stepper

Where someone is in a short flow of two to five steps, such as the ballpark's Find your ranch, Analysis and Get ballpark. New for the site (the ballpark tool); derived from the system rules.

- A row of step buttons, each 44px tall and at least 44px wide, split by a small `line-strong` chevron. The label is IBM Plex Mono 11.5px uppercase (`button` style, a touch less tracking); the number sits in a 22px square with `radius-sm` corners and a `line-strong` edge.
- **Current step** (`aria-current="step"`): `text` label, and the number wears the marigold `selected` ring with its `selected-hairline`, as a chosen tab or option does.
- **Done step** (`is-done`): the number square is filled in ink (`text`, with `surface` for the figure). The page can put a check mark in it.
- **Can't be reached yet** (`disabled`): `text-muted` label, no pointer. A step that can be pressed (to go back, or to replay) reads `text-body` and underlines on hover.
- Never orange and never lit: a step is a place in the flow, not the page's action.
- On phones (640px and below) only the current step shows its words; the others keep them for screen readers (visually hidden), so the row stays on one line.

## Plain HTML
```html
<ol class="jw-steps" aria-label="Progress">
  <li><button type="button" class="jw-steps__step is-done"><span class="jw-steps__n">&#10003;</span><span class="jw-steps__label">Find your ranch</span></button></li>
  <li><button type="button" class="jw-steps__step" aria-current="step" disabled><span class="jw-steps__n">2</span><span class="jw-steps__label">Analysis</span></button></li>
  <li><button type="button" class="jw-steps__step" disabled><span class="jw-steps__n">3</span><span class="jw-steps__label">Get ballpark</span></button></li>
</ol>
```

## Behaviour
The page's own script moves `aria-current="step"`, toggles `is-done` and sets `disabled` on the steps that can't be pressed. The component has no script. On the site: `src/layouts/components/ballpark/BallparkTool.astro` (`#bpSteps`).

## Rules
- Use real buttons only when a step can be pressed; a list that never changes can use `<span class="jw-steps__step">` in each item.
- Keep labels short (one to three words).
