export type ColorScheme = "light" | "dark";

export const fontFamilies = {
  display: "Newsreader_400Regular",
  displayItalic: "Newsreader_400Regular_Italic",
  displaySemiBold: "Newsreader_600SemiBold",
  body: "Manrope_400Regular",
  bodyMedium: "Manrope_500Medium",
  bodyBold: "Manrope_700Bold",
  label: "Manrope_500Medium",
} as const;

const lightColors = {
  backdrop: "rgba(27, 28, 25, 0.45)",
  background: "#fbf9f4",
  surface: "#fbf9f4",
  surfaceDim: "#dbdad5",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f5f3ee",
  surfaceContainer: "#f0eee9",
  surfaceContainerHigh: "#eae8e3",
  surfaceContainerHighest: "#e4e2dd",
  surfaceVariant: "#e4e2dd",
  onBackground: "#1b1c19",
  onSurface: "#1b1c19",
  onSurfaceVariant: "#54433c",
  primary: "#823b18",
  onPrimary: "#ffffff",
  primaryContainer: "#a0522d",
  onPrimaryContainer: "#ffe1d6",
  secondary: "#904d00",
  onSecondary: "#ffffff",
  outline: "#87736b",
  outlineVariant: "#dac1b8",
  error: "#ba1a1a",
  onError: "#ffffff",
  destructive: "#ba1a1a",
  destructiveForeground: "#ffffff",
  inverseSurface: "#30312e",
  inverseOnSurface: "#f2f1ec",
  glass: "rgba(255, 255, 255, 0.9)",
  glassBorder: "rgba(255, 255, 255, 0.2)",
  shadow: "rgba(27, 28, 25, 0.06)",
  primaryShadow: "rgba(130, 59, 24, 0.15)",
} as const;

const darkColors = {
  backdrop: "rgba(0, 0, 0, 0.6)",
  background: "#1b1c19",
  surface: "#1b1c19",
  surfaceDim: "#131412",
  surfaceContainerLowest: "#2a2b26",
  surfaceContainerLow: "#2a2b26",
  surfaceContainer: "#30312e",
  surfaceContainerHigh: "#3e3f3a",
  surfaceContainerHighest: "#474845",
  surfaceVariant: "#3e3f3a",
  onBackground: "#fbf9f4",
  onSurface: "#fbf9f4",
  onSurfaceVariant: "#cac8c3",
  primary: "#a0522d",
  onPrimary: "#ffffff",
  primaryContainer: "#823b18",
  onPrimaryContainer: "#ffdbcd",
  secondary: "#ffb77c",
  onSecondary: "#2e1500",
  outline: "#87736b",
  outlineVariant: "#54433c",
  error: "#ffb4ab",
  onError: "#690005",
  destructive: "#ffb4ab",
  destructiveForeground: "#690005",
  inverseSurface: "#f2f1ec",
  inverseOnSurface: "#30312e",
  glass: "rgba(42, 43, 38, 0.9)",
  glassBorder: "rgba(255, 255, 255, 0.1)",
  shadow: "rgba(0, 0, 0, 0.2)",
  primaryShadow: "rgba(160, 82, 45, 0.25)",
} as const;

export type ThemeColors = typeof lightColors;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 48,
  "5xl": 64,
  "6xl": 80,
} as const;

export const typography = {
  displayLg: { fontSize: 48, lineHeight: 52 },
  displayMd: { fontSize: 36, lineHeight: 40 },
  displaySm: { fontSize: 28, lineHeight: 32 },
  titleLg: { fontSize: 24, lineHeight: 28 },
  title: { fontSize: 20, lineHeight: 24 },
  body: { fontSize: 16, lineHeight: 24 },
  bodySm: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 10, lineHeight: 14, letterSpacing: 1.6 },
  labelMd: { fontSize: 12, lineHeight: 16, letterSpacing: 1.2 },
} as const;

export const organicRadius = {
  blob1: { borderTopLeftRadius: "60%", borderTopRightRadius: "40%", borderBottomRightRadius: "30%", borderBottomLeftRadius: "70%" },
  blob2: { borderTopLeftRadius: "30%", borderTopRightRadius: "60%", borderBottomRightRadius: "70%", borderBottomLeftRadius: "40%" },
  blob3: { borderTopLeftRadius: "40%", borderTopRightRadius: "60%", borderBottomRightRadius: "40%", borderBottomLeftRadius: "60%" },
} as const;

export function getTheme(scheme: ColorScheme) {
  return {
    colors: scheme === "dark" ? darkColors : lightColors,
    radius,
    spacing,
    typography,
    fontFamilies,
    scheme,
  };
}

export type AppTheme = ReturnType<typeof getTheme>;

/** @deprecated Use getTheme() via useTheme() instead */
export const theme = {
  colors: {
    ...lightColors,
    text: lightColors.onSurface,
    textSecondary: lightColors.onSurfaceVariant,
    textTertiary: lightColors.onSurfaceVariant,
    textInverse: lightColors.onPrimary,
    surfaceElevated: lightColors.surfaceContainerLowest,
    border: lightColors.outlineVariant,
    borderStrong: lightColors.outline,
    primaryForeground: lightColors.onPrimary,
    muted: lightColors.surfaceContainerLow,
    mutedForeground: lightColors.onSurfaceVariant,
  },
  radius,
  spacing,
  typography: {
    titleLarge: typography.titleLg,
    title: typography.title,
    body: typography.body,
    bodyMedium: { ...typography.body, fontWeight: "500" as const },
    caption: typography.bodySm,
    captionMedium: { ...typography.bodySm, fontWeight: "500" as const },
    label: typography.labelMd,
  },
} as const;
