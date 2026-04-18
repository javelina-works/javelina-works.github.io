# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Javelina Works Astro (hybrid) website. A client-side PostHog snippet was added to every page via a new `src/components/posthog.astro` component loaded in the shared `Head.astro` layout. Event tracking was added to key conversion and engagement touchpoints across the site.

| Event Name | Description | File |
|---|---|---|
| `contact_form_submitted` | Fired when the contact form is successfully submitted | `src/layouts/components/widgets/ContactForm.astro` |
| `contact_form_error` | Fired when the contact form submission fails (also captures exception) | `src/layouts/components/widgets/ContactForm.astro` |
| `pricing_plan_toggled` | Fired when the user switches between pricing plans (e.g. monthly/annual) | `src/layouts/components/sections/PricingSection.astro` |
| `hero_cta_clicked` | Fired when a user clicks a primary CTA button in the hero section | `src/layouts/components/sections/HomeHero.astro` |
| `hero_video_played` | Fired when the user opens/plays the hero section video modal | `src/layouts/components/sections/HomeHero.astro` |
| `career_apply_clicked` | Fired when a user clicks the Apply Now button on a career detail page | `src/pages/[...lang]/career/[single].astro` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics](https://us.posthog.com/project/386965/dashboard/1481972)
- **Insight**: [Contact Form Submissions Over Time](https://us.posthog.com/project/386965/insights/yjZsyp5D)
- **Insight**: [Contact Form Conversion Funnel](https://us.posthog.com/project/386965/insights/aIJMj50c)
- **Insight**: [Pricing Plan Toggle Breakdown](https://us.posthog.com/project/386965/insights/B6JSh8RG)
- **Insight**: [Hero CTA Clicks Over Time](https://us.posthog.com/project/386965/insights/wX6fA6WD)
- **Insight**: [Career Apply Click Funnel](https://us.posthog.com/project/386965/insights/m3tF2InE)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
