# CMS

The site ships with [Sveltia CMS](https://sveltiacms.app/) mounted at
**`/admin/`**. It edits the Markdown/MDX files under `src/content/` that the
Astro content collections already read from.

Sveltia is a drop-in-compatible fork of Decap CMS that authenticates directly
against GitHub. We moved off Decap + Netlify Identity because Netlify sunset
Identity (and Git Gateway with it) in 2024.

## How it's wired

- `public/admin/index.html` — loads the Sveltia bundle from unpkg.
- `public/admin/config.yml` — backend + collection definitions (blog, pages,
  authors, careers, sections, testimonials, FAQ, pricing, contact) plus
  singletons for the homepage and blog landing.
- `netlify.toml` — `Cache-Control: no-cache` and `X-Robots-Tag: noindex`
  headers for `/admin/*`.

Most collections mirror the Zod schemas in `src/content.config.ts`; when new
fields get added there, update `public/admin/config.yml` to match. The
**`sections`** collection is the exception — `src/content.config.ts` defines
no schema for it, and the CMS exposes only a free-form `title` / `description`
/ `image` / `body` surface by design (see "Known gaps / follow-ups" below).

## Signing in

Sveltia uses a GitHub **Personal Access Token** for auth. Each editor
generates their own token once; tokens never get committed.

### Generate a fine-grained PAT (preferred)

1. Visit https://github.com/settings/tokens?type=beta.
2. **Resource owner:** `javelina-works`.
3. **Repository access:** Only select repositories →
   `javelina-works/javelina-works.github.io`.
4. **Repository permissions:**
   - Contents: **Read and write**
   - Metadata: **Read** (required for any fine-grained PAT)
   - Pull requests: **Read and write** (forward-compat for when Sveltia
     re-enables editorial workflow)
5. **Expiration:** 90 days (or the org max) — set a calendar reminder to
   rotate.
6. Generate, copy the token once, store in your password manager.

### Classic PAT (fallback)

If fine-grained PATs hit an org restriction, use
https://github.com/settings/tokens/new with the single **`repo`** scope.

### Logging in

1. Visit https://javelinaworks.com/admin/.
2. Click **Sign in with Token**, paste your PAT.
3. Sveltia caches the token in the browser (localStorage, same-origin only).
   You'll stay signed in until you explicitly sign out or clear site data.

Any editor signing in must have **write access** to
`javelina-works/javelina-works.github.io` on GitHub — that's the gate.

## Branch and publish flow

- Editors commit directly to the **`staging`** branch
  (`backend.branch: staging` in `config.yml`).
- Our existing **staging → main** PR process ships the changes to production.
  This preserves the "nothing goes to main without review" guarantee we used
  to get from Decap's `publish_mode: editorial_workflow`.
- The Sveltia commit message templates (`content: create {{collection}}
  '{{slug}}'`, etc.) make the staging log easy to scan for content-only
  changes.

## Local editing

Sveltia supports local editing against the repo filesystem — handy for
drafting offline or before pushing.

1. `pnpm dev` (Astro dev server on :4321).
2. Open **Chromium** (Safari/Firefox don't expose the File System Access API
   Sveltia relies on) to `http://localhost:4321/admin/index.html`.
3. Click **Work with Local Repository**, grant access to the repo root.
4. Edits land as unstaged changes in your working tree — commit/push them
   yourself.

## Media

Uploads go to `public/images/uploads/` and resolve at `/images/uploads/*` on
the built site. Pre-existing images under `public/images/` aren't touched.

## Required-field semantics

Sveltia and Decap treat `required:` inversely:
- **Decap:** fields were optional unless `required: true`.
- **Sveltia:** fields are required unless `required: false`.

Our `config.yml` marks every optional field with `required: false` explicitly,
so the behavior matches intent. When adding new fields, pick the explicit
marking that matches your intent rather than relying on the default.

## Known gaps / follow-ups

- **Editorial workflow deferred.** Sveltia hasn't shipped
  `publish_mode: editorial_workflow` yet (planned for v1.0, mid-2026). When
  it lands: uncomment `publish_mode` in `config.yml` and flip
  `backend.branch` back to `main`; editors will then get per-save PRs and we
  can retire the staging-branch workaround.
- **Direct GitHub auth pending.** Sveltia has device-flow / GitHub App auth
  on the roadmap. When it ships we can retire PATs and switch via a
  `config.yml` change — no new infrastructure needed.
- **MDX round-tripping.** Blog posts are authored as `.mdx`. The markdown
  widget writes CommonMark, so JSX-like constructs in existing posts won't
  survive a full edit-through. Today's posts are plain markdown in `.mdx`
  files, so this is fine; revisit if we start embedding components.
- **Sections schema.** `src/content/sections/english/*` uses rich,
  section-specific frontmatter (buttons, videos, nested lists). The `sections`
  collection currently exposes only `title`, `description`, `image`, `body`.
  Editing richer fields still requires a code PR. Split per section type once
  the shapes stabilize.
- **Multilingual.** Content lives under `english/` subfolders. When we enable
  more locales, each collection needs sibling folders/files or
  [Sveltia's i18n config](https://sveltiacms.app/en/docs/contents/i18n).
- **Preview templates.** No custom previews are registered; the default
  markdown preview is used.
