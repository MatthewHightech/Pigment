/**
 * Converts a hex color to approximate paint-mix percentages for
 * red, yellow, blue, white, and black. Percentages are 0–100 and sum to 100.
 * Aligns with db colors fields: rPercentage, yPercentage, bPercentage, wPercentage, blkPercentage.
 */

export interface RybMix {
  red: number;
  yellow: number;
  blue: number;
  white: number;
  black: number;
}

const MIN_PERCENT = 0.5; // minimum slice to show in UI (avoids tiny slivers)

/**
 * Parse hex to RGB 0–1. Handles #RGB and #RRGGBB.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, "");
  if (cleaned.length !== 3 && cleaned.length !== 6) return null;
  let r: number, g: number, b: number;
  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16) / 255;
    g = parseInt(cleaned[1] + cleaned[1], 16) / 255;
    b = parseInt(cleaned[2] + cleaned[2], 16) / 255;
  } else {
    r = parseInt(cleaned.slice(0, 2), 16) / 255;
    g = parseInt(cleaned.slice(2, 4), 16) / 255;
    b = parseInt(cleaned.slice(4, 6), 16) / 255;
  }
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

/**
 * RGB 0–1 to HSV: h in [0, 360), s and v in [0, 1].
 */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

/**
 * Map RGB hue (0–360) to RYB weights (red, yellow, blue) that sum to 1.
 * Red ≈ 0°, Yellow ≈ 60°, Green ≈ 120° (Y+B), Cyan ≈ 180° (B), Blue ≈ 240°, Magenta ≈ 300° (R+B).
 */
function hueToRybWeights(h: number): { r: number; y: number; b: number } {
  const h6 = (h / 60) % 6; // 0..6
  if (h6 <= 1) return { r: 1 - h6, y: h6, b: 0 };
  if (h6 <= 2) return { r: 0, y: 2 - h6, b: h6 - 1 };
  if (h6 <= 4) return { r: 0, y: 0, b: 1 };
  if (h6 <= 5) return { r: h6 - 4, y: 0, b: 5 - h6 };
  return { r: 1, y: 0, b: 6 - h6 };
}

/**
 * Convert hex to paint-mix percentages (0–100) for red, yellow, blue, white, black.
 * White and black are derived from lightness/darkness; the rest from hue and saturation.
 */
export function hexToRybMix(hex: string): RybMix | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const { r, g, b } = rgb;
  const { h, s, v } = rgbToHsv(r, g, b);

  // Darkness: how much black to add
  const black = 1 - v;
  // Lightness / gray: how much white is "in" the color
  const white = (1 - s) * v;
  // Chroma portion to split into R, Y, B
  const chroma = v * s;
  const { r: rw, y: yw, b: bw } = hueToRybWeights(h);
  const red = chroma * rw;
  const yellow = chroma * yw;
  const blue = chroma * bw;

  const total = red + yellow + blue + white + black;
  if (total <= 0) {
    return { red: 0, yellow: 0, blue: 0, white: 100, black: 0 };
  }

  const scale = 100 / total;
  const mix: RybMix = {
    red: Math.max(0, red * scale),
    yellow: Math.max(0, yellow * scale),
    blue: Math.max(0, blue * scale),
    white: Math.max(0, white * scale),
    black: Math.max(0, black * scale),
  };

  // Normalize to sum to 100 (float rounding)
  const sum = mix.red + mix.yellow + mix.blue + mix.white + mix.black;
  if (sum !== 100) {
    const diff = 100 - sum;
    if (mix.red >= mix.yellow && mix.red >= mix.blue && mix.red >= mix.white && mix.red >= mix.black) mix.red += diff;
    else if (mix.yellow >= mix.blue && mix.yellow >= mix.white && mix.yellow >= mix.black) mix.yellow += diff;
    else if (mix.blue >= mix.white && mix.blue >= mix.black) mix.blue += diff;
    else if (mix.white >= mix.black) mix.white += diff;
    else mix.black += diff;
  }

  return mix;
}

/** Display labels for each component */
export const RYB_LABELS: Record<keyof RybMix, string> = {
  red: "Red",
  yellow: "Yellow",
  blue: "Blue",
  white: "White",
  black: "Black",
};

/** Hex colors for each component (for swatches and donut) */
export const RYB_HEX: Record<keyof RybMix, string> = {
  red: "#c0392b",
  yellow: "#f1c40f",
  blue: "#2980b9",
  white: "#ecf0f1",
  black: "#2c3e50",
};

/**
 * Returns segments for the donut: only components above MIN_PERCENT, with normalized angles.
 * Each item: { key, label, hex, percent, startAngle, sweepAngle } in degrees.
 */
export function getRybSegments(mix: RybMix): Array<{ key: keyof RybMix; label: string; hex: string; percent: number; startAngle: number; sweepAngle: number }> {
  const entries = (["red", "yellow", "blue", "white", "black"] as const).map((key) => ({
    key,
    label: RYB_LABELS[key],
    hex: RYB_HEX[key],
    percent: mix[key],
  }));
  const visible = entries.filter((e) => e.percent >= MIN_PERCENT);
  const total = visible.reduce((s, e) => s + e.percent, 0);
  if (total <= 0) return [];
  let start = 0;
  return visible.map((e) => {
    const sweep = (e.percent / total) * 360;
    const seg = { ...e, startAngle: start, sweepAngle: sweep };
    start += sweep;
    return seg;
  });
}
