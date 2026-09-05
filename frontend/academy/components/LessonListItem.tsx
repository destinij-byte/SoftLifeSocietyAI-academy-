import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii, spacing } from "../theme";
import type { LessonPublic } from "../types";

interface LessonListItemProps {
  lesson: LessonPublic;
  isCompleted: boolean;
  isCurrent: boolean;
  onPress: () => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function LessonListItem({ lesson, isCompleted, isCurrent, onPress }: LessonListItemProps) {
  return (
    <Pressable
      style={[styles.row, isCurrent ? styles.currentRow : null]}
      onPress={onPress}
    >
      <View style={styles.textGroup}>
        <Text style={[styles.title, isCompleted ? styles.completedTitle : null]}>
          {lesson.order}. {lesson.title}
        </Text>
        <Text style={styles.duration}>{formatDuration(lesson.duration_seconds)}</Text>
      </View>
      {isCompleted ? <Text style={styles.checkmark}>✓</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.ivory,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  currentRow: {
    backgroundColor: colors.blush,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  completedTitle: {
    color: colors.gold,
    fontFamily: fonts.bodyMedium,
  },
  duration: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 2,
  },
  checkmark: {
    color: colors.gold,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    marginLeft: spacing.sm,
  },
});
