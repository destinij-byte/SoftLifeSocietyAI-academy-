/**
 * Soft Life Society / Soft Life Academy brand palette.
 *
 * Pulled 1:1 from the design-canvas prototype (AcademyScreen.dc.html / AdminScreen.dc.html)
 * and kept in sync with the PowerPoint deck + PDF workbook palette in the content pipeline
 * (content-pipeline/scripts/build_deck.js `C` object). If the brand palette ever changes,
 * update it in both places.
 */
export const colors = {
  // Core brand
  ink: '#2B2521', // primary text / dark surfaces
  ivory: '#FBF7F2', // primary light background
  cream: '#F5EDE4', // secondary light surface (cards, rows)
  offWhite: '#FFFCF8', // tertiary surface, slightly whiter than cream
  blush: '#F0C9C9', // progress fill, avatar bg, small accents
  gold: '#C9A15E', // primary CTA / accent
  goldHoverLight: '#B78F4C', // CTA hover on light backgrounds
  goldHoverDark: '#D8B375', // CTA hover on dark backgrounds
  rose: '#D9A6A6', // secondary accent (chips, current-row highlight family)

  // Text on light backgrounds
  textMutedLabel: '#A2917F', // kicker / eyebrow labels, uppercase small text
  textSecondary: '#7A6A5C', // body copy, secondary descriptions
  textTertiary: '#8A7A6C', // meta text, timestamps, captions
  textGoldDark: '#8A6A25', // price tags, gold-on-tint text

  // Rose / dusty pink family (draft status, certificate banner)
  roseBg: 'rgba(217,166,166,0.24)',
  roseBgStrong: 'rgba(217,166,166,0.28)',
  roseText: '#8B5F5F',

  // Gold tint family (published status, price pills)
  goldTint: 'rgba(201,161,94,0.14)',
  goldTintStrong: 'rgba(201,161,94,0.16)',
  goldBorderTint: 'rgba(201,161,94,0.4)',

  // Neutral tint family (archived status, dividers)
  neutralTint: 'rgba(43,37,33,0.08)',
  hairline: 'rgba(43,37,33,0.08)',
  hairlineStrong: 'rgba(43,37,33,0.12)',
  hairlineBorder: 'rgba(43,37,33,0.14)',
  hairlineBorderStrong: 'rgba(43,37,33,0.16)',
  hairlineDashed: 'rgba(43,37,33,0.22)',

  // Player / dark screens (ink background)
  onDarkPrimary: '#FBF7F2',
  onDarkSecondary: 'rgba(251,247,242,0.72)',
  onDarkMuted: 'rgba(251,247,242,0.55)',
  onDarkFaint: 'rgba(251,247,242,0.45)',
  onDarkHairline: 'rgba(251,247,242,0.18)',
  onDarkHairlineStrong: 'rgba(251,247,242,0.28)',
  onDarkSurface: 'rgba(251,247,242,0.07)',
  onDarkSurfaceStrong: 'rgba(251,247,242,0.12)',
  onDarkRose: '#F0C9C9',

  // Placeholder art (repeating-gradient stand-ins become flat tints on RN)
  placeholderTintA: '#E7DACB',
  placeholderTintB: '#F1E7DB',
  placeholderTintC: '#EFE5D9',
  placeholderTintD: '#F7F0E7',
  placeholderTintDarkA: '#3E362F',
  placeholderTintDarkB: '#372F29',

  // Avatar
  avatarBg: '#F0C9C9',
  avatarText: '#6B4A4A',

  // Player row highlight states (learner course/lesson list)
  rowCurrentBg: '#F7DEDE',
  rowDoneBg: '#F7F1E9',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Font family names as exported by @expo-google-fonts/cormorant-garamond and
 * @expo-google-fonts/dm-sans (loaded in App.tsx via `useFonts`). Matches the weights
 * pulled from Google Fonts in the original prototype's <helmet> <link> tag:
 * Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400 and DM+Sans:wght@400;500;700.
 *
 * Until fonts finish loading, App.tsx keeps rendering null, so screens can assume
 * these families are always available.
 */
export const fonts = {
  serif: 'CormorantGaramond_600SemiBold', // display headings ("Academy", course titles)
  serifRegular: 'CormorantGaramond_400Regular', // body-weight serif (lesson titles in lists)
  serifMedium: 'CormorantGaramond_500Medium',
  serifItalic: 'CormorantGaramond_400Regular_Italic', // opening-line / quote accents
  sans: 'DMSans_400Regular', // body copy
  sansMedium: 'DMSans_500Medium', // buttons, labels
  sansBold: 'DMSans_700Bold', // emphasis
  mono: 'ui-monospace', // module/lesson numeral chips — falls back to system mono on Android
} as const;

export const statusStyle: Record<
  'published' | 'draft' | 'archived',
  { bg: string; color: string }
> = {
  published: { bg: colors.goldTintStrong, color: colors.textGoldDark },
  draft: { bg: colors.roseBg, color: colors.roseText },
  archived: { bg: colors.neutralTint, color: colors.textTertiary },
};

export const tierLabel: Record<'single' | 'bundle' | 'full_access', string> = {
  single: 'Single course',
  bundle: 'Bundle',
  full_access: 'Full access',
};
