import config from ".astro/config.generated.json";
import type { APIRoute } from "astro";

const { enable, disallow } = config.seo.robotsTxt;

const getRobotsTxt = (
  sitemapURL: URL | null,
) => `# Robots.txt file for controlling web crawler access

User-agent: *

# Allowed pages
Allow: /

# Disallowed pages
${disallow?.map((item: string) => `Disallow: ${item}`).join("\n") || ""}

${sitemapURL ? `# Sitemap location\nSitemap: ${sitemapURL.href}\n` : ""}`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = config.seo.sitemap.enable
    ? new URL("sitemap-index.xml", site)
    : null;
  return enable
    ? new Response(getRobotsTxt(sitemapURL))
    : new Response(null, { status: 404 });
};
