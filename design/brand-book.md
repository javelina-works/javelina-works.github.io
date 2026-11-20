Javelina Works surveys ranch land by drone, counts and maps every brush plant, and treats each one to a plan the rancher approves. The look comes from the giant agave bug: a blue-black shell with orange tips that diffuse sunlight by day and glow when a light shines through them at night, sitting on agave, sage and limestone. It should feel older-fashioned and mildly industrial, and still clearly ahead of its time. Ranchers come first: plain words, warm light colors, nothing that reads like a software startup.

## Voice

- Talk like a land manager who also flies drones. Plain words, short sentences, real numbers with units: “1,284 plants found”, “212 of 640 ac treated”.
- “We” is Javelina Works; “you” is the rancher. It’s their land and their plan: “treat each one by drone to a plan you approve.”
- Sentence case for headlines and copy (“Brush control, one plant at a time.”). Button labels render uppercase through the `button` style.
- Name places the way locals do: “Fort Davis, Texas”, “Pasture 4”, “North trap”.
- No emoji, no exclamation marks, no startup words (platform, seamless, AI-powered, revolutionize).

## By day and at night

Every color has a day and a night value. Set `data-theme="light"` (by day) or `data-theme="dark"` (at night) on `<html>`; the ThemeToggle component does this.

- **By day:** limestone ground (`bg`), paper cards (`surface`), charcoal text (`text`). Orange is **tip orange** (`tip-*`), lit by the sun: flat and crisp, with a lighter 1px outline and a top highlight. It glows only when someone hovers, focuses or presses it.
- **At night:** the shell is the ground (`bg`), cards a step up (`surface`). Orange is **ember** (`glow-*`): a soft glow held close at rest, fuller on hover, as if a lamp were shining through it.

The glow is an accent, not the style. Most of any page is paper, ink and land; on a typical page that is limestone and paper 60%, text 22%, land greens 12%, orange 4%, rust 2%.

## Color roles

- Text: `text` for headlines, `text-body` for copy, `text-muted` for captions, on `bg` or `surface`. Eyebrows and figure labels use `label` (rust by day, ember at night).
- Land: `land` for links and the active nav item (juniper by day, sage at night). `land-soft` with `on-land-soft` for keep chips and sage bands. `sage` fills kept ground on maps; `juniper-*` steps for maps and illustration.
- Orange actions: `action` (tip orange) with `action-outline` and `on-action` for the primary; `action-strong` (burnt) with white `on-action-strong`; `action-tint` and `action-ghost` for lighter orange actions. The lit layer that fades in is `lit-body`, `lit-body-mid`, `lit-body-edge`, `lit-edge`.
- Rust (`rust`, `rust-*`) is the logo color: the javelina mark, small labels by day, heritage touches. Never a button fill; a red button reads as an error.
- Marigold is `selected`: a 2px ring, with `selected-hairline` outside it so it holds 3:1 on limestone.
- Map jobs: treat = orange marker, keep = `juniper-100` ring and `sage` fill, selected = `selected`, water = `water`, property lines = `boundary` dashed.
- Status: `success`, `warning`, `error`, always with a word or icon. `error` is crimson, kept away from the orange.
- Borders: `line` for decorative rules, `line-strong` for control edges. Focus is `shadow-focus`: a 2px gap in the ground color, then a solid 2px `focus` ring.
- A button owns its text color in every state (at rest, hover, press, focus, visited). Each variant sets `--btn-fg`, and link or page styles can’t change it, so a button’s text never takes the page’s color onto its own background.
- Text never sits straight on a wall, a sheen or a photo. Put it on a card, or for a short label on a small shell plate (`shell-*` with `on-shell`), which reads by day and at night.

## The glow

- Sunlit (by day, at rest): `shadow-action` gives a top highlight and a hairline underneath; nothing glows.
- Lit (by day on hover, focus or press; at night at rest): an even body, a bright rim where the light escapes and a halo on every side (`shadow-glow`, `shadow-glow-hover`, and the chip, marker and meter versions). Never a drop shadow under orange while it’s lit.
- Only the primary button, treat chips, treat markers and the meter take the glow. One glowing action per view.
- Text never glows and never takes a gradient.
- Grain (`grain.png` at `grain-opacity`) sits over every gradient. On the glow it reads as frosted glass in front of the light.

## Sheens

The shell and agave sheens reflect light, so they keep a soft top highlight, a diagonal streak and grain.

- Small: the `shell` and `agave` buttons, the night nav bar.
- Large: `band-shell` and `band-agave`, full-width section backgrounds that hold cards, maps and other components. Never put running text straight on a sheen; it competes with the streak. Put copy on a card on the band, or above the band.
- Lacquer, a hard glossy reflection, is held back for special cases and has no tokens yet.

## Lighting

At night the page is lit by its own lights, and you can see where each one is from what it lights. By day the sun lights everything from the upper left and the lights only show up close.

- **The lights.** The lamp is the primary button in the nav bar (NavBar `lamp`), in `light-lamp`. It flickers on once the first time it is seen, then lights each wall as the wall scrolls under the bar. The tube (LightTube) is `light-tube`, a little redder, so you can see two lights meet on a wall. The green pilot and the status light are `light-ok`. By day the sun is `light-sun`.
- **What they light.** Walls (LampWall: flaky rust for the hero, corrugated tin for feature and data sections, smooth rust for quiet sections and the footer). Light pools on bands and plain ground (`data-jw-pool`). Card shadows (Surface `castShadow`) that fall away from each light at night, and down and to the right by day. Brass rivets, which glint toward each light in its color.
- **What the colors mean.** Orange is action and treat. Green is running, done or kept. A light is never red: errors are words. At most two light colors in view, and green stays small. On rust, green reads as a dim olive, because rust soaks up green; on brass it shifts toward yellow.
- **How much.** One wall per screen height, alternating with plain ground or bands. Brass in one or two places a page: the tube’s clamps and its plate, or one card that stands for something physical. One tube per section. One status light per page.
- **By day.** The sun does the lighting: the lamp’s light shows faintly, and only on hover; the tube shows at about 40%.
- **Cost.** Each wall draws its bumps and flakes once on the graphics card, then lights them only while something moves (a scroll, a hover, a flicker, a blink fading, a tube filling, the day/night switch), with at most six lights per wall and at most twice screen resolution. Pools, shadows and glints are drawn once and only slide and fade. When the page is still, nothing runs. With reduced motion turned on, nothing flickers or blinks: the lights are simply on. Without WebGL, a wall shows a static drawing in its own colors.
- **Tokens.** The four light colors (`light-*`) and the `lighting` distances: how far each light reaches and how far it stands off the wall, and the spacing of the tin’s ridges.

## Type

- Headlines: Barlow 500 at its normal width (`display-xl` 60px down to `heading-3` 22px), tight leading, sentence case, `text-wrap: balance`. Big figures use `number`. Barlow comes from California highway signs: plain, sturdy and easy to read at a glance.
- Body: Figtree. `body-l` (17px) is the default reading size; `body` (15px) in cards; `body-s` for captions. Keep lines near 65 characters.
- Mono: IBM Plex Mono for `button`, `eyebrow`, `chip` and `data`, uppercase and tracked. JetBrains Mono is an approved alternate. Mono is for labels and buttons, never paragraphs.

## Shape and space

- Corners are just off square: `radius-sm` (3px) for buttons, inputs and chips; `radius-md` (4px) for cards and photos; `radius-lg` (8px) for bands and dialogs. Markers and meters are `radius-round`.
- Spacing runs on 4px (`space-1` … `space-20`). Gaps inside controls are `space-2`, between buttons `space-3`, card padding `space-5`–`space-6`, section and band padding `space-20` on desktop and `space-14` on phones.
- Drop shadows: `shadow-raise` on paper cards, `shadow-raise-on-band` on cards that sit on a band. Nothing else.

## Motion

- The glow fades in over `duration-glow` and out over 1.5 times that. Other hover changes take `duration-hover`.
- Treat markers pulse (`duration-ping`) twice when pointed at, focused or pressed, then rest, so a still page runs no frames. The main action can take `attention: 'flicker'`: when it comes into view its light stutters on like a lamp warming up (`duration-flicker`), then settles. It plays once per page view and never on a click, hover or switch. A sun glint (`duration-glint`) and a night breath (`duration-breathe`) are the quieter options.
- One moving thing in view at a time. Animate only opacity and transform. Everything stops for reduced motion.

## Components

The components are React 18 components in `components/react/bundle.js` as `window.JavelinaWorks` (Button, Chip, SurveyMap, Meter, Surface, NavBar, Field, ThemeToggle, and for lighting LightScene, LampWall, LightTube, StatusLight and Rivet). Each one renders the plain HTML and `jw-` classes styled by `components/jw.css` (loaded after `tokens/tokens.css`), so a page without React (an Astro page, say) can use the same markup and classes directly. For the lighting on such a page, give the pieces their `data-jw-*` attributes and call `mount()` from `components/lighting.js` once (or `JavelinaWorks.Lighting.mount()` with the bundle; see LightScene). The site adds two pieces built from the same rules: NavMenu (the menus under the nav bar) and Prose (long-form text).

## Imagery

Real survey images and field photos only: the land, the drone, the crew. Plant markers and chips sit on top of survey images. At night photos dim to `photo-brightness-dark`. The bug photos in Imagery are the reference for the palette and the glow, not page images.

## Iconography

This system has no icon set yet. The current site uses Lucide line icons; until a set is chosen, use Lucide at 20px in `text-muted` or `text`. Icons never glow and never take orange, except a status dot.

## Logos

The javelina mark is rust on light grounds and white on dark; the wordmark is ink on light and off-white on dark (Logos group). The files are single-ink, so pick the file for the ground. Never put the mark on orange.
