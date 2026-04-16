# Content

How site content is organized and authored.

> **Work in progress.** A content audit is underway to identify remaining
> template boilerplate and document the real Javelina Works content model.
> This page will be filled in as that audit lands.

## Where content lives

- **`src/config/`** — TOML files that drive site-wide settings (site URL,
  navigation, i18n, SEO defaults, social links). Compiled to
  `.astro/config.generated.json` at build time.
- **`src/content/`** — Astro content collections (blog posts, pages, etc.).
- **`src/pages/`** — Route-level Astro pages.
- **`public/`** — Static assets served as-is: `images/`, `videos/`, `plyr/`
  player assets, and the `umami.is.js` analytics snippet.

## Drafts

Content marked as a draft is excluded from the built sitemap by
`scripts/remove-draft-from-sitemap.mjs`, which runs as part of `npm run build`.

## Multilingual content

The site supports i18n via Astro's built-in routing plus helper scripts:

- `npm run generate-multilingual-content` — scaffold localized copies.
- `npm run remove-multilingual` — tear them down.

Enabled languages and the default locale are resolved from the compiled config
through `src/lib/utils/i18nUtils.ts`.

## Favicons

Regenerate with `npm run generate-favicons` (wraps
`@realfavicongenerator/generate-favicon`). Source + outputs live under
`public/`.

## Analytics

`public/umami.is.js` is the Umami analytics client. Confirm the tracking ID
and host in the script match the intended Umami instance before going live.

## TODO (to be filled in after content audit)

- Inventory of active vs. draft collections
- Required front-matter fields per collection
- Image sizing / format guidelines
- Navigation / menu configuration walkthrough
- SEO defaults and per-page overrides
