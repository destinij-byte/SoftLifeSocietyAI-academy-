import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme/colors';
import { Kicker } from '../../components/Labels';
import { FormField, BoxedInput, BoxedTextArea, TitleInput } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAcademy } from '../../state/AcademyContext';
import { slug } from '../../state/selectors';
import type { AdminStackParamList } from '../../navigation/types';

/**
 * Lesson editor. Ported from the "LESSON EDITOR" block in AdminScreen.dc.html:
 * title, a video upload/replace slot, duration, transcript, and a resources list
 * with label + URL fields.
 */
export function LessonEditorScreen({
  route,
  navigation,
}: NativeStackScreenProps<AdminStackParamList, 'LessonEditor'>) {
  const insets = useSafeAreaInsets();
  const { courseId, moduleId, lessonId } = route.params;
  const { getCourse, dispatch } = useAcademy();
  const course = getCourse(courseId);
  const mod = course?.modules.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);

  if (!course || !mod || !lesson) return null;

  const videoLabel = lesson.hasVideo ? `${slug(mod.title || 'lesson')}.mp4` : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Kicker>{mod.title}</Kicker>
      </View>

      <TitleInput
        value={lesson.title}
        onChangeText={(title) => dispatch({ type: 'lesson/update', courseId, moduleId, lessonId, patch: { title } })}
        placeholder="Lesson title"
        fontSize={24}
      />

      {lesson.hasVideo ? (
        <View style={styles.videoRow}>
          <View style={styles.playChip}>
            <View style={styles.playTriangle} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.videoLabel}>{videoLabel}</Text>
            <Text style={styles.videoSub}>Video uploaded</Text>
          </View>
          <Pressable onPress={() => dispatch({ type: 'lesson/toggleVideo', courseId, moduleId, lessonId })}>
            <Text style={styles.replaceLink}>Replace</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.uploadBox}
          onPress={() => dispatch({ type: 'lesson/toggleVideo', courseId, moduleId, lessonId })}
        >
          <Text style={styles.uploadTitle}>Upload lesson video</Text>
          <Text style={styles.uploadSub}>MP4, up to 2 GB</Text>
        </Pressable>
      )}

      <FormField label="Duration">
        <BoxedInput
          value={lesson.duration}
          onChangeText={(duration) => dispatch({ type: 'lesson/update', courseId, moduleId, lessonId, patch: { duration } })}
          placeholder="mm:ss"
        />
      </FormField>

      <FormField label="Transcript">
        <BoxedTextArea
          value={lesson.transcript}
          onChangeText={(transcript) => dispatch({ type: 'lesson/update', courseId, moduleId, lessonId, patch: { transcript } })}
          placeholder="Optional — paste or write the transcript"
        />
      </FormField>

      <View style={{ gap: 10 }}>
        <View style={styles.sectionHeader}>
          <Kicker>Resources</Kicker>
          <Pressable
            style={styles.addChip}
            onPress={() => dispatch({ type: 'resource/add', courseId, moduleId, lessonId })}
          >
            <Text style={styles.addChipText}>+ Add resource</Text>
          </Pressable>
        </View>
        {lesson.resources.length === 0 ? (
          <Text style={styles.emptyState}>No linked resources on this lesson.</Text>
        ) : null}
        <View style={{ gap: 8 }}>
          {lesson.resources.map((r) => (
            <View key={r.id} style={styles.resourceCard}>
              <View style={styles.resourceTopRow}>
                <BoxedInput
                  value={r.label}
                  onChangeText={(label) =>
                    dispatch({ type: 'resource/update', courseId, moduleId, lessonId, resourceId: r.id, patch: { label } })
                  }
                  placeholder="Resource label"
                  style={styles.resourceLabelInput}
                />
                <Pressable onPress={() => dispatch({ type: 'resource/remove', courseId, moduleId, lessonId, resourceId: r.id })}>
                  <Text style={styles.removeLink}>Remove</Text>
                </Pressable>
              </View>
              <BoxedInput
                value={r.url}
                onChangeText={(url) =>
                  dispatch({ type: 'resource/update', courseId, moduleId, lessonId, resourceId: r.id, patch: { url } })
                }
                placeholder="https://"
                style={styles.resourceUrlInput}
              />
            </View>
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
  videoRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 13, borderRadius: 15, backgroundColor: colors.ink },
  playChip: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.onDarkSurfaceStrong },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.ivory,
  },
  videoLabel: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.ivory },
  videoSub: { fontFamily: fonts.sans, fontSize: 10.5, color: colors.onDarkMuted, marginTop: 2 },
  replaceLink: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.onDarkRose },
  uploadBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 26,
    paddingHorizontal: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.hairlineDashed,
  },
  uploadTitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary },
  uploadSub: { fontFamily: fonts.sans, fontSize: 10.5, color: colors.textMutedLabel },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addChip: { backgroundColor: colors.goldTint, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12 },
  addChipText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.textGoldDark },
  emptyState: { fontFamily: fonts.sans, fontStyle: 'italic', fontSize: 12, color: colors.textMutedLabel, paddingVertical: 4 },
  resourceCard: { gap: 6, padding: 11, borderRadius: 14, backgroundColor: colors.offWhite, borderWidth: 1, borderColor: colors.hairline },
  resourceTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resourceLabelInput: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 12.5, borderWidth: 0, padding: 0, backgroundColor: colors.transparent },
  removeLink: { fontFamily: fonts.sans, fontSize: 10, color: colors.roseText },
  resourceUrlInput: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textSecondary, borderWidth: 0, padding: 0, backgroundColor: colors.transparent },
});
