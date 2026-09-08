import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LearnerStackParamList } from './types';
import { HomeScreen } from '../screens/learner/HomeScreen';
import { CourseScreen } from '../screens/learner/CourseScreen';
import { PlayerScreen } from '../screens/learner/PlayerScreen';
import { WorkbookScreen } from '../screens/learner/WorkbookScreen';
import { CertificateScreen } from '../screens/learner/CertificateScreen';

const Stack = createNativeStackNavigator<LearnerStackParamList>();

/**
 * The five enrolled-learner screens, ported from AcademyScreen.dc.html.
 * Headers are hidden throughout — every screen draws its own back button and
 * eyebrow label to match the no-chrome design of the original prototype.
 */
export function LearnerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Course" component={CourseScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} />
      <Stack.Screen name="Workbook" component={WorkbookScreen} />
      <Stack.Screen name="Certificate" component={CertificateScreen} />
    </Stack.Navigator>
  );
}
