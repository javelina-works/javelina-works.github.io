# Build brief: rebuild the Javelina Works website in its design system

Rebuild this Astro site in the Javelina Works design system in `design/`, in one run, ending in one draft pull request that is not merged. Everything a reviewer needs to judge the work goes in that pull request: what was here, what changed, screenshots of every page, the check results, and what still needs a human decision.

Javelina Works surveys ranch land by drone, counts and maps every brush plant, and treats each one to a plan the rancher approves. The look comes from the giant agave bug: a blue-black shell with orange tips that glow when backlit, on agave, sage and limestone. Older-fashioned, mildly industrial, quietly ahead of its time, and plain enough for ranchers, many of them over 65.

## 1. Read first

1. `design/RULES.md`: the standing rules. Add them to the repo's `CLAUDE.md` (create it if missing) before anything else, so every agent in the run follows them.
2. `design/brand-book.md`: voice, day and night, color roles, the glow, sheens, lighting, type, shape, motion.
3. `design/components/*/README.md`: each component's plain-HTML contract (markup, `jw-` classes, `data-jw-*` attributes).
4. `design/reference/night-lamp.html`: a working prototype of a lit homepage. Open it in a browser, switch Night/Day, scroll. The site's lighting should behave like this.
5. `design/reference/shots/` (every component by day and at night) and `design/reference/night-lamp/` (the prototype section by section). This is the visual target.

## 2. What's in `design/`

| Path | What it is |
| --- | --- |
| `tokens/tokens.css` | All tokens as CSS custom properties, by day on `:root` and at night on `[data-theme="dark"]`; `@font-face` rules; type classes `.t-display-xl` … `.t-data`. Generated from `tokens.json`. |
| `tokens/tokens.json` | The token source, with a usage note on every token. |
| `components/jw.css` | Every component's styles (`jw-` classes). Load after `tokens.css`. |
| `components/lighting.js` | The lighting engine, an ES module with no dependencies: `mount()`, `unmount()`, `refresh()`. Finds walls, lights, pools, shadows and rivets by `data-jw-*` attributes. |
| `components/react/` | Reference React 18 implementation (`index.jsx`, a built `bundle.js`, `index.d.ts` types). Use it to see behavior; port to Astro rather than shipping it wholesale. |
| `components/<Name>/` | `README.md` (the contract) and `preview.html` (a demo of the component; rendered by the checks). |
| `fonts/` | Barlow 500, Figtree 400/500, IBM Plex Mono 400/500 (woff2). |
| `assets/logos/`, `assets/images/`, `assets/textures/grain.png` | Logo SVGs (javelina mark in rust, white, ink; wordmark in ink, white), the survey image, the agave bug photos, the grain texture used over every gradient. |
| `checks/` | `render-previews.cjs`, `check-site.cjs`, `contrast-scan.cjs`: the objective checks in section 7. |

## 3. Inventory before changing anything

Read the whole current site first and write the inventory into the pull request under **What was here**:

- every route, its `<title>`, meta description, canonical, Open Graph tags, headings and copy
- links, forms (fields, endpoints, success and error behavior), images and their alt text
- sitemap, robots, redirects, structured data, analytics and any other third-party snippets
- the deploy setup (GitHub Pages workflow, `site`/`base` in the Astro config, custom domain)

Every URL that exists today must still work afterwards: same path, or a redirect. Keep analytics snippets exactly as they are. Keep or improve titles, descriptions and structured data; never drop them.

## 4. How the system maps onto Astro

- **Global styles.** In the base layout, import `design/tokens/tokens.css` then `design/components/jw.css`, once. Relative `url()`s in them (fonts, grain) resolve through Vite. Preload `Barlow-Medium.woff2` and `Figtree-Regular.woff2`.
- **Assets.** Copy `design/assets/` to `public/assets/` (the components expect logos at `/assets/logos/…`). Serve photos through `astro:assets` with responsive sizes and WebP/AVIF.
- **Components.** Write `.astro` components that output exactly the markup and classes in each README: Button, Chip, Surface, NavBar, Field, Meter, ThemeToggle, LampWall, LightTube, StatusLight, Rivet, SurveyMap. Static parts ship no JavaScript.
- **Lighting.** One script in the base layout: `import { mount } from '…/design/components/lighting.js'; mount();`. Pages only add the `data-jw-*` attributes from the LightScene, LampWall, LightTube, StatusLight, Rivet and Button READMEs. The nav bar's primary is the lamp (`data-jw-light="lamp" data-jw-flicker`).
- **Interactivity.** Small vanilla scripts for small jobs (theme toggle, nav menu, a field's validation). An island (`client:visible`) only where it earns its weight: the editable survey map, a calculator. If React isn't already in the repo, prefer Preact or vanilla for those, ported from `components/react/index.jsx`.
- **Day and night.** `data-theme="light" | "dark"` on `<html>`. A tiny inline script in `<head>` sets it before first paint from the saved choice (read `localStorage` inside try/catch), otherwise from `prefers-color-scheme`. The ThemeToggle ("By day" / "At night") saves the choice. No flash of the wrong theme.

## 5. Pages

Keep the site's existing pages and their purpose. Rebuild each in the system. For the homepage, follow the prototype's order where the content fits:

1. Nav bar with the javelina, three or four links, the theme toggle, and the lamp: the primary "Get a ballpark".
2. Hero on a flaky-rust wall: a headline card (eyebrow, headline, short intro, a shell button and a ghost button) beside a survey-map card.
3. How it works: a shell band holding three step cards.
4. A corrugated-tin wall with a feature card, the light tube and its plate.
5. An agave band holding the survey map and the kept/treated cards.
6. The ballpark ask on a smooth-rust wall, and the footer line on a shell plate with the status light.

Where "Get a ballpark" leads: if the site has a quote or contact form today, keep its endpoint, fields and behavior and restyle it. If it has none, point the lamp at the existing contact route and list it under **Questions** in the pull request. Never build a price estimate the site doesn't already make.

## 6. Pieces that aren't designed yet

Build only the ones the site actually needs (for example: a slider, a select, a segmented control, a results panel, a range bar, a table, an upload field, tabs, a dialog, a tooltip, and empty, loading and error states). Derive them from the system: IBM Plex Mono labels, `radius-sm` corners, `line-strong` edges, tip orange only for the one action, the marigold `selected` ring, `shadow-focus`, the contrast rules. Give each one a `preview.html` and `README.md` in the same form as `design/components/`, and list them in the pull request under **New designs to review** with day and night screenshots.

## 7. Done means proven

The run is done only when all of these pass, and the outputs are pasted into the pull request. The checks need `playwright`, `react@18` and `react-dom@18` as dev dependencies (`npx playwright install chromium` if no browser is present). A separate agent that didn't write the pages runs them and reviews the screenshots against `design/reference/` and `design/RULES.md`.

1. `astro build` passes with no missing-asset warnings.
2. `node design/checks/render-previews.cjs` passes (every component, including new ones, by day and at night, at rest and on hover, with hostile link styles injected).
3. Against `astro preview`, `node design/checks/check-site.cjs http://localhost:4321 <every route>` passes all hard checks:
   - contrast 4.5:1 or better for every visible piece of text in links, buttons, chips and status plates, at rest and on hover, by day and at night, at 390px and 1280px
   - no console or page errors
   - with reduced motion on, no animation keeps running
   - with WebGL off, every wall falls back and nothing throws
4. The cost numbers `check-site.cjs` prints, per page, against this budget:
   - JavaScript: under 40 KB on pages without an island; under 160 KB on pages with one (uncompressed)
   - total page weight on a phone: under 1.5 MB
   - frames while the page sits still for 3 seconds: none, apart from the status light's fades (under 50)
   - long tasks while scrolling: report the number. The check machine renders WebGL in software, so judge it, don't fail on it.
5. Screenshots of every page at phone and desktop width, by day and at night (`site-shots/`), attached to the pull request, plus the no-WebGL shots.
6. A read-through of every page's copy against the voice rules in `design/brand-book.md`.

## 8. Words

- Reuse the site's existing copy, facts and numbers. Never invent numbers, prices, coverage areas, testimonials or claims.
- Where the new layout needs words that don't exist yet, write them in the brand voice and list each one under **New copy to review**. The prototype's lines ("Every plant, counted", "Taking new surveys", the step titles, the example acreages) count as new copy and need sign-off.
- Body copy at least 16px; tap targets at least 44px; one `h1` per page; real alt text.

## 9. The pull request

One draft pull request from a branch such as `redesign/design-system`. Don't merge it, don't push to the main branch, and don't change the deploy setup unless the build needs it (explain if so). Its description has:

- **What was here**: the inventory.
- **What changed**: page by page, with screenshots.
- **Checks**: the outputs from section 7.
- **New designs to review** and **New copy to review**.
- **Deviations from `design/`**: anything changed in the system, and why.
- **Questions**: anything that needed the owner's decision, such as where "Get a ballpark" should lead.

## 10. Out of scope

Other repositories, new back-end services, new tracking, removing pages, and changing what the business offers or charges.
