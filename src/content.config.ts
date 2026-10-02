import { defineCollection } from "astro:content";
import { videoConfigSchema } from "./sections.schema";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Universal Page Schema
const page = z.object({
  title: z.string(),
  date: z.date().optional(), // example date format 2022-01-01 or 2022-01-01T00:00:00+00:00 (Year-Month-Day Hour:Minute:Second+Timezone)
  description: z.string().optional(),
  image: z.string().optional(),
  draft: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  robots: z.string().optional(),
  excludeFromSitemap: z.boolean().optional(),
  customSlug: z.string().optional(),
  canonical: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  disableTagline: z.boolean().optional(),
});

const contentLoader = (base: string) =>
  glob({ pattern: "**/[^_]*.{md,mdx}", base });

// Pages collection schema
const pagesCollection = defineCollection({
  loader: contentLoader("./src/content/pages"),
  schema: page,
});

// Post collection schema
const blogCollection = defineCollection({
  loader: contentLoader("./src/content/articles"),
  schema: page.extend({
    categories: z.array(z.string()).default(["others"]),
    author: z.string().optional(),
    excerpt: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

// Services collection schema (one entry per service, rendered at /services/<slug>/)
const serviceIconCards = z
  .object({
    title: z.string().optional(),
    button: z.object({ label: z.string(), url: z.string() }).optional(),
    list: z.array(
      z.object({
        icon: z.string(), // Lucide icon name
        title: z.string(),
        description: z.string(),
      }),
    ),
  })
  .optional();

const servicesCollection = defineCollection({
  loader: contentLoader("./src/content/services"),
  schema: page.extend({
    excerpt: z.string().optional(), // short line used on cards
    icon: z.string().optional(), // Lucide icon name, e.g. "Crosshair"
    weight: z.number().optional(), // display order (lower first)
    imagePosition: z.enum(["left", "right"]).optional(),
    imageHeight: z.number().optional(),
    highlights: z
      .object({
        title: z.string(),
        description: z.string().optional(),
        list: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          }),
        ),
      })
      .optional(),
    bento: z
      .object({
        title: z.string().optional(),
        list: z.array(
          z.object({
            image: z.string(),
            imageHeight: z.number().optional(),
            imageFit: z.enum(["contain", "cover"]).optional(),
            halfWidth: z.boolean().optional(),
            title: z.string(),
            description: z.string(),
          }),
        ),
      })
      .optional(), // image-led card grid right under the header (FeaturesSection)
    pillars: serviceIconCards, // icon cards rendered first (BenefitsSection)
    showcases: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          imagePosition: z.enum(["left", "right"]).optional(),
          interval: z.number().optional(), // ms per point
          items: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              image: z.string(),
              imageHeight: z.number().optional(),
            }),
          ),
        }),
      )
      .optional(), // cycling points beside one image (FeatureShowcase)
    exhibitsTitle: z.string().optional(),
    exhibits: z
      .array(
        z.object({
          image: z.string(),
          imagePosition: z.enum(["left", "right"]).optional(),
          imageHeight: z.number().optional(),
          title: z.string(),
          description: z.string(),
          features: z.array(
            z.object({ title: z.string(), description: z.string() }),
          ),
        }),
      )
      .optional(), // proof blocks with product screenshots (FeaturesSectionTwo)
    steps: z
      .object({
        title: z.string().optional(),
        id: z.string().optional(), // anchor, e.g. "how-a-job-runs"
        layout: z.enum(["cards", "timeline"]).optional(),
        list: z.array(
          z.object({
            step: z.string(), // e.g. "Step *01*"
            title: z.string(),
            description: z.string(),
            button: z.object({ label: z.string(), url: z.string() }).optional(),
          }),
        ),
      })
      .optional(), // HowItWorks
    uses: serviceIconCards, // standalone uses (BenefitsSection)
    faq: z
      .object({
        title: z.string().optional(),
        list: z.array(
          z.object({
            title: z.string(),
            content: z.string(),
            active: z.boolean().optional(),
          }),
        ),
      })
      .optional(),
  }),
});

export const changelogCollection = defineCollection({
  loader: contentLoader("./src/content/changelog"),
  schema: page.extend({
    enable: z.boolean().default(false), // Toggle section visibility
    title: z.string().optional(),
    changelogSection: z
      .object({
        enable: z.boolean().default(true).optional(),
        title: z.string().optional(),
        limit: z.union([z.number(), z.literal(false)]).optional(),
      })
      .optional(),
    list: z.array(
      z.object({
        title: z.string(),
        version: z.string(),
        date: z.string(),
        content: z.string(),

        video: videoConfigSchema.optional(),

        types: z
          .array(
            z.object({
              icon: z.string(),
              label: z.string(),
            }),
          )
          .optional(),

        changes: z.array(
          z.object({
            active: z.boolean().default(false),
            title: z.string(),
            list: z.array(
              z.object({
                label: z.string(),
                color: z.enum([
                  "emerald",
                  "indigo",
                  "slate",
                  "crimson",
                  "amber",
                ]),
                content: z.string(),
              }),
            ),
          }),
        ),
      }),
    ),
  }),
});

// Export collections
export const collections = {
  articles: blogCollection,
  pages: pagesCollection,
  services: servicesCollection,
  changelog: changelogCollection,
  career: defineCollection({ loader: contentLoader("./src/content/career") }),
  sections: defineCollection({
    loader: contentLoader("./src/content/sections"),
  }),
  testimonial: defineCollection({
    loader: contentLoader("./src/content/testimonial"),
  }),
  contact: defineCollection({ loader: contentLoader("./src/content/contact") }),
  faq: defineCollection({ loader: contentLoader("./src/content/faq") }),
  pricing: defineCollection({ loader: contentLoader("./src/content/pricing") }),
  homepage: defineCollection({
    loader: contentLoader("./src/content/homepage"),
  }),
  author: defineCollection({ loader: contentLoader("./src/content/author") }),
};
