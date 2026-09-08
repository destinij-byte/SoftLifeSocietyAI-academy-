import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { colors, fonts } from '../theme/colors';

/** Small uppercase letter-spaced eyebrow label — used constantly across both prototypes. */
export function Kicker({
  children,
  color = colors.textMutedLabel,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  style?: TextStyle;
}) {
  return <Text style={[styles.kicker, { color }, style]}>{children}</Text>;
}

/** Serif display heading (Cormorant Garamond in the original prototype). */
export function Display({
  children,
  size = 32,
  color = colors.ink,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: TextStyle;
}) {
  return <Text style={[styles.display, { fontSize: size, color, lineHeight: size * 1.1 }, style]}>{children}</Text>;
}

/** Numbered monospace chip label (module/lesson numerals: "01", "1.1"). */
export function NumChip({ children, color = colors.gold }: { children: React.ReactNode; color?: string }) {
  return <Text style={[styles.numChip, { color }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  display: {
    fontFamily: fonts.serif,
  },
  numChip: {
    fontFamily: fonts.mono,
    fontSize: 10,
  },
});
