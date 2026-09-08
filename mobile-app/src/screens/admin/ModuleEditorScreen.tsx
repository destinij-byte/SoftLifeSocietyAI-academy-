import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme/colors';
import { Kicker } from '../../components/Labels';
import { TitleInput } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReorderableRow } from '../../components/ReorderableRow';
import { useAcademy } from '../../state/AcademyContext';
import type { AdminStackParamList } from '../../navigation/types';

/**
 * Module editor. Ported from the "MODULE EDITOR" block in AdminScreen.dc.html:
 * module title, its position within the course with move up/down controls, and
 * the lessons list.
 */
export function ModuleEditorScreen({
  route,
  navigation,
}: NativeStackScreenProps<AdminStackParamList, 'ModuleEditor'>) {
  const insets = useSafeAreaInsets();
  const { courseId, moduleId } = route.params;
  const { getCourse, dispatch } = useAcademy();
  const course = getCourse(courseId);
  const idx = course?.modules.findIndex((m) => m.id === moduleId) ?? -1;
  const mod = idx >= 0 ? course!.modules[idx] : undefined;

  if (!course || !mod) return null;

  const count = course.modules.length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Kicker>{course.title}</Kicker>
      </View>

      <TitleInput
        value={mod.title}
        onChangeText={(title) => dispatch({ type: 'module/update', courseId, moduleId, patch: { title } })}
        placeholder="Module title"
        fontSize={26}
      />

      <View style={styles.orderRow}>
        <Text style={styles.orderLabel}>
          Module {idx + 1} of {count}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            style={styles.moveButton}
            onPress={() => dispatch({ type: 'module/move', courseId, moduleId, direction: 'up' })}
          >
            <Text style={styles.moveButtonText}>↑ Move up</Text>
          </Pressable>
          <Pressable
            style={styles.moveButton}
            onPress={() => dispatch({ type: 'module/move', courseId, moduleId, direction: 'down' })}
          >
            <Text style={styles.moveButtonText}>↓ Move down</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={{ gap: 10 }}>
        <View style={styles.sectionHeader}>
          <Kicker>Lessons</Kicker>
          <Pressable
            style={styles.addChip}
            onPress={() => dispatch({ type: 'lesson/add', courseId, moduleId })}
          >
            <Text style={styles.addChipText}>+ Add lesson</Text>
          </Pressable>
        </View>
        {mod.lessons.length === 0 ? (
          <Text style={styles.emptyState}>No lessons yet — add the first lesson in this module.</Text>
        ) : null}
        <View style={{ gap: 7 }}>
          {mod.lessons.map((l, i) => (
            <ReorderableRow
              key={l.id}
              num={String(i + 1).padStart(2, '0')}
              title={l.title}
              meta={l.duration}
              onPress={() => navigation.navigate('LessonEditor', { courseId, moduleId, lessonId: l.id })}
              onMoveUp={() => dispatch({ type: 'lesson/move', courseId, moduleId, lessonId: l.id, direction: 'up' })}
              onMoveDown={() => dispatch({ type: 'lesson/move', courseId, moduleId, lessonId: l.id, direction: 'down' })}
              onRemove={() => dispatch({ type: 'lesson/remove', courseId, moduleId, lessonId: l.id })}
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
  orderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderLabel: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textSecondary },
  moveButton: { borderWidth: 1, borderColor: colors.hairlineBorderStrong, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 },
  moveButtonText: { fontFamily: fonts.sans, fontSize: 11, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.hairline },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addChip: { backgroundColor: colors.goldTint, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  addChipText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.textGoldDark },
  emptyState: { fontFamily: fonts.sans, fontStyle: 'italic', fontSize: 12, color: colors.textMutedLabel, paddingVertical: 10 },
});
