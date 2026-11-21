// The ink fill of a system Slider (jw-slider): where the thumb sits, 0 to 1. A range with max ≤ min has no fill.
export const sliderFill = (value: number, min: number, max: number) =>
  max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;

// Set --jw-p on a range input from its current value.
export const setSliderFill = (input: HTMLInputElement) =>
  input.style.setProperty(
    "--jw-p",
    sliderFill(
      Number(input.value),
      Number(input.min) || 0,
      Number(input.max),
    ).toFixed(4),
  );
