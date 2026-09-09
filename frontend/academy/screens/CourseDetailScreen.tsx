import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { academyApi } from "../api";
import { LessonListItem } from "../components/LessonListItem";
import { ProgressBar } from "../components/ProgressBar";
import type { AcademyStackParamList } from "../navigation/AcademyNavigator";
import { colors, fonts, radii, spacing } from "../theme";
import type { CourseDetail, ProgressResponse } from "../types";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "CourseDetail">;
type Route = { params: AcademyStackParamList["CourseDetail"] };

export function CourseDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>() as Route;
  const { slug } = route.params;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await academyApi.getCourseDetail(slug);
      setCourse(detail);
      try {
        const prog = await academyApi.getProgress(detail.id);
        setProgress(prog);
        setEnrolled(true);
      } catch {
        setEnrolled(false);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEnroll() {
    if (!course) return;
    setEnrolling(true);
    try {
      const { checkout_url } = await academyApi.checkout(course.id);
      await WebBrowser.openBrowserAsync(checkout_url);
      await load();
    } finally {
      setEnrolling(false);
    }
  }

  if (loading || !course) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const completedIds = new Set(progress?.lessons_completed ?? []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.description}>{course.description}</Text>

      {enrolled && progress ? (
        <View style={styles.progressBlock}>
          <ProgressBar percentComplete={progress.percent_complete} />
          <Text style={styles.progressLabel}>{progress.percent_complete}% complete</Text>
        </View>
      ) : (
        <Pressable style={styles.enrollButton} onPress={handleEnroll} disabled={enrolling}>
          {enrolling ? (
            <ActivityIndicator color={colors.ivory} />
          ) : (
            <Text style={styles.enrollLabel}>Enroll — ${course.price.toFixed(0)}</Text>
          )}
        </Pressable>
      )}

      {course.modules.map((module) => (
        <View key={module.id} style={styles.moduleBlock}>
          <Text style={styles.moduleTitle}>{module.title}</Text>
          {module.lessons.map((lesson) => (
            <LessonListItem
              key={lesson.id}
              lesson={lesson}
              isCompleted={completedIds.has(lesson.id)}
              isCurrent={progress?.current_lesson_id === lesson.id}
              onPress={() => {
                if (!enrolled) return;
                navigation.navigate("LessonPlayer", { lessonId: lesson.id, courseId: course.id });
              }}
            />
          ))}
        </View>
      ))}

      {enrolled ? (
        <View style={styles.workbookBlock}>
          <Pressable
            style={styles.workbookButton}
            onPress={() => navigation.navigate("Workbook", { courseId: course.id })}
          >
            <Text style={styles.workbookButtonLabel}>Download the Workbook</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ivory,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    opacity: 0.8,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  progressBlock: {
    marginBottom: spacing.lg,
  },
  progressLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  enrollButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  enrollLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.ivory,
    fontSize: 16,
  },
  moduleBlock: {
    marginBottom: spacing.lg,
  },
  moduleTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  workbookBlock: {
    marginBottom: spacing.xl,
  },
  workbookButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  workbookButtonLabel: {
    fontFamily: fonts.bodyMedium,
    color: colors.ivory,
    fontSize: 14,
  },
});
