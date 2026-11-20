// What each article image shows: alt text, an optional caption, and how it behaves.
// An article's frontmatter `image` (a "/images/…" path, served from src/assets/images through astro:assets) is the
// key. The collection schema strips unknown frontmatter keys, so the words live here, next to the article pages.
//   alt:      what the picture shows (never the article title)
//   caption:  shown under the hero, for a survey image or a frame that needs a word on what it is
//   diagram:  a survey image, map or labeled frame: it keeps its colors at night (photos dim) and the hero shows it whole
//   position: object-position for the 16:9 card crop (default center)
// Captions that reuse a line already on the site say so in the comment.

export interface ArticleImage {
  alt: string;
  caption?: string;
  diagram?: boolean;
  position?: string;
}

const images: Record<string, ArticleImage> = {
  // why-manage-brush
  "/images/homepage/hero-background-poster.png": {
    alt: "A drone view over a desert valley: grass and scattered brush, a dirt road, and brush-covered hills under big clouds.",
  },
  // why-brush-control (caption: the brush-targeting page's line for this image)
  "/images/services/brush-targeting/plants-found-boxes.png": {
    alt: "A drone survey image of brushy grassland with an orange box around each woody plant: 55 found, with a 10 m scale bar.",
    caption: "A survey flight at 2.5 to 5 cm per pixel, and every woody plant marked where it stands.",
    diagram: true,
  },
  // brush-control-cattle-profitability (alt: the advisors page's alt for this photo)
  "/images/about/loading-drone.jpeg": {
    alt: "Two crew members kneeling on open rangeland to load a treatment aircraft, with pickups and a shade canopy behind them and mountains on the horizon",
    position: "50% 60%",
  },
  // chemical-brush-control
  "/images/process/pellets-in-flight.jpg": {
    alt: "Looking straight down from the treatment drone at one juniper, framed by target brackets labeled Juniper, target 01.",
    caption: "The treatment drone’s camera over one juniper, marked as target 01. The red curve at the bottom of the frame is the drone’s hopper.",
  },
  // individual-plant-treatment (caption: the brush-targeting page's "The right dose" line)
  "/images/services/brush-targeting/one-plant-dose.png": {
    alt: "A survey image with one juniper boxed as target 01, beside its measurements: crown width 9.2 ft, height 5.0 ft, canopy area 66 square feet, and 3 hexazinone pellets.",
    caption:
      "The survey measures each target's crown width, height and canopy area, and the dose is set from that, plant by plant. A small juniper gets less than a big one.",
    diagram: true,
    position: "0% 50%",
  },
  // who-brush-work-is-for
  "/images/homepage/promo-video-poster.png": {
    alt: "A man in a cap watches a treatment drone with a red hopper fly over brushy hills.",
  },
  // brush-and-water-dry-country (alt: the Location section's alt for this photo)
  "/images/texas-effect.jpeg": {
    alt: "A drone flies over desert grassland and brush under a rain cell, with a person standing in the brush and mesas on the horizon.",
  },
  // brush-and-wildfire-davis-mountains
  "/images/office/barn.png": {
    alt: "A drone view of a rust-red steel barn and travel trailers at the foot of brushy mountain slopes, with a draw of green trees beside a dirt road.",
  },
  // brush-return-calculator-scenarios
  "/images/about/thomas-testflight.jpeg": {
    alt: "A person at a computer station inside an open barn door, looking out at grass and brushy hills.",
  },
  // how-much-brush-to-keep (caption: the brush-targeting page's line for this image)
  "/images/services/brush-targeting/bento-protected-tree.png": {
    alt: "A survey map: orange dots on the plants to treat, purple dots on protected trees, each protected tree inside a dashed ring, and a label naming one as a piñon pine.",
    caption: "Mark oaks, piñons or any other tree as protected and it gets a buffer the plan stays out of.",
    diagram: true,
  },
  // paying-for-brush-work-trans-pecos (caption: the process showcase's line for this image)
  "/images/process/survey-mosaic.png": {
    alt: "A survey map of one zone: the stitched drone photo of brushy ground over a grid of photo footprints, 679 photographs on 18 flight lines, with a 100 m scale bar.",
    caption:
      "Hundreds of overlapping photographs are stitched into one orthophoto of the zone at 2.5 to 5 cm per pixel, pinned to the ground with RTK positioning so every plant has a real position.",
    diagram: true,
  },
  // wildlife-valuation-brush-management
  "/images/about/gray-emlid.jpeg": {
    alt: "A man kneels at a yellow survey tripod on rocky desert ground, with a pickup and a mesa behind him.",
    position: "50% 30%",
  },
};

/** The words for an article image; an image without an entry gets empty alt text (decorative) and no caption. */
export function articleImage(src: string | undefined): ArticleImage {
  if (!src) return { alt: "" };
  return images[src.split(/[?#]/)[0]] ?? { alt: "" };
}
