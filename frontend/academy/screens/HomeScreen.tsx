import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { academyApi } from "../api";
import { getCurrentUserProfile } from "../../auth/session";
import { ProgressBar } from "../components/ProgressBar";
import type { AcademyStackParamList } from "../navigation/AcademyNavigator";
import { colors, fonts, radii, spacing, surfaces, textTones } from "../theme";
import type { CourseSummary, MyCourseSummary } from "../types";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "Home">;

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [continueCourse, setContinueCourse] = useState<MyCourseSummary | null>(null);
  const [currentLessonLabel, setCurrentLessonLabel] = useState<string>("Start the first lesson");
  const [catalog, setCatalog] = useState<CourseSummary[]>([]);
  const [avatarInitial, setAvatarInitial] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, published] = await Promise.all([
        academyApi.myCourses(),
        academyApi.listCourses(),
      ]);
      const enrolledIds = new Set(mine.map((c) => c.id));
      setCatalog(published.filter((c) => !enrolledIds.has(c.id)));

      const primary = mine[0] ?? null;
      setContinueCourse(primary);

      if (primary) {
        try {
          const detail = await academyApi.getCourseDetail(primary.slug);
          const flatModules = detail.modules;
          let found: string | null = null;
          for (const module of flatModules) {
            const lesson = module.lessons.find((l) => l.id === primary.current_lesson_id);
            if (lesson) {
              found = `Module ${module.order} · ${lesson.title}`;
              break;
            }
          }
          if (!found && flatModules[0]?.lessons[0]) {
            found = `Module ${flatModules[0].order} · ${flatModules[0].lessons[0].title}`;
          }
          setCurrentLessonLabel(found ?? "Start the first lesson");
        } catch {
          // Course detail lookup is a nice-to-have for the label only.
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    getCurrentUserProfile()
      .then((profile) => setAvatarInitial(profile?.name?.[0]?.toUpperCase() ?? ""))
      .catch(() => setAvatarInitial(""));
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greetingForNow()}</Text>
          <Text style={styles.title}>Academy</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
      </View>

      {continueCourse ? (
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Continue</Text>
          <Pressable
            style={styles.continueCard}
            onPress={() => navigation.navigate("CourseDetail", { slug: continueCourse.slug })}
          >
            <View style={styles.continueRow}>
              <View style={styles.thumb} />
              <View style={styles.continueText}>
                <Text style={styles.continueTitle}>{continueCourse.title}</Text>
                <Text style={styles.continueMeta}>{currentLessonLabel}</Text>
              </View>
            </View>
            <View style={styles.progressBlock}>
              <ProgressBar percentComplete={continueCourse.percent_complete} />
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>{continueCourse.percent_complete}% complete</Text>
              </View>
            </View>
          </Pressable>
        </View>
      ) : null}

      {catalog.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.eyebrow}>Yours to Unlock</Text>
          <View style={styles.catalogList}>
            {catalog.map((course) => (
              <Pressable
                key={course.id}
                style={styles.catalogRow}
                onPress={() => navigation.navigate("CourseDetail", { slug: course.slug })}
              >
                <View style={styles.catalogThumb} />
                <View style={styles.catalogText}>
                  <Text style={styles.catalogTitle}>{course.title}</Text>
                  <Text style={styles.catalogTagline} numberOfLines={1}>
                    {course.description}
                  </Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>${course.price.toFixed(0)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {continueCourse ? (
        <Pressable
          style={styles.workbookShortcut}
          onPress={() => navigation.navigate("Workbook", { courseId: continueCourse.id })}
        >
          <View>
            <Text style={styles.workbookShortcutTitle}>Your workbooks</Text>
            <Text style={styles.workbookShortcutMeta}>1 available to download</Text>
          </View>
          <Text style={styles.workbookShortcutArrow}>→</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ivory,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: textTones.label,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
    marginTop: spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.blush,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: "#6B4A4A",
  },
  section: {
    gap: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: textTones.label,
  },
  continueCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  continueRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.blush,
  },
  continueText: {
    flex: 1,
    gap: spacing.xs,
  },
  continueTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  continueMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: textTones.secondary,
  },
  progressBlock: {
    gap: spacing.xs,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: textTones.secondary,
  },
  catalogList: {
    gap: spacing.sm,
  },
  catalogRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: surfaces.raised,
    borderWidth: 1,
    borderColor: surfaces.hairline,
  },
  catalogThumb: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.cream,
  },
  catalogText: {
    flex: 1,
    gap: 2,
  },
  catalogTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.ink,
  },
  catalogTagline: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: textTones.secondary,
  },
  priceTag: {
    backgroundColor: "rgba(201,161,94,0.14)",
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
  },
  priceTagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: "#8A6A25",
  },
  workbookShortcut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: "auto" as const,
  },
  workbookShortcutTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ink,
  },
  workbookShortcutMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: textTones.secondary,
    marginTop: 2,
  },
  workbookShortcutArrow: {
    fontSize: 18,
    color: colors.gold,
  },
});
