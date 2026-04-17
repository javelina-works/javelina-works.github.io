# Content TODO — Javelina Works Site

Everything that still needs to be replaced with real Javelina Works content.
Items are grouped by priority and area. Check off as you go.

---

## Critical — Template values that break credibility

These are template-author defaults that will be visible to users or search
engines on the live site.

### Config (`src/config/config.toml`)

- [x] **baseUrl** (line 8) — currently `https://stella-astro.netlify.com`.
      Change to `https://javelinaworks.com` (or your canonical URL).
- [ ] **Site description** (line 4) — currently generic SaaS template copy:
      _"A customizable and multipurpose saas & startup astro theme…"_.
      Replace with a 1–2 sentence Javelina Works description.
- [ ] **Tagline** (line 5) — currently `"Multipurpose Saas & Startup Astro Js Theme"`.
      Replace with your actual tagline.
- [x] **SEO author** (line 28) — currently `"Getastrothemes"`.
      Change to `"Javelina Works, Inc."` or the real author.
- [ ] **SEO keywords** (lines 29–33) — currently `["saas astro theme", …]`.
      Replace with real business keywords.
- [ ] **Contact form email** (line 65) — currently `temp.gats@gmail.com`.
      Replace with the real Javelina Works contact email.
- [ ] **Mailchimp subscription** (line 82) — form action points to a demo list.
      Replace with your Mailchimp list URL, or set `enable = false` (line 80).
- [ ] **Umami analytics** (line 122) — `data-website-id=""` is empty.
      Either set the real Umami ID or remove the `<script>` tag entirely.

### Contact form error fallback

- [ ] `src/content/sections/english/contact-section.md` (line 127) — error
      message references `folex-astro-theme@gmail.com`. Replace with real
      support email.
- [ ] `src/layouts/components/widgets/ContactForm.astro` (line 374) — same
      template email in the code fallback. Update to match.

### Contact info (`src/i18n/en.json`)

- [x] **Address** — `"03 Ranch Road, Fort Davis, Texas"` → confirm or correct.
- [ ] **Phone** — `"925-465-3762"` → confirm or correct.
- [x] **Email** — `"info@javelinaworks.com"` → confirm or correct.

### Privacy Policy & Terms

- [x] `src/content/pages/english/privacy-policy.md` (line 91) — placeholder
      address: `"123 Javelina Works Lane, Imaginary City, IC 12345, USA"`.
      Replace with real business address.
- [x] `src/content/pages/english/privacy-policy.md` (line 71) —
      `privacy@javelinaworks.com`. Verify this email exists or replace.
- [x] `src/content/pages/english/privacy-policy.md` (line 7) — effective date
      is `"Jan, 2026"`. Update to the real effective date.
- [x] `src/content/pages/english/terms-conditions.md` (line 7) — same outdated
      effective date. Update.

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

- [ ] `public/images/og-image.jpg` — verify this is a Javelina Works branded
      image, not the Stella template default. Replace if needed.
- [ ] `opengraph.twitter` in `config.toml` (line 115) — empty. Add your
      Twitter/X handle if you have one.

### Blog posts (12 posts, all published)

All posts under `src/content/blog/english/` are currently **published**
(`draft: false`) with template content and the author `"Allium Johnson"`.

- [ ] Set all 12 posts to `draft: true` until real content is ready.
- [ ] When writing real posts, update the `author` field to a real name.

### Social links (`src/config/social.json`)

- [ ] Twitter, Facebook, Instagram, LinkedIn — all `enable: false` with
      placeholder URLs. Populate with real Javelina Works accounts or delete.
- [ ] GitHub entry (line 30) — icon path is `/images/icons/svg/instagram.svg`
      (wrong icon). Fix if keeping GitHub link.

---

## Medium — Content sections & pages

### Homepage sections (`src/content/sections/english/`)

These markdown files drive the homepage sections. Each needs real copy:

- [ ] `home-hero.md` — hero headline, subtitle, CTA button text, hero image/video
- [ ] `features-section.md` — feature cards (currently template SaaS features)
- [ ] `features-section-two.md` — second features block (same issue)
- [ ] `how-it-works.md` — step-by-step flow (template content)
- [ ] `call-to-action.md` — CTA section copy and button
- [ ] `about-us.md` / `why-us.md` / `our-values.md` — company narrative

### FAQ (`src/content/faq/english/-index.md`)

- [ ] Review all questions — some reference SaaS products, integrations
      (Slack, Zapier, Stripe), and generic features. Replace with real
      Javelina Works FAQs.

### Footer copy (`src/i18n/en.json` → `footer`)

- [ ] `description` — currently _"We provide seamless solutions to Small and
      Medium Businesses…"_. Update to match your real elevator pitch.
- [ ] `copyright` — currently _"Copyright © 2024 Javelina Works, Inc."_.
      Update year and verify entity name.
- [ ] Column titles (`colTitleOne`, `colTitleTwo`, `colTitleThree`) — currently
      "Company", "Resources", "Contact". Update if your footer groupings differ.

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

### Components/design-system page

- [ ] `src/content/pages/english/components.mdx` — template design-system
      demo. Not business content. Delete or keep drafted.
- [ ] `src/content/pages/french/components.mdx` — **published** (`draft: false`)
      but should be hidden. Draft or delete.

### French / i18n cleanup

Multilingual is disabled in config (`settings.multilingual.enable = false`)
but French content files still exist throughout the repo:

- [x] Delete all `french/` subdirectories under `src/content/`
- [x] Delete `src/config/menu.fr.json`
- [x] Delete `src/i18n/fr.json`
- [x] Remove French entry from `src/config/language.json`
- [x] Remove `generate-multilingual-content` and `remove-multilingual` scripts
      from `package.json` and `scripts/`
- [ ] (Optional, bigger refactor) Remove `[...lang]` routing machinery entirely
      if you'll never need i18n

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
- [ ] Remove disabled "Pages" dropdown (lines 66–200) — contains nested demo
      entries, integration links, etc.
- [ ] Remove disabled "Components" entry (lines 202–215).
- [ ] Trim footer menus (`footerMenuOne`, `footerMenuTwo`) — most entries are
      disabled placeholders.

### Legacy deploy configs

If GitHub Pages is the only target, these can be removed:

- [x] `netlify.toml`
- [x] `vercel.json` / `vercel.sh`
- [?] `wrangler.toml`

### Misc

- [ ] `src/lib/utils/textConverter.ts` (line 20) — link renderer has hardcoded
      special-case for "getastrothemes". Remove.
- [ ] `public/umami.is.js` — confirm the Umami script matches your instance,
      or remove if not using analytics.
- [ ] Verify `public/images/logo.svg` is your branded logo (not template default).
- [ ] Run `npm run generate-favicons` after replacing the logo to regenerate
      favicon assets.
