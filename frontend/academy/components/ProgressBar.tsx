import React from "react";
import { StyleSheet, View } from "react-native";

import { colors, radii } from "../theme";

interface ProgressBarProps {
  percentComplete: number;
  trackColor?: string;
  fillColor?: string;
}

export function ProgressBar({
  percentComplete,
  trackColor = colors.blush,
  fillColor = colors.gold,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentComplete));

  return (
    <View style={[styles.track, { backgroundColor: trackColor }]}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radii.pill,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill,
  },
});
