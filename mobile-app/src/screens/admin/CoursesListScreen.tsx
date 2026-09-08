import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts, statusStyle, tierLabel } from '../../theme/colors';
import { Kicker, Display } from '../../components/Labels';
import { Placeholder } from '../../components/Placeholder';
import { useAcademy } from '../../state/AcademyContext';
import { lessonCount, moduleCount, priceLabel } from '../../state/selectors';
import type { AdminStackParamList } from '../../navigation/types';

/**
 * Course list — the admin landing screen. Ported from the "COURSES LIST" block in
 * AdminScreen.dc.html: a card per course with placeholder art, tier/module/lesson
 * meta, a status pill, and price, plus a "+ New course" button.
 */
export function CoursesListScreen({ navigation }: NativeStackScreenProps<AdminStackParamList, 'CoursesList'>) {
  const insets = useSafeAreaInsets();
  const { state, createCourse } = useAcademy();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}>
      <View style={styles.headerRow}>
        <View>
          <Kicker>Soft Life Academy</Kicker>
          <Display size={30} style={{ marginTop: 6 }}>
            Course Builder
          </Display>
          <Text style={styles.subtitle}>Create and manage the courses learners see in Academy.</Text>
        </View>
        <Pressable
          style={styles.newButton}
          onPress={() => {
            const id = createCourse();
            navigation.navigate('CourseEditor', { courseId: id });
          }}
        >
          <Text style={styles.newButtonText}>+ New course</Text>
        </Pressable>
      </View>

      <View style={{ gap: 10 }}>
        {state.courses.map((c) => {
          const st = statusStyle[c.status];
          const mCount = moduleCount(c);
          const lCount = lessonCount(c);
          return (
            <Pressable
              key={c.id}
              style={styles.row}
              onPress={() => navigation.navigate('CourseEditor', { courseId: c.id })}
            >
              <Placeholder size={52} radius={12} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Display size={19}>{c.title}</Display>
                <Text style={styles.meta}>
                  {tierLabel[c.tier]} · {mCount} module{mCount === 1 ? '' : 's'} · {lCount} lesson
                  {lCount === 1 ? '' : 's'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                  <Text style={[styles.statusText, { color: st.color }]}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.price}>{priceLabel(c.price)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { paddingHorizontal: 22, paddingBottom: 46, gap: 22 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  subtitle: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textSecondary, lineHeight: 18, marginTop: 6, maxWidth: 260 },
  newButton: { backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 16 },
  newButtonText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ivory },
  row: { flexDirection: 'row', gap: 13, alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: colors.cream },
  meta: { fontFamily: fonts.sans, fontSize: 11, color: colors.textTertiary, marginTop: 3 },
  statusPill: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 },
  statusText: { fontFamily: fonts.sansBold, fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase' },
  price: { fontFamily: fonts.sansBold, fontSize: 11.5, color: colors.textGoldDark },
});
