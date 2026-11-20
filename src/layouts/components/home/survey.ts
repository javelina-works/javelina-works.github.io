// The homepage's example survey: two crops of the real survey image (design/assets/images/survey-detections.jpg, the
// same photo as src/assets/images/services/brush-targeting/plants-found-boxes.png), cut so the photo's baked-in caption
// ("55 woody plants found …") and scale bar are not shown. Every marker sits on one of the photo's own detection boxes,
// and every count on the page is a count of these markers, nothing else (no invented coverage or results).
//
// Crops, in the 2000x1080 PNG's pixels (x, y, width, height):
//   images/survey-hero.jpg  50, 75, 1100, 688   (the left of the photo)
//   images/survey-band.jpg  1163, 0, 837, 650   (the top-right corner; every boxed plant in it is marked)
// x and y below are percent of the crop, from the box centres found by colour (scratchpad work/home/boxes.cjs).
import heroImage from "./images/survey-hero.jpg";
import bandImage from "./images/survey-band.jpg";

export interface Plant {
  id: number;
  x: number;
  y: number;
  status: "treat" | "keep";
}

export const hero = {
  image: heroImage,
  ratio: "1100 / 688",
  plants: [
    { id: 1, x: 30.45, y: 23.8, status: "keep" },
    { id: 2, x: 11.48, y: 34.16, status: "keep" },
    { id: 3, x: 72.39, y: 47.6, status: "keep" },
    { id: 4, x: 47.84, y: 50.51, status: "treat" },
    { id: 5, x: 21.48, y: 60.32, status: "treat" },
    { id: 6, x: 18.52, y: 71.95, status: "keep" },
    { id: 7, x: 59.2, y: 75.76, status: "treat" },
  ] as Plant[],
};

export const band = {
  image: bandImage,
  ratio: "837 / 650",
  plants: [
    { id: 1, x: 4.12, y: 18.85, status: "keep" },
    { id: 2, x: 90.14, y: 29.04, status: "treat" },
    { id: 3, x: 11.89, y: 40.58, status: "treat" },
    { id: 4, x: 35.48, y: 47.5, status: "treat" },
    { id: 5, x: 25.93, y: 69.23, status: "treat" },
    { id: 6, x: 61.02, y: 74.62, status: "keep" },
    { id: 7, x: 43.25, y: 76.54, status: "treat" },
    { id: 8, x: 49.52, y: 80.38, status: "treat" },
    { id: 9, x: 7.56, y: 89.23, status: "treat" },
    { id: 10, x: 82.63, y: 93.27, status: "keep" },
  ] as Plant[],
};

export const count = (plants: Plant[], status: Plant["status"]) => plants.filter((p) => p.status === status).length;

/** "1 plant", "7 plants" */
export const plants = (n: number) => `${n} ${n === 1 ? "plant" : "plants"}`;
