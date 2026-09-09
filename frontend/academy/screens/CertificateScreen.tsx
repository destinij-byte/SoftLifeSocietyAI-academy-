import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

import { academyApi } from "../api";
import { getCurrentUserProfile } from "../../auth/session";
import { RecommendedNextCard } from "../components/RecommendedNextCard";
import type { AcademyStackParamList } from "../navigation/AcademyNavigator";
import { colors, fonts, radii, spacing, textTones } from "../theme";
import type { CourseSummary } from "../types";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "Certificate">;
type Route = { params: AcademyStackParamList["Certificate"] };

function monthYear(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function CertificateScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>() as Route;
  const { courseId, recommendedNextCourseId } = route.params;

  const [courseTitle, setCourseTitle] = useState("");
  const [totalLessons, setTotalLessons] = useState<number | null>(null);
  const [learnerName, setLearnerName] = useState("You");
  const [recommended, setRecommended] = useState<CourseSummary | null>(null);

  useEffect(() => {
    academyApi.myCourses().then((courses) => {
      const course = courses.find((c) => c.id === courseId);
      if (course) setCourseTitle(course.title);
    });
    academyApi.getProgress(courseId).then((progress) => {
      setTotalLessons(progress.lessons_completed.length);
    });
    getCurrentUserProfile()
      .then((profile) => setLearnerName(profile?.name || "You"))
      .catch(() => setLearnerName("You"));
    if (recommendedNextCourseId) {
      academyApi
        .listCourses()
        .then((courses) => courses.find((c) => c.id === recommendedNextCourseId) ?? null)
        .then(setRecommended);
    }
  }, [courseId, recommendedNextCourseId]);

  async function shareCertificate() {
    try {
      await Share.share({
        message: `I just completed ${courseTitle || "a course"} on Soft Life Academy.`,
      });
    } catch {
      // Share sheet dismissed or unavailable — nothing to recover from here.
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Certificate Earned</Text>
        </View>
        <Text style={styles.headline}>Course Complete</Text>
        <Text style={styles.subhead}>
          You finished all {totalLessons ?? ""} lessons of {courseTitle || "this course"}. Now go
          and launch it.
        </Text>
      </View>

      <View style={styles.certificateCard}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.certifiesLabel}>Soft Life Academy Certifies</Text>
        <Text style={styles.learnerName}>{learnerName}</Text>
        <Text style={styles.certificateMeta}>
          {courseTitle} · {monthYear()}
        </Text>
        <View style={styles.certificateActions}>
          <Pressable style={styles.saveButton} onPress={shareCertificate}>
            <Text style={styles.saveButtonLabel}>Save certificate</Text>
          </Pressable>
          <Pressable style={styles.shareButton} onPress={shareCertificate}>
            <Text style={styles.shareButtonLabel}>Share</Text>
          </Pressable>
        </View>
      </View>

      {recommended ? (
        <View style={styles.recommendedSection}>
          <Text style={styles.eyebrow}>Recommended Next</Text>
          <RecommendedNextCard
            course={recommended}
            onPress={() => navigation.navigate("CourseDetail", { slug: recommended.slug })}
          />
        </View>
      ) : null}

      <Pressable
        style={styles.backLink}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
      >
        <Text style={styles.backLinkLabel}>Back to Academy</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    alignItems: "center",
    gap: spacing.lg,
  },
  intro: {
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: "rgba(217,166,166,0.28)",
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: "#8B5F5F",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.ink,
  },
  subhead: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: textTones.secondary,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 19,
  },
  certificateCard: {
    width: "100%",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: "rgba(201,161,94,0.4)",
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  checkCircle: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ivory,
  },
  certifiesLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: textTones.label,
  },
  learnerName: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
  },
  certificateMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: textTones.secondary,
  },
  certificateActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.pill,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
  },
  saveButtonLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ivory,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: "rgba(43,37,33,0.18)",
    borderRadius: radii.pill,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
  },
  shareButtonLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  recommendedSection: {
    width: "100%",
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: textTones.label,
  },
  backLink: {
    marginTop: spacing.sm,
  },
  backLinkLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 0.5,
    color: textTones.secondary,
  },
});
