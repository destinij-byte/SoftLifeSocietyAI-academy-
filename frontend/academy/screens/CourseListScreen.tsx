import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { academyApi } from "../api";
import { CourseCard } from "../components/CourseCard";
import type { AcademyStackParamList } from "../navigation/AcademyNavigator";
import { colors, fonts, spacing } from "../theme";
import type { CourseSummary, MyCourseSummary } from "../types";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "CourseList">;

export function CourseListScreen() {
  const navigation = useNavigation<Nav>();
  const [myCourses, setMyCourses] = useState<MyCourseSummary[]>([]);
  const [browseCourses, setBrowseCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, published] = await Promise.all([
        academyApi.myCourses(),
        academyApi.listCourses(),
      ]);
      const enrolledIds = new Set(mine.map((c) => c.id));
      setMyCourses(mine);
      setBrowseCourses(published.filter((c) => !enrolledIds.has(c.id)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const sections = [
    { key: "mine", title: "My Courses", data: myCourses },
    { key: "browse", title: "More From the Academy", data: browseCourses },
  ].filter((section) => section.data.length > 0);

  return (
    <FlatList
      style={styles.container}
      data={sections}
      keyExtractor={(s) => s.key}
      renderItem={({ item }) => (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          {item.data.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => navigation.navigate("CourseDetail", { slug: course.slug })}
            />
          ))}
        </View>
      )}
    />
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
});
