# CLAUDE.md

This is the Javelina Works marketing site: Astro, built and hosted on Netlify, with Cloudflare in front. The design system lives in `design/`. Read `design/RULES.md` and `design/brand-book.md` before changing any page.

## Repo workflow

- Pull requests target `staging` and merge with merge commits. Only the owner merges `staging` into `main`.
- Commits must be signed.
- The repo is public. Never put Claude session links in commits or pull requests.
- Use pnpm (through corepack) and Node 22.

## Javelina Works design rules

### Source of truth
- `design/` is the design system. Colors, type, spacing, radii, shadows, durations and light settings come from `design/tokens/tokens.css`. Never hard-code a color or size that has a token.
- Component markup and classes follow each `design/components/<Name>/README.md`. Reuse a component before making a new one.
- Don't edit files in `design/` to make a page work. If something in it is wrong, fix it there on purpose and say so in the pull request. `tokens.css` is generated from `tokens.json`: change both together.

### Text and contrast
- All text is 4.5:1 or better against what it sits on, by day and at night, at rest, on hover and on focus. `design/checks/` proves it.
- A button owns its text color in every state (rest, hover, press, focus, visited): each variant sets `--btn-fg`. Never style button text through link rules.
- Text never sits straight on a rust wall, a sheen band or a photo. Put it on a card, or a short label on a small shell plate.
- Body copy is at least 16px and tap targets at least 44px tall. Many readers are older ranchers.

### Light
- One glowing action per view: the primary (tip orange). It glows only on hover or focus by day; at night it glows at rest, held close, and a little more on hover.
- The header lamp flickers on once, the first time it is seen. Never flicker on a click, hover or theme switch.
- Orange means action or treat. Green means running, done or kept, and stays small. A light is never red: errors are words.
- At most two light colors in view. One wall per screen height. Brass (rivets, clamps) in one or two places a page.
- Sheen bands hold cards, never running text.

### Motion and cost
- Animate only opacity and transform. One moving thing in view at a time.
- With reduced motion on, nothing flickers, blinks or pulses: lights are simply on.
- Lighting runs only while something changes. When the page is still, no frames run (apart from the status light's slow fades).
- Every wall works without WebGL (static fallback). Canvases are decorative (`aria-hidden`); all words are real HTML.

### Words
- Plain words, short sentences, real numbers with units. “We” is Javelina Works, “you” is the rancher.
- Never invent numbers, prices, coverage areas, testimonials or claims. Keep the site's existing facts.
- No emoji, no exclamation marks, no startup words (platform, seamless, AI-powered, revolutionize).
