# Content TODO — Javelina Works Site

Everything that still needs to be replaced with real Javelina Works content.
Items are grouped by priority and area. Check off as you go.

---

## Critical — Highest Priority


---

## High — SEO & first impressions

### Meta descriptions

The placeholder `"This is a example description"` appears in the frontmatter
`metaDescription` field of these files. Replace each with a real description:

- [ ] `src/content/blog/english/-index.md`
- [ ] `src/content/pricing/english/-index.md`
- [ ] `src/content/career/english/-index.md`
- [ ] `src/content/testimonial/english/-index.md`
- [ ] Integration index (if the integration collection is kept)

### Improve CI Workflow

- [x] Re-activate the CI checks workflow
- [ ] Restore prettier step
- [ ] Restore Jest step
- [ ] Add further testing, mock webhooks for forms
- [ ] Add a `DEPLOY_ID=ci pnpm build` step to catch Netlify-only build
      regressions (see [docs/astro/known-issues.md](astro/known-issues.md) —
      the astro 6.1.3+ `plugin-chunk-imports` bug only fires when `DEPLOY_ID`
      is set, which is why our local builds passed while Netlify failed).

### OpenGraph image

- [x] `public/images/og-image.jpg` — verify this is a Javelina Works branded
      image, not the Stella template default. Replace if needed.
- [ ] `opengraph.twitter` in `config.toml` (line 115) — empty. Add your
      Twitter/X handle if you have one.

---

## Medium — Content sections & pages

### Homepage sections (`src/content/sections/english/`)

These markdown files drive the homepage sections. Each needs real copy:

- [x] `home-hero.md` — hero headline, subtitle, CTA button text, hero image/video
- [ ] `features-section.md` — feature cards (currently template SaaS features)
- [ ] `features-section-two.md` — second features block (same issue)
- [x] `how-it-works.md` — step-by-step flow (template content)
- [x] `call-to-action.md` — CTA section copy and button
- [x] `about-us.md` / `why-us.md` / `our-values.md` — company narrative

### FAQ (`src/content/faq/english/-index.md`)

- [ ] Review all questions — some reference SaaS products, integrations
      (Slack, Zapier, Stripe), and generic features. Replace with real
      Javelina Works FAQs.


---

## Low — Template scaffolding to clean up or fill in later

### Drafted collections (content exists but hidden)

These collections have template demo content behind `draft: true`. Decide per
collection: populate with real content, or delete entirely.

- [ ] **Pricing** (`src/content/pricing/english/-index.md`) — empty stub.
      Fill in real pricing tiers or delete the collection + route.
- [ ] **Testimonials** (`src/content/testimonial/english/-index.md`) — 9
      placeholder testimonials (TechCorp, Creative Solutions, InnovateX, etc.).
      Replace with real customer quotes or delete.
- [ ] **Careers** (`src/content/career/english/`) — 9 generic job postings.
      Replace with real openings or delete.
- [ ] **Changelog** (`src/content/changelog/english/-index.md`) — stub.
      Populate or delete.

### Integration collection

- [ ] `src/content/integration/` — 16 template integration pages (Slack,
      Discord, Zapier, etc.) all drafted. If Javelina Works doesn't offer
      integrations, delete the entire directory, its routes
      (`src/pages/[...lang]/integration/`), its layout components
      (`IntegrationCard`, `IntegrationSingle`, `IntegrationList`,
      `IntegrationSection`), the collection in `src/content.config.ts`, and
      the `integrationFolder` setting in `config.toml`.

### Orphan routes

These page route files build empty or near-empty pages that aren't linked from
the menu. Either populate them with real content or delete:

- [ ] `src/pages/[...lang]/company.astro`
- [ ] `src/pages/[...lang]/features.astro`
- [ ] `src/pages/[...lang]/pricing.astro`
- [ ] `src/pages/[...lang]/testimonial.astro`
- [ ] `src/pages/[...lang]/career.astro` (+ `career/` subdirectory)
- [ ] `src/pages/[...lang]/changelog.astro`

### Menu cleanup (`src/config/menu.en.json`)

- [ ] Remove or update disabled "Features" megamenu (lines 10–63) — contains
      template SaaS feature descriptions.
- [x] Remove disabled "Pages" dropdown (lines 66–200) — contains nested demo
      entries, integration links, etc.
- [x] Remove disabled "Components" entry (lines 202–215).
- [x] Trim footer menus (`footerMenuOne`, `footerMenuTwo`) — most entries are
      disabled placeholders.

### Misc

- [ ] `src/lib/utils/textConverter.ts` (line 20) — link renderer has hardcoded
      special-case for "getastrothemes". Remove.
- [ ] `public/umami.is.js` — confirm the Umami script matches your instance,
      or remove if not using analytics.
- [x] Verify `public/images/logo.svg` is your branded logo (not template default).
- [x] Run `npm run generate-favicons` after replacing the logo to regenerate
      favicon assets.
