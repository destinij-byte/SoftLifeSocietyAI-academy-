import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme/colors';
import { Kicker, Display, NumChip } from '../../components/Labels';
import { ProgressBar } from '../../components/ProgressBar';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useLearnerVm } from '../../state/useLearnerVm';
import type { LearnerStackParamList } from '../../navigation/types';

/**
 * Course / lesson list. Ported from the "COURSE / LESSON LIST" block in
 * AcademyScreen.dc.html: course header + progress, then every module with its
 * lessons, each row showing a done/current/upcoming dot and tappable to jump into
 * the player at that lesson.
 */
export function CourseScreen({ navigation }: NativeStackScreenProps<LearnerStackParamList, 'Course'>) {
  const insets = useSafeAreaInsets();
  const vm = useLearnerVm();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Kicker>Enrolled</Kicker>
      </View>

      <View style={{ gap: 14 }}>
        <Display size={30}>{vm.course.title}</Display>
        <Text style={styles.description}>{vm.course.description}</Text>
        <View style={{ gap: 8 }}>
          <ProgressBar percent={vm.pct} />
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{vm.pctLabel} complete</Text>
            <Text style={styles.progressLabel}>
              {vm.done} of {vm.total} lessons
            </Text>
          </View>
        </View>
        <PrimaryButton label="Download the workbook" onPress={() => navigation.navigate('Workbook')} />
      </View>

      <View style={{ gap: 18 }}>
        {vm.modules.map((m) => (
          <View key={m.key} style={{ gap: 9 }}>
            <View style={styles.moduleHeader}>
              <NumChip>{m.numLabel}</NumChip>
              <Display size={20}>{m.title}</Display>
            </View>
            <View style={{ gap: 6 }}>
              {m.lessons.map((l) => (
                <Pressable
                  key={l.key}
                  onPress={() => {
                    vm.goToLesson(l.flatIndex);
                    navigation.navigate('Player');
                  }}
                  style={[styles.lessonRow, { backgroundColor: l.isCurrent ? colors.rowCurrentBg : l.isDone ? colors.rowDoneBg : colors.transparent }]}
                >
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: l.isDone ? colors.gold : colors.ivory,
                        borderColor: l.isDone ? colors.gold : colors.hairlineBorderStrong,
                      },
                    ]}
                  >
                    <Text style={[styles.dotLabel, { color: l.isDone ? colors.ivory : colors.textTertiary }]}>
                      {l.dotLabel}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.lessonTitle, { color: l.isDone ? colors.textTertiary : colors.ink }]}>
                      {l.title}
                    </Text>
                    <Text style={styles.lessonMeta}>{l.metaLabel}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { paddingHorizontal: 22, paddingBottom: 46, gap: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { fontSize: 19, color: colors.textTertiary },
  description: { fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  moduleHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 9 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 15 },
  dot: { width: 22, height: 22, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dotLabel: { fontSize: 11, fontFamily: fonts.sans },
  lessonTitle: { fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 18 },
  lessonMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMutedLabel,
    marginTop: 3,
  },
});
