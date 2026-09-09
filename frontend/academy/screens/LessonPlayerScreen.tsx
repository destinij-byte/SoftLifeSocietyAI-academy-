import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { academyApi } from "../api";
import type { AcademyStackParamList } from "../navigation/AcademyNavigator";
import { colors, fonts, radii, spacing } from "../theme";
import type { LessonDetail } from "../types";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "LessonPlayer">;
type Route = { params: AcademyStackParamList["LessonPlayer"] };

export function LessonPlayerScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>() as Route;
  const { lessonId, courseId } = route.params;

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [completing, setCompleting] = useState(false);
  const hasAutoCompletedRef = useRef(false);

  useEffect(() => {
    hasAutoCompletedRef.current = false;
    academyApi.getLesson(lessonId).then(setLesson);
  }, [lessonId]);

  async function handleComplete() {
    if (hasAutoCompletedRef.current) return;
    hasAutoCompletedRef.current = true;
    setCompleting(true);
    try {
      const result = await academyApi.completeLesson(lessonId);
      if (result.course_completed) {
        navigation.replace("Certificate", {
          courseId,
          recommendedNextCourseId: result.recommended_next_course_id,
        });
      } else if (result.next_lesson_id) {
        navigation.replace("LessonPlayer", { lessonId: result.next_lesson_id, courseId });
      } else {
        navigation.goBack();
      }
    } finally {
      setCompleting(false);
    }
  }

  if (!lesson) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.ivory} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onPlaybackStatusUpdate={(status) => {
          if ("didJustFinish" in status && status.didJustFinish) {
            handleComplete();
          }
        }}
        source={{ uri: lesson.video_url }}
      />

      <Text style={styles.lessonTitle}>{lesson.title}</Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.completeButton}
          onPress={handleComplete}
          disabled={completing}
        >
          {completing ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Text style={styles.completeLabel}>Mark Complete & Continue</Text>
          )}
        </Pressable>
        <Pressable
          style={styles.workbookIconButton}
          onPress={() => navigation.navigate("Workbook", { courseId })}
        >
          <Text style={styles.workbookIconLabel}>↓</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
    justifyContent: "space-between",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.ink,
  },
  lessonTitle: {
    fontFamily: fonts.body,
    color: colors.ivory,
    fontSize: 16,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    margin: spacing.lg,
  },
  completeButton: {
    flex: 1,
    backgroundColor: colors.ivory,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  completeLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 16,
  },
  workbookIconButton: {
    width: 52,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(251,247,242,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  workbookIconLabel: {
    fontSize: 17,
    color: colors.blush,
  },
});
