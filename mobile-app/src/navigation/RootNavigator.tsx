import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme/colors';
import { LearnerNavigator } from './LearnerNavigator';
import { AdminNavigator } from './AdminNavigator';

type Flow = 'learner' | 'admin';

/**
 * Top-level flow switcher, standing in for real auth/role-based routing.
 *
 * The original Main.dc.html prototype put both the learner app and the admin
 * course-builder in one canvas with a "Learner app / Course builder" tab switcher at
 * the top, purely so both could be demoed side by side. This component preserves that
 * same switcher as a lightweight dev affordance — in a shipped app, replace it with
 * your real navigation root: most users only ever see <LearnerNavigator />, and
 * <AdminNavigator /> is gated behind an admin/instructor role.
 */
export function RootNavigator() {
  const [flow, setFlow] = useState<Flow>('learner');
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.switcher, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={[styles.tab, flow === 'learner' && styles.tabActive]}
          onPress={() => setFlow('learner')}
        >
          <Text style={[styles.tabLabel, flow === 'learner' && styles.tabLabelActive]}>Learner app</Text>
        </Pressable>
        <Pressable style={[styles.tab, flow === 'admin' && styles.tabActive]} onPress={() => setFlow('admin')}>
          <Text style={[styles.tabLabel, flow === 'admin' && styles.tabLabelActive]}>Course builder</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }}>{flow === 'learner' ? <LearnerNavigator /> : <AdminNavigator />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.ivory,
  },
  tab: {
    borderWidth: 1,
    borderColor: colors.hairlineBorder,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  tabActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  tabLabel: { fontFamily: fonts.sans, fontSize: 11, color: colors.textSecondary },
  tabLabelActive: { color: colors.ivory },
});
