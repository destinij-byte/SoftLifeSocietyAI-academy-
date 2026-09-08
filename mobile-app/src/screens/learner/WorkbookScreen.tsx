import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme/colors';
import { Kicker, Display } from '../../components/Labels';
import { Placeholder } from '../../components/Placeholder';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useLearnerVm } from '../../state/useLearnerVm';
import type { LearnerStackParamList } from '../../navigation/types';

/**
 * Workbook download screen. Ported from the "WORKBOOK" block in AcademyScreen.dc.html.
 * The "Inside" list below is built from each module's `workbookItems`, which is the
 * exact prompt text used to generate the real PDF workbook in
 * content-pipeline/scripts/build_worksheets.py — so this list and the actual PDF's
 * table of contents never drift apart.
 */
export function WorkbookScreen({ navigation }: NativeStackScreenProps<LearnerStackParamList, 'Workbook'>) {
  const insets = useSafeAreaInsets();
  const vm = useLearnerVm();

  const sections = vm.course.modules.map((m, i) => ({
    key: m.id,
    num: String(i + 1).padStart(2, '0'),
    title: m.title,
  }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Kicker>Course workbook</Kicker>
      </View>

      <View style={styles.heroRow}>
        <Placeholder size={108} radius={6} style={{ height: 144 }} />
        <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
          <Display size={24}>{vm.course.title} Workbook</Display>
          <Text style={styles.desc}>
            {vm.total} lessons of prompts, worksheets and pricing tables to fill in as you go.
          </Text>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>PDF</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Printable</Text>
            </View>
          </View>
        </View>
      </View>

      <View>
        <PrimaryButton label="↓  Download workbook" />
        <Text style={styles.downloadHint}>Yours to keep</Text>
      </View>

      <View style={{ gap: 10 }}>
        <Kicker>Inside</Kicker>
        {sections.map((s) => (
          <View key={s.key} style={styles.sectionRow}>
            <Text style={styles.sectionNum}>{s.num}</Text>
            <Text style={styles.sectionTitle}>{s.title}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.doneLink} onPress={() => navigation.navigate('Certificate')}>
        <Text style={styles.doneLinkText}>See course completion screen →</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { paddingHorizontal: 22, paddingBottom: 46, gap: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { fontSize: 19, color: colors.textTertiary },
  heroRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  desc: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textSecondary, lineHeight: 18 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: colors.roseBg, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 },
  tagText: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.roseText },
  downloadHint: { textAlign: 'center', fontFamily: fonts.sans, fontSize: 11, color: colors.textMutedLabel, marginTop: 9 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  sectionNum: { fontFamily: fonts.mono, fontSize: 10, color: colors.gold, width: 22 },
  sectionTitle: { flex: 1, fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 18, color: colors.ink },
  doneLink: { marginTop: 'auto', alignItems: 'center' },
  doneLinkText: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 0.4, color: colors.textTertiary },
});
