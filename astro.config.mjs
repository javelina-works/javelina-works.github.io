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
    plugins: [tailwindcss()]
  },
});
