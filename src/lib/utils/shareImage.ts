import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import { absoluteUrl } from "./absoluteUrl";

// Content refers to images by their site path ("/images/services/…png"), but most of them live in
// src/assets/images/, which is not published as-is: a bare "/images/…" URL for them 404s in production.
// These helpers find the asset behind such a path, so pages and share tags can point at a real built file.
const assets = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.{jpeg,jpg,png,webp,avif,gif}",
);

/** The src/assets image behind a site path such as "/images/process/routes-region.jpg", if there is one. */
export async function findAssetImage(
  src: string,
): Promise<ImageMetadata | undefined> {
  const path = src.split(/[?#]/)[0];
  const load = assets[`/src/assets${path.startsWith("/") ? "" : "/"}${path}`];
  return load ? (await load()).default : undefined;
}

/**
 * Absolute URL for a share image (og:image, twitter:image, JSON-LD image and logo) that resolves to a real file.
 * A path that lives in src/assets/images is built into /_astro/ as a JPEG at most 1200px wide (what every link preview
 * reads, and a fraction of a full-size PNG); keepFormat keeps a PNG a PNG (the logo, which needs its transparency).
 * Anything else (a public/ file such as /images/og-image.jpg, or a full URL) is used as it is.
 */
export async function shareImageUrl(
  src: string | undefined,
  Astro: any,
  { keepFormat = false }: { keepFormat?: boolean } = {},
): Promise<string | undefined> {
  if (!src) return undefined;
  if (/^https?:\/\//.test(src)) return src;
  const meta = await findAssetImage(src);
  if (!meta) return absoluteUrl(src, Astro);
  const png = keepFormat && meta.format === "png";
  const built = await getImage({
    src: meta,
    width: Math.min(meta.width, 1200),
    format: png ? "png" : "jpg",
    quality: png ? undefined : 82,
  });
  return absoluteUrl(built.src, Astro);
}
