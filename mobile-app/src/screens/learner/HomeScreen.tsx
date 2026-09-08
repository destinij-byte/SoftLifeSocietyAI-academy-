import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme/colors';
import { Kicker, Display } from '../../components/Labels';
import { Placeholder } from '../../components/Placeholder';
import { ProgressBar } from '../../components/ProgressBar';
import { useLearnerVm } from '../../state/useLearnerVm';
import type { LearnerStackParamList } from '../../navigation/types';

/**
 * Academy home. Ported from the "HOME" `<sc-if>` block in AcademyScreen.dc.html:
 * greeting, the in-progress course card with a live progress bar, the "yours to
 * unlock" catalog of the other three courses, and a shortcut into the workbook.
 */
export function HomeScreen({ navigation }: NativeStackScreenProps<LearnerStackParamList, 'Home'>) {
  const insets = useSafeAreaInsets();
  const vm = useLearnerVm();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
    >
      <View style={styles.headerRow}>
        <View>
          <Kicker>{vm.greeting}</Kicker>
          <Display size={36} style={{ marginTop: 8 }}>
            Academy
          </Display>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{vm.learnerName.charAt(0)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Kicker>Continue</Kicker>
        <Pressable style={styles.continueCard} onPress={() => navigation.navigate('Course')}>
          <View style={styles.continueTop}>
            <Placeholder size={76} radius={15} />
            <View style={styles.continueText}>
              <Display size={22}>{vm.course.title}</Display>
              <Text style={styles.meta}>
                {vm.currentModuleLabel} · {vm.current?.title}
              </Text>
            </View>
          </View>
          <View style={styles.progressWrap}>
            <ProgressBar percent={vm.pct} />
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>{vm.pctLabel} complete</Text>
              <Text style={styles.progressLabel}>
                {vm.done} of {vm.total} lessons
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Kicker>Yours to unlock</Kicker>
        <View style={{ gap: 10 }}>
          {vm.catalog.map((c) => (
            <View key={c.id} style={styles.catalogRow}>
              <Placeholder size={52} />
              <View style={styles.continueText}>
                <Display size={19}>{c.title}</Display>
                <Text style={styles.catalogTagline}>{c.tagline}</Text>
              </View>
              <View style={styles.priceTag}>
                <Text style={styles.priceTagText}>{c.price}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Pressable style={styles.workbookRow} onPress={() => navigation.navigate('Workbook')}>
        <View>
          <Text style={styles.workbookTitle}>Your workbooks</Text>
          <Text style={styles.workbookMeta}>1 available to download</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { paddingHorizontal: 22, paddingBottom: 46, gap: 28 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.serif, fontSize: 18, color: colors.avatarText },
  section: { gap: 12 },
  continueCard: { backgroundColor: colors.cream, borderRadius: 22, padding: 18, gap: 16 },
  continueTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  continueText: { flex: 1, minWidth: 0, gap: 6 },
  meta: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textSecondary, lineHeight: 17 },
  progressWrap: { gap: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.offWhite,
  },
  catalogTagline: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textTertiary, marginTop: 3 },
  priceTag: { backgroundColor: colors.goldTint, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9 },
  priceTagText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.textGoldDark },
  workbookRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.cream,
  },
  workbookTitle: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.ink },
  workbookMeta: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textTertiary, marginTop: 2 },
  arrow: { fontSize: 18, color: colors.gold },
});
