import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";
import sitemap from "@astrojs/sitemap";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import fontsJson from "./src/config/fonts.json";
import rehypeExternalLinks from "rehype-external-links";
import { enabledLanguages } from "./src/lib/utils/i18nUtils.ts";
import remarkParseContent from "./src/lib/utils/remarkParseContent.ts";
import config from "./.astro/config.generated.json";
import { generateAstroFontsConfig } from "./src/lib/utils/AstroFont.ts";

import netlify from "@astrojs/netlify";
import sentry from "@sentry/astro";

const fonts = generateAstroFontsConfig(fontsJson);

let {
  seo: { sitemap: sitemapConfig },
  settings: {
    multilingual: { showDefaultLangInUrl, defaultLanguage },
  },
} = config;

// https://astro.build/config
export default defineConfig({
  site: config.site.baseUrl ? config.site.baseUrl : "http://javelinaworks.com",
  trailingSlash: config.site.trailingSlash ? "always" : "never",

  image: {
    layout: "constrained",
  },

  fonts,

  i18n: {
    locales: enabledLanguages,
    defaultLocale: defaultLanguage,
    routing: {
      prefixDefaultLocale: showDefaultLangInUrl,
    },
  },

  integrations: [sitemapConfig.enable ? sitemap() : null, AutoImport({
    imports: [
      "@/components/CustomButton.astro",
      "@/shortcodes/Accordion.astro",
      "@/shortcodes/Notice.astro",
      "@/shortcodes/Tabs.astro",
      "@/shortcodes/Tab.astro",
      "@/shortcodes/Testimonial.astro",
      "@/shortcodes/CardGrid.astro",
      "@/shortcodes/ImageList.astro",
      "@/shortcodes/ImageItem.astro",
      "@/shortcodes/Card.astro",
      "@/shortcodes/VideoInline.astro",
    ],
  }),
    mdx(),
    sitemap(),
    sentry({
      sourceMapsUploadOptions: {
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          assets: ['./dist/**/*.js', './dist/**/*.js.map'],
        },
      },
    }),
  ],

  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      ],
    ],
    remarkPlugins: [
      remarkParseContent, // Parse markdown content and add classes in heading and loading="lazy" to images
      remarkToc,
    ],

    // Code Highlighter https://github.com/shikijs/shiki
    shikiConfig: {
      theme: "light-plus", // https://shiki.style/themes
      wrap: false,
    },
    extendDefaultPlugins: true,
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: 'hidden',
    },
  },

  // Build optimized image variants at compile time, then let Netlify's normal
  // edge CDN serve the generated static assets. This avoids critical images
  // depending on cold Netlify Image CDN runtime transforms.
  adapter: netlify({
    imageCDN: false,
  }),
});
