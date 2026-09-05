import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { academyApi } from "../api";
import { RecommendedNextCard } from "../components/RecommendedNextCard";
import type { AcademyStackParamList } from "../navigation/AcademyNavigator";
import { colors, fonts, spacing } from "../theme";
import type { CourseSummary } from "../types";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "CourseComplete">;
type Route = { params: AcademyStackParamList["CourseComplete"] };

export function CourseCompleteScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>() as Route;
  const { recommendedNextCourseId } = route.params;

  const [recommended, setRecommended] = useState<CourseSummary | null>(null);

  useEffect(() => {
    if (!recommendedNextCourseId) return;
    academyApi
      .listCourses()
      .then((courses) => courses.find((c) => c.id === recommendedNextCourseId) ?? null)
      .then(setRecommended);
  }, [recommendedNextCourseId]);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Course Complete</Text>
      </View>
      <Text style={styles.headline}>You did it.</Text>
      <Text style={styles.subhead}>
        You've finished every lesson. Keep the momentum going.
      </Text>

      {recommended ? (
        <View style={styles.recommendedBlock}>
          <RecommendedNextCard
            course={recommended}
            onPress={() => navigation.navigate("CourseDetail", { slug: recommended.slug })}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
    padding: spacing.lg,
    alignItems: "center",
    paddingTop: spacing.xl * 2,
  },
  badge: {
    backgroundColor: colors.rose,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.ink,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  subhead: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    opacity: 0.75,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  recommendedBlock: {
    width: "100%",
  },
});
