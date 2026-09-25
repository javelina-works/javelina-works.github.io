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

// Dev-only same-origin proxy for the ballpark page: `astro dev` doesn't
// honor vite's server.proxy, so forward /api/ballpark-staging/* to the
// staging engine ourselves (mirrors the Netlify deploy-preview redirect).
// configureServer middleware runs before Astro's handler; builds unaffected.
const ballparkDevProxy = () => ({
  name: "ballpark-dev-proxy",
  configureServer(server) {
    const PREFIX = "/api/ballpark-staging";
    const TARGET = "https://fastapi-staging.up.railway.app/api/v2/ballpark";
    const handle = (req, res, next) => {
      if (!req.url || !req.url.startsWith(PREFIX)) return next();
      const target = TARGET + req.url.slice(PREFIX.length);
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", async () => {
        try {
          const upstream = await fetch(target, {
            method: req.method,
            headers: {
              "content-type": req.headers["content-type"] || "application/json",
            },
            body: ["GET", "HEAD"].includes(req.method)
              ? undefined
              : Buffer.concat(chunks),
          });
          const buf = Buffer.from(await upstream.arrayBuffer());
          res.statusCode = upstream.status;
          upstream.headers.forEach((v, k) => {
            if (
              ![
                "content-encoding",
                "transfer-encoding",
                "content-length",
              ].includes(k)
            )
              res.setHeader(k, v);
          });
          res.setHeader("content-length", buf.length);
          res.end(buf);
        } catch (e) {
          res.statusCode = 502;
          res.end("dev proxy error: " + e.message);
        }
      });
    };
    // Astro's dev handler and the Netlify emulation middleware consume
    // /api/* before plugin middlewares registered the normal way, so put
    // ours at the very front of the connect stack once everything else
    // has been installed.
    return () => {
      server.middlewares.stack.unshift({ route: "", handle });
    };
  },
});

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

  integrations: [
    sitemapConfig.enable ? sitemap() : null,
    AutoImport({
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
          assets: ["./dist/**/*.js", "./dist/**/*.js.map"],
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
    plugins: [tailwindcss(), ballparkDevProxy()],
    build: {
      sourcemap: "hidden",
    },
  },

  // Build optimized image variants at compile time, then let Netlify's normal
  // edge CDN serve the generated static assets. This avoids critical images
  // depending on cold Netlify Image CDN runtime transforms.
  adapter: netlify({
    imageCDN: false,
  }),
});
