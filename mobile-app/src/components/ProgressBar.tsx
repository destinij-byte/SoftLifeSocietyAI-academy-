import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export function ProgressBar({
  percent,
  trackColor = colors.placeholderTintA,
  fillColor = colors.blush,
  height = 6,
}: {
  percent: number;
  trackColor?: string;
  fillColor?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped}%`, backgroundColor: fillColor, borderRadius: height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
