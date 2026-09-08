import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme/colors';
import { Display } from '../../components/Labels';
import { Placeholder } from '../../components/Placeholder';
import { ProgressBar } from '../../components/ProgressBar';
import { PrimaryButton, CircleButton } from '../../components/PrimaryButton';
import { useLearnerVm } from '../../state/useLearnerVm';
import type { LearnerStackParamList } from '../../navigation/types';

/**
 * Video player. Ported from the "PLAYER" block in AcademyScreen.dc.html: dark
 * (ink-background) screen, a video placeholder with a big centered play glyph,
 * scrub bar, lesson title + blurb (falls back to a generic prompt when the
 * curriculum pipeline didn't supply a lesson-specific blurb), a complete/continue
 * CTA that advances progress, and an "up next" card.
 */
export function PlayerScreen({ navigation }: NativeStackScreenProps<LearnerStackParamList, 'Player'>) {
  const insets = useSafeAreaInsets();
  const vm = useLearnerVm();
  const lesson = vm.current;
  if (!lesson) return null;

  const lessonContent = vm.course.modules[lesson.moduleIndex]?.lessons[lesson.lessonIndex];
  const blurb =
    lessonContent?.objective ??
    'Watch this through once, then open the workbook page for this lesson and fill it in while it is fresh.';

  const ctaLabel = vm.isLast ? 'Mark complete and finish' : 'Mark complete and continue';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}
    >
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.navigate('Course')} hitSlop={10}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.moduleLabel}>Module {lesson.moduleNum}</Text>
        <Text style={styles.counter}>
          Lesson {vm.currentIndex + 1}/{vm.total}
        </Text>
      </View>

      <View style={styles.videoBox}>
        <View style={styles.playButton}>
          <View style={styles.playTriangle} />
        </View>
      </View>

      <View style={{ gap: 9 }}>
        <ProgressBar percent={18} trackColor={colors.onDarkHairline} height={3} />
        <View style={styles.scrubLabels}>
          <Text style={styles.scrubText}>0:00</Text>
          <Text style={styles.scrubText}>{lesson.durationLabel}</Text>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Display size={28} color={colors.onDarkPrimary}>
          {lesson.title}
        </Display>
        <Text style={styles.blurb}>{blurb}</Text>
      </View>

      <View style={styles.ctaRow}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label={ctaLabel}
            dark
            onPress={() => {
              const wasLast = vm.isLast;
              vm.markComplete();
              // Advancing progress re-renders this same screen with the next lesson's
              // content (the vm recomputes `current` from the reducer's overrideDone),
              // matching the original prototype's in-place player update — except when
              // this was the final lesson, where we hand off to the certificate screen.
              if (wasLast) navigation.navigate('Certificate');
            }}
          />
        </View>
        <CircleButton dark onPress={() => navigation.navigate('Workbook')}>
          <Text style={styles.downArrow}>↓</Text>
        </CircleButton>
      </View>

      <View style={styles.upNext}>
        <Text style={styles.upNextLabel}>Up next</Text>
        <View style={styles.upNextCard}>
          <Placeholder size={44} radius={11} dark />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.upNextTitle}>{vm.next?.title}</Text>
            <Text style={styles.upNextMeta}>
              Module {vm.next?.moduleNum} · {vm.next?.durationLabel}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { paddingHorizontal: 22, paddingBottom: 46, gap: 22 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 19, color: colors.onDarkSecondary },
  moduleLabel: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.onDarkMuted },
  counter: { fontFamily: fonts.sans, fontSize: 10, color: colors.onDarkMuted },
  videoBox: {
    borderRadius: 18,
    height: 210,
    backgroundColor: colors.placeholderTintDarkA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: { width: 62, height: 62, borderRadius: 999, backgroundColor: 'rgba(251,247,242,0.92)', alignItems: 'center', justifyContent: 'center' },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 5,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 17,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.ink,
  },
  scrubLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  scrubText: { fontFamily: fonts.mono, fontSize: 10, color: colors.onDarkMuted },
  blurb: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.onDarkSecondary },
  ctaRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  downArrow: { fontSize: 17, color: colors.onDarkRose },
  upNext: { marginTop: 'auto', gap: 9 },
  upNextLabel: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.onDarkFaint },
  upNextCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.onDarkSurface },
  upNextTitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.onDarkPrimary },
  upNextMeta: { fontFamily: fonts.sansMedium, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.onDarkMuted, marginTop: 3 },
});
