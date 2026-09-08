import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AdminStackParamList } from './types';
import { CoursesListScreen } from '../screens/admin/CoursesListScreen';
import { CourseEditorScreen } from '../screens/admin/CourseEditorScreen';
import { ModuleEditorScreen } from '../screens/admin/ModuleEditorScreen';
import { LessonEditorScreen } from '../screens/admin/LessonEditorScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

/** The four course-builder screens, ported from AdminScreen.dc.html. */
export function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoursesList" component={CoursesListScreen} />
      <Stack.Screen name="CourseEditor" component={CourseEditorScreen} />
      <Stack.Screen name="ModuleEditor" component={ModuleEditorScreen} />
      <Stack.Screen name="LessonEditor" component={LessonEditorScreen} />
    </Stack.Navigator>
  );
}
