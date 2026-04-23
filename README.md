# Javelina Works, Inc. Landing Site

[![Netlify Status](https://api.netlify.com/api/v1/badges/f60c4240-ea37-4512-b528-cf9b09aeb038/deploy-status)](https://app.netlify.com/projects/javelina-works/deploys)

[![Lighthouse Performance](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/KCerveny/a65b625647ac86bf6014df974993b314/raw/lighthouse-performance.json)](https://javelinaworks.com)
[![Lighthouse Accessibility](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/KCerveny/a65b625647ac86bf6014df974993b314/raw/lighthouse-accessibility.json)](https://javelinaworks.com)
[![Lighthouse Best Practices](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/KCerveny/a65b625647ac86bf6014df974993b314/raw/lighthouse-best-practices.json)](https://javelinaworks.com)
[![Lighthouse SEO](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/KCerveny/a65b625647ac86bf6014df974993b314/raw/lighthouse-seo.json)](https://javelinaworks.com)
> Lighthouse scores reflect the most recent scheduled audit (daily at 06:00 UTC).


[![Uptime Robot status](https://img.shields.io/uptimerobot/status/m802870839-6929194214f813e9a6b86120)](https://stats.uptimerobot.com/SicNbR5xJX)
[![Uptime Ratio](https://img.shields.io/uptimerobot/ratio/m802870839-6929194214f813e9a6b86120)](https://stats.uptimerobot.com/SicNbR5xJX)
[![Open bugs](https://img.shields.io/github/issues/javelina-works/javelina-works.github.io/bug?label=open%20bugs&color=d73a4a)](https://github.com/javelina-works/javelina-works.github.io/issues?q=is%3Aissue+is%3Aopen+label%3Abug)


This is the repository hosting the static site and configurations for the Javelina Works website.

## Stack

[![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostHog](https://img.shields.io/badge/PostHog-1D4AFF?logo=posthog&logoColor=white)](https://posthog.com/)
[![Sentry](https://img.shields.io/badge/Sentry-362D59?logo=sentry&logoColor=white)](https://sentry.io/)
[![UptimeRobot](https://img.shields.io/badge/UptimeRobot-44CC11?logo=uptimerobot&logoColor=white)](https://uptimerobot.com/)
[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-FF5722?logo=coderabbit&logoColor=white)](https://coderabbit.ai/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Dependabot](https://img.shields.io/badge/Dependabot-025E8C?logo=dependabot&logoColor=white)](https://github.com/dependabot)
[![Jamstack](https://img.shields.io/badge/Jamstack-F0047F?logo=jamstack&logoColor=white)](https://sveltiacms.app/)


## Infrastructure

- [Netlify](https://app.netlify.com/projects/javelina-works/deploys): 
  - Static page hosting
  - Form submission handling
  - Content CDN
  - DNS Servicing
  - Edge functions
- [Google Voice](https://voice.google.com/): handles the business phone
  - **Phone Number:** (432) 203-5975
- [UptimeRobot](https://stats.uptimerobot.com/SicNbR5xJX): let's us know when the site is down
  - Discord hook in `uptime-detection` for unexpected service loss
- [Posthog](https://posthog.com/): Analysis and analytics platform
  - [Analytics basics](https://us.posthog.com/project/386965/dashboard/1481972)
  - - **Dashboard**: [Analytics basics](https://us.posthog.com/project/386965/dashboard/1481972)
  - **Insight**: [Contact Form Submissions Over Time](https://us.posthog.com/project/386965/insights/yjZsyp5D)
  - **Insight**: [Contact Form Conversion Funnel](https://us.posthog.com/project/386965/insights/aIJMj50c)
  - **Insight**: [Pricing Plan Toggle Breakdown](https://us.posthog.com/project/386965/insights/B6JSh8RG)
  - **Insight**: [Hero CTA Clicks Over Time](https://us.posthog.com/project/386965/insights/wX6fA6WD)
  - **Insight**: [Career Apply Click Funnel](https://us.posthog.com/project/386965/insights/m3tF2InE)
- [Sentry](https://javelina-works-inc.sentry.io/dashboard/3850428/?project=4511242748559360)
  - Publish GitHub issues for critical errors
  - Sends Discord notification for critical/regression errors
- [CodeRabbit](https://coderabbit.ai/): AI code reviewer on every pull request
  - Posts a PR summary and line-level review comments automatically when a PR is opened or updated
  - Catches correctness, style, and small security issues before human review
  - Re-review on demand by commenting `@coderabbitai review`
  - Free for this repo (public OSS tier)
- [Dependabot](https://github.com/dependabot): keeps dependencies current
  - Scans `npm` and `github-actions` ecosystems weekly (Mondays 06:00 America/Chicago) — see [`.github/dependabot.yml`](./.github/dependabot.yml)
  - Groups PRs to cut noise: `astro` + `@astrojs/*` bundled, minor/patch updates grouped separately for prod vs. dev, all GitHub Actions updates in one PR
  - Up to 8 open npm PRs and 3 open actions PRs at a time
  - Auto-merge enabled for low-risk updates (patch-level bumps, dev deps, `@types/*`, all GitHub Actions) — see [`.github/workflows/dependabot-auto-merge.yml`](./.github/workflows/dependabot-auto-merge.yml)
  - Astro core and all major version bumps require manual review

## Content editing

Non-developer content updates go through [Sveltia CMS](https://sveltiacms.app/),
a Git-backed headless CMS that commits directly to this repo. It's mounted at
**[javelinaworks.com/admin/](https://javelinaworks.com/admin/)** and edits the
Markdown/MDX files under `src/content/` that Astro reads from — so there's no
separate content database, and every edit lands as a normal commit on `staging`
that flows to `main` through the usual PR review.

Editors sign in with a GitHub PAT (fine-grained, scoped to this repo). See
[`docs/cms.md`](docs/cms.md) for the token setup and an overview of how each
Sveltia collection maps to `src/content/`.

## Roadmap
- Connect form submissions to CRM hook -> add account
  - Determine CRM service
- Enable email notifications for failures, builds, errata
- Find email publishing service (Mailchimp, LiteMail, etc.)
  - Connect to CRM + form submissions
- Set up our actual email accounts (Zoho?)
- Finish `features` section on homepage
- Integrate analytics platform



## Infrastructure Needed

- [ ] Instagram account
- [ ] Twitter account
- [ ] Facebook account
- [ ] Linkedin account


### Email Accounts

- privacy@javelinaworks.com
- info@javelinaworks.com
- support@javelinaworks.com
- contact@javelinaworks.com


## Misc

### Bonus Mercury Benefits

- ElevenLabs: 1 year free + 
- Apolo: 2k free GPU hours
- OpenRouter: $1k in free credits
- Maxime: 1 year AI legal council
- Rumi.ai: Meeting note transcription
- AWS: 5k in credits
- Numi: Startup design help, $12k in credits
- DigitalOcean: $5k in credits


### Bonus Posthog Benefits

Check startup grant email for codes, links, etc. 

- [Chroma](https://www.trychroma.com/): $5000 of credits, 
- [Incident.io](https://incident.io/): $1500 off team plan
- [Speakeasy](https://www.speakeasy.com/): 50% off for 6 months - AI control plane 

