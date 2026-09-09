import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { CertificateScreen } from "../screens/CertificateScreen";
import { CourseDetailScreen } from "../screens/CourseDetailScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LessonPlayerScreen } from "../screens/LessonPlayerScreen";
import { WorkbookScreen } from "../screens/WorkbookScreen";
import { colors, fonts } from "../theme";

export type AcademyStackParamList = {
  Home: undefined;
  CourseDetail: { slug: string };
  LessonPlayer: { lessonId: string; courseId: string };
  Workbook: { courseId: string };
  Certificate: { courseId: string; recommendedNextCourseId: string | null };
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
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: "" }} />
      <Stack.Screen
        name="LessonPlayer"
        component={LessonPlayerScreen}
        options={{ title: "", headerStyle: { backgroundColor: colors.ink } }}
      />
      <Stack.Screen name="Workbook" component={WorkbookScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Certificate"
        component={CertificateScreen}
        options={{ title: "", headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
