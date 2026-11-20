// What each image on the services pages shows, for its alt text, and how it behaves at night.
// The content files give only a path and a title, and the title is not a description of the picture, so the alt text
// lives here, keyed by the content path (/images/… → src/assets/images/…).
//   dim: false keeps an image at full brightness at night (charts, satellite data maps, tool screenshots); photos and
//   survey images dim a little at night like every other photo on the site.
//   caption: a visible caption, for screenshots that should say they are the tool and not a photo.
export interface ImageNote {
  alt: string;
  dim?: boolean;
  caption?: string;
}

export const imageNotes: Record<string, ImageNote> = {
  // brush targeting
  "/images/services/brush-targeting/plants-found-boxes.png": {
    alt: "Survey image of brushy pasture from above, with an orange box drawn around each woody plant and a 10 m scale bar.",
  },
  // a different corner of the targets-and-protected-trees frame (x 0, y 170, 820 x 510), without the popup, so
  // "Buffers" doesn't repeat the "Only the right targets" picture
  "/images/services/brush-targeting/protected-tree-buffers.png": {
    alt: "Survey image of a pasture with protected piñon pines marked in purple, each inside a pink buffer circle, among orange-marked targets.",
  },
  "/images/services/brush-targeting/bento-protected-tree.png": {
    alt: "Survey image with piñon pines marked as protected, each inside a pink buffer circle, among orange-marked targets.",
  },
  "/images/services/brush-targeting/bento-review-tiles.png": {
    alt: "Two close-up survey tiles of junipers, one marked approved and one marked rejected.",
  },
  "/images/services/brush-targeting/plan-map-routes.png": {
    alt: "Survey map of a treatment zone with green target plants and the flight routes drawn between them.",
  },
  "/images/services/brush-targeting/one-plant-dose.png": {
    alt: "One juniper boxed on the survey image beside its measurements: crown width 9.2 ft, height 5.0 ft, canopy area 66 square feet, 3 hexazinone pellets.",
  },
  "/images/services/brush-targeting/targets-and-protected-trees.png": {
    alt: "Survey image with each treatment target marked in orange and the protected piñon pines ringed by pink buffer circles.",
  },
  "/images/services/brush-targeting/target-audit-map-plan.png": {
    alt: "Plan map of one pasture inside its boundary line, with approved targets in green and rejected detections in red.",
  },
  "/images/services/brush-targeting/exclusion-area.png": {
    alt: "Survey image with a red hatched no-treatment area drawn by the owner over part of the brush.",
  },
  "/images/services/brush-targeting/pellets-in-flight.jpg": {
    alt: "View from the aircraft's camera: a juniper from above, framed by targeting brackets and labeled juniper.",
  },
  "/images/services/brush-targeting/before-after-sentinel.png": {
    alt: "Two satellite greenness maps of the same ground: February, before treatment, mostly tan, and July, after it, green across the grass.",
    dim: false,
  },
  "/images/services/brush-targeting/review-grid.png": {
    alt: "A grid of close-up survey tiles, each showing one juniper with its species label and a confidence score.",
  },
  "/images/homepage/promo-video-poster.png": {
    alt: "A man in a cap watches a drone fly over grassland and low hills.",
  },
  // survey work
  "/images/about/depot-setup.png": {
    alt: "A drone flies above the field depot: a blue shade tent with a person seated under it, folding chairs and a Jeep in desert scrub.",
  },
  // monitoring
  "/images/services/monitoring/ndvi-with-plants-2026-07.png": {
    alt: "Satellite greenness map of a long, narrow region with treated plants in blue, untreated detections in orange and the zone outlines from the plan.",
    dim: false,
  },
  "/images/services/monitoring/sentinel-gap-chart.png": {
    alt: "Line chart of mean greenness from October to October under treated plants, under untreated detections and across the whole block, with the treatment months from March to May shaded.",
    dim: false,
  },
  "/images/services/monitoring/sentinel-departure-chart.png": {
    alt: "Bar chart of how far the treated pixels' greenness departed from the untreated ones on each pass, with the bars turning negative after treatment.",
    dim: false,
  },
  "/images/services/monitoring/ndvi-before-2026-02.png": {
    alt: "Satellite greenness map of the region in February, almost all tan.",
    dim: false,
  },
  "/images/services/monitoring/ndvi-after-2026-07.png": {
    alt: "Satellite greenness map of the same region in July, green across most of the ground.",
    dim: false,
  },
  "/images/services/monitoring/truecolor-2026-07.png": {
    alt: "True-color satellite image of the same region in July.",
    dim: false,
  },
  // remote tools (screenshots of the tools the page describes)
  "/images/tools/ballpark.png": {
    alt: "Screenshot of the instant ballpark: a satellite map of Texas that asks how you want to find your ranch, beside a panel with an address box, a Find it button and an I'm standing on it button.",
    dim: false,
    caption: "The instant ballpark, ready for an address.",
  },
  "/images/tools/ranch-map.jpg": {
    alt: "A finished ranch map of Fox Canyon in Jeff Davis County: shaded terrain, contour lines, creeks, roads and brush cover, with a legend and scale bar.",
    dim: false,
    caption: "A ranch map made with the tool, for the 180-acre Fox Canyon sample.",
  },
  "/images/tools/brush-roi.png": {
    alt: "Screenshot of the brush return calculator: settings for the place on the left, and what they give back in grazing value, grass, cattle, water and fire on the right.",
    dim: false,
    caption: "The calculator with example settings on the left and what they give back on the right.",
  },
};

/** The note for a content image path, or a fallback alt (the item's plain title) when there is none. */
export function noteFor(src: string | undefined, fallbackAlt: string): ImageNote {
  if (!src) return { alt: fallbackAlt };
  return imageNotes[src] ?? { alt: fallbackAlt };
}
