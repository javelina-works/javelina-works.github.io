# Development

## Prerequisites

- Node.js `>=22.12.0` (see `package.json` → `engines`)
- npm (lockfile is not committed; `pnpm-lock.yaml` / `yarn.lock` are git-ignored)

## Getting started

```bash
npm install
npm run dev
```

The dev server runs `scripts/toml-watcher.mjs` in parallel with `astro dev`,
so edits to TOML config files under `src/config/` are picked up live.

## Scripts

Defined in `package.json`:

| Script | What it does |
| ------ | ------------ |
| `dev` | TOML watcher + `astro dev` |
| `build` | TOML watcher (one-shot) + `astro build` + sitemap cleanup |
| `preview` | Build then `astro preview` |
| `astro-check` | Type-check Astro + TypeScript |
| `toml:watch` | Watch and compile TOML config to JSON |
| `generate-favicons` | Regenerate favicon assets |
| `generate-multilingual-content` | Scaffold i18n content copies |
| `remove-multilingual` | Tear down i18n content copies |
| `remove-draft-from-sitemap` | Strip drafts from the built sitemap |
| `format` | Prettier on `src/` |
| `test` | Jest in watch mode |

## Project layout

```
.
├── .github/workflows/   # CI: deploy.yml
├── docs/                # This documentation
├── public/              # Static assets copied to site root (images, videos, CNAME)
├── scripts/             # Build-time Node scripts
├── src/
│   ├── config/          # TOML config (compiled to .astro/config.generated.json)
│   ├── content/         # Astro content collections
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route files
│   ├── components/      # Reusable Astro components
│   └── lib/             # Utilities (i18n, markdown, fonts)
├── astro.config.mjs
└── package.json
```

## Config system

Site config lives in TOML under `src/config/` and is compiled into
`.astro/config.generated.json` by `scripts/toml-watcher.mjs`. `astro.config.mjs`
imports the compiled JSON directly. Edit the TOML files — never the generated
JSON.

## Conventions

- **Formatting** — Prettier with `prettier-plugin-astro`, `prettier-plugin-toml`,
  and `prettier-plugin-tailwindcss`. Run `npm run format` before committing.
- **Markdown lint** — `.markdownlint.json` at the repo root.
- **Editor config** — `.editorconfig` is committed; most editors honor it.
- **TypeScript** — `tsconfig.json` for app code; `tsconfig.jest.json` for tests.

## Testing

```bash
npm run test
```

Jest is configured via `jest.config.ts` with `ts-jest`. Tests live alongside
source under `src/`.
