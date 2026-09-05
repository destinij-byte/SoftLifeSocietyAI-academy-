/**
 * Academy design tokens. These MUST mirror the existing Soft Life Society
 * theme file — replace the hex values below with the real tokens from that
 * theme (e.g. `src/theme/colors.ts`) rather than keeping this standalone
 * copy in sync by hand once Academy is merged into the main app.
 */

export const colors = {
  ivory: "#FBF7F2",
  cream: "#F5EDE4",
  blush: "#F0C9C9",
  gold: "#C9A15E",
  rose: "#D9A6A6",
  ink: "#2B2521",
} as const;

export const fonts = {
  display: "CormorantGaramond_600SemiBold",
  displayRegular: "CormorantGaramond_400Regular",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodyBold: "DMSans_700Bold",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

/** Per-screen token usage, so each screen pulls the right combination
 * instead of re-deriving it from the raw palette. */
export const academyTheme = {
  courseCard: {
    background: colors.cream,
    text: colors.ink,
    priceTag: colors.gold,
    progressTrack: colors.blush,
  },
  lessonList: {
    background: colors.ivory,
    text: colors.ink,
    completedText: colors.gold,
    currentHighlight: colors.blush,
  },
  videoPlayer: {
    background: colors.ink,
    text: colors.ivory,
    controls: colors.ivory,
  },
  workbookButton: {
    background: colors.gold,
    text: colors.ivory,
  },
  completionScreen: {
    badge: colors.rose,
    headlineFont: fonts.display,
  },
} as const;
