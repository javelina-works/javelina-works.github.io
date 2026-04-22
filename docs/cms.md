# Decap CMS

The site ships with a [Decap CMS](https://decapcms.org/) (formerly Netlify CMS)
admin mounted at **`/admin/`**. It edits the same Markdown/MDX files under
`src/content/` that the Astro content collections already read from.

This doc covers the initial setup in this repo. The admin UI itself is
functional out of the box; the one-time work below enables login on the
deployed site.

## How it's wired

- `public/admin/index.html` — loads Decap CMS and the Netlify Identity widget.
- `public/admin/config.yml` — collection definitions (blog, pages, authors,
  careers, sections, testimonials, FAQ, pricing, contact) plus singletons for
  the homepage and blog landing.
- `netlify.toml` — adds `Cache-Control: no-cache` and `X-Robots-Tag: noindex`
  headers for `/admin/*`.
- `src/layouts/Base.astro` — forwards Netlify Identity invite/recovery tokens
  that land on `/` into `/admin/` so invited users reach the login flow.

Collections mirror the schemas in `src/content.config.ts`. When new fields get
added to those Zod schemas, update `public/admin/config.yml` to match.

## One-time Netlify setup

The CMS uses the **Git Gateway** backend, which requires Netlify Identity.
Enable these in the Netlify dashboard for the `javelina-works` site:

1. **Site configuration → Identity → Enable Identity.**
2. **Identity → Registration preferences → Invite only.** (Prevents random
   signups; editors get invited by email.)
3. **Identity → Services → Git Gateway → Enable Git Gateway.** Authorize it
   against the `javelina-works/javelina-works.github.io` repo.
4. **Identity → Invite users** — add each editor's email. They'll receive an
   email with a link back to `https://javelinaworks.com/` carrying an
   `invite_token` hash; the inline script in `Base.astro` forwards them to
   `/admin/` to complete signup.

Optional, but recommended:

- **Identity → External providers** — add GitHub as a login option so editors
  with a GitHub account can skip the email flow.
- **Identity → Emails** — customize the invite/recovery email templates.

## Branch and publish flow

- Editors hit `/admin/` and sign in with their Identity account.
- `publish_mode: editorial_workflow` means saving a draft opens a PR against
  `main` instead of committing directly. The draft status in Decap maps to PR
  labels (`decap-cms/draft`, `decap-cms/pending_review`,
  `decap-cms/pending_publish`).
- Merging the PR triggers the normal Netlify build.

If we want the CMS to target `staging` instead of `main`, change
`backend.branch` in `public/admin/config.yml`.

## Media

Uploads go to `public/images/uploads/` and resolve at `/images/uploads/*` on
the site. Pre-existing images under `public/images/` aren't touched.

## Known gaps / follow-ups

- **MDX round-tripping.** Blog posts are authored as `.mdx`. Decap's markdown
  widget writes CommonMark, so JSX-like constructs in existing posts won't
  survive a full edit-through. Today's posts are plain markdown in `.mdx`
  files, so this is fine; revisit if we start embedding components.
- **Sections schema.** `src/content/sections/english/*` uses rich,
  section-specific frontmatter (buttons, videos, nested lists). The Decap
  `sections` collection currently exposes only `title`, `description`,
  `image`, `body`. Editing richer fields still requires a PR. We can split
  the collection per section type once the shapes stabilize.
- **Multilingual.** Content lives under `english/` subfolders. When we enable
  more locales, each collection needs sibling folders/files or
  [Decap's i18n config](https://decapcms.org/docs/i18n/).
- **Preview templates.** No custom previews are registered; the default
  markdown preview is used.
