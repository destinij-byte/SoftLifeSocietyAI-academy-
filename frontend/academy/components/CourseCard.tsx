import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii, spacing } from "../theme";
import type { CourseSummary, MyCourseSummary } from "../types";
import { ProgressBar } from "./ProgressBar";

interface CourseCardProps {
  course: CourseSummary | MyCourseSummary;
  onPress: () => void;
}

function isEnrolled(course: CourseSummary | MyCourseSummary): course is MyCourseSummary {
  return "percent_complete" in course;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  const enrolled = isEnrolled(course);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {course.thumbnail_url ? (
        <Image source={{ uri: course.thumbnail_url }} style={styles.thumbnail} />
      ) : null}
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {course.description}
      </Text>

      {enrolled ? (
        <View style={styles.progressRow}>
          <ProgressBar percentComplete={course.percent_complete} />
          <Text style={styles.progressLabel}>{course.percent_complete}%</Text>
        </View>
      ) : (
        <Text style={styles.price}>${course.price.toFixed(0)}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  thumbnail: {
    width: "100%",
    height: 140,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
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
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.gold,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
});
