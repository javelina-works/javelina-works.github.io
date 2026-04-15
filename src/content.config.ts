import { defineCollection } from "astro:content";
import config from ".astro/config.generated.json";
import { button, videoConfigSchema } from "./sections.schema";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const { integrationFolder } = config.settings;

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
  loader: contentLoader("./src/content/blog"),
  schema: page.extend({
    categories: z.array(z.string()).default(["others"]),
    author: z.string().optional(),
    excerpt: z.string().optional(),
    featured: z.boolean().optional(),
  }),
});

// Integration Collection
const integrationCollection = defineCollection({
  loader: contentLoader("./src/content/integration"),
  schema: page.extend({
    categories: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    button: button.optional(),
    sections: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          category: z.string(),
        }),
      )
      .optional(),
    fields: z
      .array(
        z.object({
          name: z.string(),
          content: z.string(),
        }),
      )
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
  blog: blogCollection,
  integration: integrationCollection,
  [integrationFolder]: integrationCollection,

  pages: pagesCollection,
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
