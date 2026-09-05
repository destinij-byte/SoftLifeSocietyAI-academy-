import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { CourseCompleteScreen } from "../screens/CourseCompleteScreen";
import { CourseDetailScreen } from "../screens/CourseDetailScreen";
import { CourseListScreen } from "../screens/CourseListScreen";
import { LessonPlayerScreen } from "../screens/LessonPlayerScreen";
import { colors, fonts } from "../theme";

export type AcademyStackParamList = {
  CourseList: undefined;
  CourseDetail: { slug: string };
  LessonPlayer: { lessonId: string; courseId: string };
  CourseComplete: { courseId: string; recommendedNextCourseId: string | null };
};

const Stack = createNativeStackNavigator<AcademyStackParamList>();

/**
 * Mount this navigator as a screen (or nested stack) inside the existing
 * app's tab navigator, under the Academy tab.
 */
export function AcademyNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.ivory },
        headerTitleStyle: { fontFamily: fonts.display, color: colors.ink },
        headerTintColor: colors.ink,
        contentStyle: { backgroundColor: colors.ivory },
      }}
    >
      <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: "Academy" }} />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="LessonPlayer"
        component={LessonPlayerScreen}
        options={{ title: "", headerStyle: { backgroundColor: colors.ink } }}
      />
      <Stack.Screen
        name="CourseComplete"
        component={CourseCompleteScreen}
        options={{ title: "Course Complete", headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
