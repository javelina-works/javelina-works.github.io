# Content TODO — Javelina Works Site

Everything that still needs to be replaced with real Javelina Works content.
Items are grouped by priority and area. Check off as you go.

---

## Critical — Template values that break credibility

These are template-author defaults that will be visible to users or search
engines on the live site.

### Bonus Mercury Benefits
- ElevenLabs: 1 year free + 
- Apolo: 2k free GPU hours
- OpenRouter: $1k in free credits
- Maxime: 1 year AI legal council
- Rumi.ai: Meeting note transcription
- AWS: 5k in credits
- Numi: Startup design help, $12k in credits
- DigitalOcean: $5k in credits


### Config (`src/config/config.toml`)

- [x] **Contact form email** (line 65) — currently `temp.gats@gmail.com`.
      Replace with the real Javelina Works contact email.
- [x] **Mailchimp subscription** (line 82) — form action points to a demo list.
      Replace with your Mailchimp list URL, or set `enable = false` (line 80).
- [ ] **Umami analytics** (line 122) — `data-website-id=""` is empty.
      Either set the real Umami ID or remove the `<script>` tag entirely.

---

## High — SEO & first impressions

### Meta descriptions

The placeholder `"This is a example description"` appears in the frontmatter
`metaDescription` field of these files. Replace each with a real description:

- [ ] `src/content/blog/english/-index.md`
- [ ] `src/content/pricing/english/-index.md`
- [ ] `src/content/career/english/-index.md`
- [ ] `src/content/testimonial/english/-index.md`
- [ ] `src/content/pages/english/components.mdx`
- [ ] Integration index (if the integration collection is kept)

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
