// The site's navigation, in one place for the header (NavBar) and the footer.
// Labels and menu descriptions are the existing ones from src/config/menu.en.json; "All services" and
// "Get a ballpark" are new words (see the redesign pull request, New copy to review).
import type { NavEntry } from "@/components/jw/NavBar.astro";

export interface SiteLink {
  label: string;
  href: string;
  description?: string;
}

export const services: SiteLink[] = [
  { label: "Brush targeting", href: "/services/brush-targeting/", description: "Plant-by-plant treatment from the air." },
  { label: "Survey work", href: "/services/survey-work/", description: "Count and map every mesquite and cedar." },
  { label: "Monitoring", href: "/services/monitoring/", description: "See what the treatment did and what's coming back." },
  { label: "Remote tools", href: "/services/remote-tools/", description: "The instant ballpark and your dashboard." },
];
export const allServices: SiteLink = { label: "All services", href: "/services/" };

export const tools: SiteLink[] = [
  { label: "Free ballpark estimate", href: "/tools/ballpark/", description: "A measured budget range from the ranch address." },
  { label: "Free ranch map", href: "/tools/ranch-map/", description: "Terrain, creeks and brush on a printable map." },
  { label: "Brush return calculator", href: "/tools/brush-roi/", description: "What clearing brush could give back in grass and water." },
];

/** Header: four entries. Services and Tools open a menu; Pricing and Contact are links. */
export const primaryNav: NavEntry[] = [
  { label: "Services", items: services, all: allServices },
  { label: "Tools", items: tools },
  { label: "Pricing", href: "/pricing/" },
  { label: "Contact", href: "/contact/" },
];

/** Shown in the folded (phone) menu only; on wide screens these live in the footer. */
export const moreNav: SiteLink[] = [
  { label: "Company", href: "/company/" },
  { label: "FAQ", href: "/faq/" },
  { label: "Articles", href: "/articles/" },
  { label: "For advisors", href: "/advisors/" },
];

/** The header lamp: the page's one glowing action. */
export const lampAction: SiteLink = { label: "Get a ballpark", href: "/tools/ballpark/" };

/** Footer link columns. Every link the old footer had is here, plus Company, the service pages and the tools. */
export const footerColumns: { title: string; links: SiteLink[] }[] = [
  { title: "Services", links: [...services, allServices] },
  { title: "Tools", links: tools },
  {
    title: "Company",
    links: [
      { label: "Company", href: "/company/" },
      { label: "Pricing", href: "/pricing/" },
      { label: "Contact", href: "/contact/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Articles", href: "/articles/" },
      { label: "For advisors", href: "/advisors/" },
    ],
  },
];

/** Legal links on the footer line (the Cookie preferences button sits beside them). */
export const legalLinks: SiteLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Terms & Conditions", href: "/terms-conditions/" },
];
