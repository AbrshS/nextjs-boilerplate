/**
 * FinCore dashboard chart palette — cobalt blue scale + light green for “good”.
 * Prefer these over one-off hex values so series stay coherent.
 */
export const chartBlue = {
  /** Brand cobalt */
  500: "#0068f9",
  /** Deep cobalt */
  700: "#024bb1",
  /** Mid */
  400: "#3d8bfd",
  /** Soft */
  300: "#6babff",
  /** Pale */
  200: "#9bc5ff",
  /** Whisper */
  100: "#c5dcff",
  /** Ink-leaning blue-gray for secondary series */
  mute: "#7a93b8",
} as const;

/** Light green — not dark forest / black-green */
export const chartGood = "#5ecf9a";
export const chartGoodDeep = "#3db88a";

/** Soft danger / warn for risk series only */
export const chartWarn = "#f0a04b";
export const chartBad = "#f07167";

/** Ordered blues for multi-series / category charts */
export const chartBlueScale = [
  chartBlue[500],
  chartBlue[400],
  chartBlue[700],
  chartBlue[300],
  chartBlue[200],
  chartBlue.mute,
] as const;

export function chartBlueAt(index: number): string {
  return chartBlueScale[index % chartBlueScale.length]!;
}
