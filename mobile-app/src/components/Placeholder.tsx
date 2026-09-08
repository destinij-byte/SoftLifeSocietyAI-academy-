import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Stand-in for course/lesson artwork. The prototype used a diagonal
 * repeating-linear-gradient checker pattern (CSS-only, not available in RN) as a
 * placeholder for real thumbnails — this renders a simple two-tone tinted box instead.
 * Swap in a real <Image> once course art is uploaded.
 */
export function Placeholder({
  size,
  radius = 12,
  dark = false,
  style,
}: {
  size: number;
  radius?: number;
  dark?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: dark ? colors.placeholderTintDarkA : colors.placeholderTintC,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 0,
  },
});
