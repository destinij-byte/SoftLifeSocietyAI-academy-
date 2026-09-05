import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii, spacing } from "../theme";
import type { CourseDetail, CourseSummary } from "../types";

interface RecommendedNextCardProps {
  course: CourseSummary | CourseDetail;
  onPress: () => void;
}

export function RecommendedNextCard({ course, onPress }: RecommendedNextCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Recommended Next</Text>
      </View>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {course.description}
      </Text>
      <Text style={styles.cta}>Continue your journey →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "flex-start",
  },
  badge: {
    backgroundColor: colors.rose,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.ink,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.75,
    marginBottom: spacing.sm,
  },
  cta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.gold,
  },
});
