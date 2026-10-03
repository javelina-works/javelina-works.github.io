import slug_maker from "slugify";
import { marked } from "marked";

// slugify
export const slugifyyy = (content: string) => {
  if (!content) return "";

  return slug_maker(content, { lower: true });
};

// Appended to external links: an arrow icon plus a screen-reader note.
const EXTERNAL_LINK_MARK =
  '<svg class="external-link-icon ml-1 inline-block h-[0.8em] w-[0.8em] align-[-0.05em]" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg><span class="sr-only"> (opens in a new tab)</span>';

// markdownify
export const markdownify = (content: string, container?: boolean) => {
  if (!content) return "";

  const renderer = new marked.Renderer();

  // Override the link renderer
  renderer.link = (link) => {
    const isExternal = link.href.startsWith("http");
    const targetAttrs = link.href.includes("getastrothemes")
      ? `target="_blank" rel="noopener"`
      : isExternal
        ? `target="_blank" rel="noopener noreferrer nofollow"`
        : "";

    const externalMark = isExternal ? EXTERNAL_LINK_MARK : "";
    return `<a href="${link.href}" ${targetAttrs}>${link.text}${externalMark}</a>`;
  };

  // Set the custom renderer
  marked.setOptions({
    renderer,
  });

  return container ? marked.parse(content) : marked.parseInline(content);
};

// humanize
export const humanize = (content: string) => {
  if (content)
    return content
      .replace(/^[\s_]+|[\s_]+$/g, "")
      .replace(/[_\s]+/g, " ")
      .replace(/[-\s]+/g, " ")
      .replace(/^[a-z]/, function (m) {
        return m.toUpperCase();
      });
};

// Function for converting string to capitalized words
export const titleify = (content: string) => {
  if (!content) {
    console.warn("No content provided to titleify " + content);
    return "";
  }

  const humanized = humanize(content) || "";
  return humanized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// plainify
export const plainify = (content: string) => {
  const parseMarkdown: any = marked.parse(content);
  const filterBrackets = parseMarkdown.replace(/<\/?[^>]+(>|$)/gm, "");
  const filterSpaces = filterBrackets.replace(/[\r\n]\s*[\r\n]/gm, "");
  const stripHTML = htmlEntityDecoder(filterSpaces);
  return stripHTML;
};

// strip entities for plainify
const htmlEntityDecoder = (htmlWithEntities: string) => {
  let entityList: { [key: string]: string } = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
  };
  let htmlWithoutEntities: string = htmlWithEntities.replace(
    /(&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (entity: string): string => {
      return entityList[entity];
    },
  );
  return htmlWithoutEntities;
};

// Convert to Uppercase
export const toUpperCase = (content: string) => {
  if (!content) {
    console.warn("No content provided to toUppercase " + content);
    return "";
  }
  return content.toUpperCase();
};

// Convert to Lowercase
export const toLowerCase = (content: string) => {
  if (!content) {
    console.warn("No content provided to toLowercase " + content);
    return "";
  }
  return content.toLowerCase();
};

// Convert to Sentence Case
export const toSentenceCase = (content: string) => {
  if (!content) {
    console.warn("No content provided to toSentenceCase " + content);
    return "";
  }
  const lowercased = content.toLowerCase();
  return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
};

// Remove whitespace characters
export function removeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
