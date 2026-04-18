# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Javelina Works Astro hybrid site. The existing `src/components/posthog.astro` snippet and its inclusion in `src/layouts/components/global/Head.astro` were already in place, so no changes were needed there. Six new client-side events were added across five files, covering the key conversion and engagement paths on the site. A `Window.posthog` TypeScript interface was added to `src/env.d.ts` so bundled scripts have proper type coverage.

| Event | Description | File |
|---|---|---|
| `contact_form_submitted` | User successfully submitted the contact form | `src/layouts/components/sections/ContactSection.astro` |
| `contact_form_error` | Contact form submission failed with an error (also captures exception) | `src/layouts/components/sections/ContactSection.astro` |
| `cta_button_clicked` | User clicked the call-to-action button in the CTA section | `src/layouts/components/sections/CallToAction.astro` |
| `pricing_plan_clicked` | User clicked a pricing plan CTA button | `src/layouts/components/cards/PricingCard.astro` |
| `blog_post_viewed` | User viewed a blog post (top of conversion funnel) | `src/pages/[...lang]/blog/[single].astro` |
| `job_listing_apply_clicked` | User clicked Apply Now on a job listing from the career list | `src/layouts/components/sections/JobList.astro` |

> Note: `career_apply_clicked` was already present in `src/pages/[...lang]/career/[single].astro` and was not duplicated.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/386965/dashboard/1482935)
- **Insight**: [Contact Form Submissions Over Time](https://us.posthog.com/project/386965/insights/rcdazmth)
- **Insight**: [Lead Generation Funnel](https://us.posthog.com/project/386965/insights/a7zUTIq7) — CTA click → contact form submit
- **Insight**: [Career Apply Funnel](https://us.posthog.com/project/386965/insights/EYgtlY62) — job listing click → application
- **Insight**: [Blog Post Views Over Time](https://us.posthog.com/project/386965/insights/h4JXjjjF) — broken down by post title
- **Insight**: [Pricing Plan Clicks by Plan](https://us.posthog.com/project/386965/insights/kaOurSC8) — broken down by plan name

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
