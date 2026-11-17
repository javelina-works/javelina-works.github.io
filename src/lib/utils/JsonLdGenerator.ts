/**
 * JSON-LD Generator
 *
 * Emits one schema.org `@graph` per page so Google, Bing and AI search can read
 * what the page *is*, not just that it is a page:
 *
 *   - Organization/LocalBusiness and WebSite on every page, each with a stable
 *     `@id`, so every other node points at them instead of repeating them
 *   - the WebPage itself, plus a BreadcrumbList below the home page
 *   - BlogPosting on /articles/<slug>/  (headline, dates, author, image)
 *   - Service on /services/<slug>/      (provider, area served)
 *   - FAQPage wherever the page renders a question list (/faq/, and the FAQ
 *     block on service pages). The answers must stay visible on the page,
 *     which they are: the accordions ship their text in the HTML.
 *
 * The page type comes from the URL, so no frontmatter has to opt in.
 */
import { absoluteUrl } from "./absoluteUrl";
import { getLocaleUrlCTM } from "@/lib/utils/i18nUtils";
import trailingSlashChecker from "./trailingSlashChecker";
import social from "@/config/social.json";
import en from "@/i18n/en.json";

export type JSONLDProps = {
  canonical?: string; // Canonical URL of the page
  title?: string; // Page name (follows the <title> tag)
  headline?: string; // On-page title, used as the article/service name
  description?: string; // Description of the page
  image?: string; // Absolute image URL
  categories?: string[]; // Categories for articles
  author?: string; // Author name for articles
  pageType?: string; // Optional override: "home" | "article" | "service" | "faq" | "page"

  [key: string]: any;
};

type FaqItem = { title?: string; content?: string };

// Breadcrumb labels for the section a page sits in. /tools/ has no page of
// its own; it redirects to the remote tools service page.
const SECTION_CRUMBS: Record<string, { name: string; path: string }> = {
  articles: { name: "Articles", path: "/articles/" },
  services: { name: "Services", path: "/services/" },
  tools: { name: "Remote tools", path: "/services/remote-tools/" },
};

/** Markdown/HTML to plain text for JSON-LD string values. */
export function plainText(value: unknown): string {
  if (typeof value !== "string") return "";
  return (
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/(\*\*|__|`)/g, "")
      // Drop any angle brackets a malformed or nested tag left behind
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Flatten either a flat FAQ list or a grouped one ({ label, list: [...] }). */
function faqItems(list: unknown): FaqItem[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((item: any) =>
    Array.isArray(item?.list) ? faqItems(item.list) : [item],
  );
}

function faqQuestions(items: FaqItem[]) {
  return items
    .map((q) => ({ name: plainText(q.title), text: plainText(q.content) }))
    .filter((q) => q.name && q.text)
    .map((q) => ({
      "@type": "Question",
      name: q.name,
      acceptedAnswer: { "@type": "Answer", text: q.text },
    }));
}

function isoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(String(value));
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function detectPageType(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "home";
  if (segments[0] === "articles" && segments.length === 2) return "article";
  if (segments[0] === "services" && segments.length === 2) return "service";
  if (segments[0] === "faq" && segments.length === 1) return "faq";
  return "page";
}

export default function JsonLdGenerator(content: JSONLDProps, Astro: any) {
  let {
    canonical = "/",
    title = "",
    headline = "",
    description = "",
    image = "",
    pageType = "",
    lang,
    alternateLangs = [], // Array of alternate language URLs
    config,
  } = content || {};

  if (!lang) {
    lang = config.settings.multilingual.defaultLanguage;
  }

  const origin = trailingSlashChecker(Astro.url.origin);
  const base = origin.replace(/\/$/, "");
  const orgId = `${base}/#organization`;
  const siteId = `${base}/#website`;
  const pageId = canonical;
  const pathname: string = Astro.url.pathname;
  const type = pageType || detectPageType(pathname);
  const name = plainText(headline) || plainText(title);

  const areaServed = [
    "West Texas",
    "Trans-Pecos",
    "Big Bend",
    "Davis Mountains",
    "Jeff Davis County, TX",
    "Brewster County, TX",
    "Presidio County, TX",
    "Texas",
  ];

  const organization = {
    "@type": ["Organization", "LocalBusiness"],
    "@id": orgId,
    name: config.seo.author,
    alternateName: config.site.title,
    description: config.site.description,
    url: origin,
    telephone: en.contactInfo.phone,
    email: en.contactInfo.email,
    image: absoluteUrl(config.opengraph.image, Astro),
    address: {
      "@type": "PostalAddress",
      streetAddress: "03 Ranch Road",
      addressLocality: "Fort Davis",
      addressRegion: "TX",
      postalCode: "79734",
      addressCountry: "US",
    },
    areaServed,
    knowsAbout: [
      "brush management",
      "mesquite control",
      "cedar and juniper control",
      "drone brush surveys",
      "individual plant treatment",
      "rangeland restoration",
    ],
    sameAs: social.main.filter((item) => item.enable).map((item) => item.url),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(config.site.logo, Astro),
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": siteId,
    name: config.site.title,
    description: config.site.description,
    url: origin,
    inLanguage: lang,
    publisher: { "@id": orgId },
  };

  const webPage: Record<string, any> = {
    "@type": type === "faq" ? ["WebPage", "FAQPage"] : "WebPage",
    "@id": pageId,
    url: pageId,
    name: plainText(title),
    description,
    image,
    inLanguage: lang,
    isPartOf: { "@id": siteId },
    publisher: { "@id": orgId },
  };
  if (type === "home") webPage.about = { "@id": orgId };

  if (alternateLangs.length > 0) {
    webPage.alternateLanguage = alternateLangs
      .filter((alt: any) => Astro.currentLocale !== alt.languageCode)
      .map((alt: any) => ({
        "@type": "WebPage",
        url: getLocaleUrlCTM(canonical, alt.languageCode),
        inLanguage: alt.languageCode,
      }));
  }

  const graph: Record<string, any>[] = [organization, website, webPage];

  // Breadcrumbs: Home > section > this page
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const crumbs = [{ name: "Home", item: origin }];
    const section = SECTION_CRUMBS[segments[0]];
    if (segments.length > 1 && section) {
      crumbs.push({
        name: section.name,
        item: trailingSlashChecker(`${base}${section.path}`),
      });
    }
    const last = segments[segments.length - 1];
    const listPage =
      segments[segments.length - 2] === "page" && /^\d+$/.test(last);
    crumbs.push({
      name: listPage ? `Page ${last}` : name || last,
      item: pageId,
    });
    const breadcrumbId = `${pageId}#breadcrumb`;
    webPage.breadcrumb = { "@id": breadcrumbId };
    graph.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    });
  }

  if (type === "article") {
    const published = isoDate(content.date);
    const authorName = typeof content.author === "string" ? content.author : "";
    graph.push({
      "@type": "BlogPosting",
      "@id": `${pageId}#article`,
      mainEntityOfPage: { "@id": pageId },
      headline: name,
      description,
      image,
      datePublished: published,
      dateModified: isoDate(content.lastmod) || published,
      inLanguage: lang,
      keywords: Array.isArray(content.keywords)
        ? content.keywords.join(", ")
        : undefined,
      articleSection: Array.isArray(content.categories)
        ? content.categories[0]
        : undefined,
      author: authorName
        ? { "@type": "Person", name: authorName, worksFor: { "@id": orgId } }
        : { "@id": orgId },
      publisher: { "@id": orgId },
      isPartOf: { "@id": siteId },
    });
  }

  if (type === "service") {
    graph.push({
      "@type": "Service",
      "@id": `${pageId}#service`,
      name,
      serviceType: name,
      description,
      image,
      url: pageId,
      provider: { "@id": orgId },
      areaServed,
      mainEntityOfPage: { "@id": pageId },
    });
  }

  // FAQ: the /faq/ page is itself the FAQPage; a service page carries its
  // FAQ block as a separate node.
  if (type === "faq") {
    const questions = faqQuestions(faqItems(content.list));
    if (questions.length) webPage.mainEntity = questions;
  } else if (type === "service") {
    const questions = faqQuestions(faqItems(content.faq?.list));
    if (questions.length) {
      graph.push({
        "@type": "FAQPage",
        "@id": `${pageId}#faq`,
        isPartOf: { "@id": pageId },
        mainEntity: questions,
      });
    }
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
