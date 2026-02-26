/**
 * Design tokens for Pigment — single source for colors, spacing, and radius.
 * Use these in StyleSheet when you need JS values (e.g. Animated, dynamic styles).
 * Prefer Tailwind classes (NativeWind) in components; they are synced with tailwind.config.js.
 */
export const theme = {
  colors: {
    backdrop: "rgba(0,0,0,0.45)",
    background: "#f8f6f3",
    surface: "#fdfcfa",
    surfaceElevated: "#ffffff",
    surfaceOverlay: "#1c1917",
    surfaceOverlayMuted: "#292524",
    overlayButton: "#44403c",
    text: "#1c1917",
    textSecondary: "#57534e",
    textTertiary: "#78716c",
    textInverse: "#fafaf9",
    border: "#e7e5e4",
    borderStrong: "#d6d3d1",
    primary: "#b45309",
    primaryForeground: "#ffffff",
    destructive: "#b91c1c",
    destructiveForeground: "#ffffff",
    muted: "#f5f3f0",
    mutedForeground: "#78716c",
  },
  radius: {
    sm: 10,
    DEFAULT: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
  },
  typography: {
    titleLarge: { fontSize: 22, fontWeight: "600" as const },
    title: { fontSize: 18, fontWeight: "600" as const },
    body: { fontSize: 16, fontWeight: "400" as const },
    bodyMedium: { fontSize: 16, fontWeight: "500" as const },
    caption: { fontSize: 14, fontWeight: "400" as const },
    captionMedium: { fontSize: 14, fontWeight: "500" as const },
    label: { fontSize: 12, fontWeight: "500" as const },
  },
} as const;

export type Theme = typeof theme;
