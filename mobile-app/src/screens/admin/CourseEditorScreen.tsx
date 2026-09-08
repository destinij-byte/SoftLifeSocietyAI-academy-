import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme/colors';
import { Kicker } from '../../components/Labels';
import { Placeholder } from '../../components/Placeholder';
import { Pill } from '../../components/Pill';
import { FormField, BoxedInput, BoxedTextArea, TitleInput } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReorderableRow } from '../../components/ReorderableRow';
import { useAcademy } from '../../state/AcademyContext';
import { slug } from '../../state/selectors';
import type { AdminStackParamList } from '../../navigation/types';
import type { CourseStatus as Status, CourseTier as Tier } from '../../types';

const STATUSES: { key: Status; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
  { key: 'archived', label: 'Archived' },
];

const TIERS: { key: Tier; label: string }[] = [
  { key: 'single', label: 'Single' },
  { key: 'bundle', label: 'Bundle' },
  { key: 'full_access', label: 'Full access' },
];

/**
 * Course editor. Ported from the "COURSE EDITOR" block in AdminScreen.dc.html:
 * title, status pills, tier pills, price, description, thumbnail/workbook rows
 * (static placeholders — wire these to your file-upload flow), and the modules list.
 */
export function CourseEditorScreen({
  route,
  navigation,
}: NativeStackScreenProps<AdminStackParamList, 'CourseEditor'>) {
  const insets = useSafeAreaInsets();
  const { courseId } = route.params;
  const { getCourse, dispatch } = useAcademy();
  const course = getCourse(courseId);

  if (!course) return null;

  const workbookLabel =
    course.status === 'published' ? `${slug(course.title)}-workbook.pdf` : 'Not uploaded';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Kicker>Edit course</Kicker>
      </View>

      <TitleInput
        value={course.title}
        onChangeText={(title) => dispatch({ type: 'course/update', courseId, patch: { title } })}
        placeholder="Course title"
        fontSize={28}
      />

      <FormField label="Status">
        <View style={styles.pillRow}>
          {STATUSES.map((s) => (
            <Pill
              key={s.key}
              label={s.label}
              active={course.status === s.key}
              onPress={() => dispatch({ type: 'course/update', courseId, patch: { status: s.key } })}
            />
          ))}
        </View>
      </FormField>

      <FormField label="Tier">
        <View style={styles.pillRow}>
          {TIERS.map((t) => (
            <Pill
              key={t.key}
              label={t.label}
              active={course.tier === t.key}
              activeBg={colors.gold}
              onPress={() => dispatch({ type: 'course/update', courseId, patch: { tier: t.key } })}
            />
          ))}
        </View>
      </FormField>

      <FormField label="Price">
        <View style={styles.priceBox}>
          <Text style={styles.priceDollar}>$</Text>
          <BoxedInput
            value={String(course.price)}
            onChangeText={(v) => {
              const cleaned = v.replace(/[^0-9.]/g, '');
              dispatch({ type: 'course/update', courseId, patch: { price: Number(cleaned) || 0 } });
            }}
            keyboardType="decimal-pad"
            style={styles.priceInput}
          />
        </View>
      </FormField>

      <FormField label="Description">
        <BoxedTextArea
          value={course.description}
          onChangeText={(description) => dispatch({ type: 'course/update', courseId, patch: { description } })}
          placeholder="What will learners get from this course?"
        />
      </FormField>

      <View style={{ gap: 10 }}>
        <View style={styles.assetRow}>
          <Placeholder size={40} radius={10} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.assetTitle}>Course thumbnail</Text>
            <Text style={styles.assetMeta}>Shown on the storefront and Academy home</Text>
          </View>
          <Text style={styles.assetAction}>Change</Text>
        </View>
        <View style={styles.assetRow}>
          <View style={[styles.pdfBadge]}>
            <Text style={styles.pdfBadgeText}>PDF</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.assetTitle}>Workbook PDF</Text>
            <Text style={styles.assetMeta}>{workbookLabel}</Text>
          </View>
          <Text style={styles.assetAction}>Upload</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={{ gap: 10 }}>
        <View style={styles.sectionHeader}>
          <Kicker>Modules</Kicker>
          <Pressable
            style={styles.addChip}
            onPress={() => dispatch({ type: 'module/add', courseId })}
          >
            <Text style={styles.addChipText}>+ Add module</Text>
          </Pressable>
        </View>
        {course.modules.length === 0 ? (
          <Text style={styles.emptyState}>No modules yet — add your first module to start building this course.</Text>
        ) : null}
        <View style={{ gap: 7 }}>
          {course.modules.map((m, i) => (
            <ReorderableRow
              key={m.id}
              num={String(i + 1).padStart(2, '0')}
              title={m.title}
              meta={`${m.lessons.length} lesson${m.lessons.length === 1 ? '' : 's'}`}
              onPress={() => navigation.navigate('ModuleEditor', { courseId, moduleId: m.id })}
              onMoveUp={() => dispatch({ type: 'module/move', courseId, moduleId: m.id, direction: 'up' })}
              onMoveDown={() => dispatch({ type: 'module/move', courseId, moduleId: m.id, direction: 'down' })}
              onRemove={() => dispatch({ type: 'module/remove', courseId, moduleId: m.id })}
            />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 4 }}>
        <PrimaryButton label="Save changes" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { paddingHorizontal: 22, paddingBottom: 46, gap: 20 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { fontSize: 19, color: colors.textTertiary },
  pillRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.offWhite,
  },
  priceDollar: { fontFamily: fonts.sans, fontSize: 15, color: colors.textTertiary },
  priceInput: { flex: 1, borderWidth: 0, padding: 0, backgroundColor: colors.transparent, fontSize: 15 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, borderRadius: 14, backgroundColor: colors.cream },
  assetTitle: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.ink },
  assetMeta: { fontFamily: fonts.sans, fontSize: 10.5, color: colors.textTertiary, marginTop: 2 },
  assetAction: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.gold },
  pdfBadge: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.offWhite },
  pdfBadgeText: { fontFamily: fonts.serif, fontSize: 15, color: colors.textMutedLabel },
  divider: { height: 1, backgroundColor: colors.hairline },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addChip: { backgroundColor: colors.goldTint, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  addChipText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.textGoldDark },
  emptyState: { fontFamily: fonts.sans, fontStyle: 'italic', fontSize: 12, color: colors.textMutedLabel, paddingVertical: 10 },
});
