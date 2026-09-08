import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, fonts } from '../../theme/colors';
import { Display } from '../../components/Labels';
import { Placeholder } from '../../components/Placeholder';
import { SecondaryButton } from '../../components/PrimaryButton';
import { useLearnerVm } from '../../state/useLearnerVm';
import type { LearnerStackParamList } from '../../navigation/types';

/**
 * Certificate / course-complete screen. Ported from the "CERTIFICATE / COMPLETE"
 * block in AcademyScreen.dc.html: a completion badge, a certificate card with the
 * learner's name, and a recommended-next-course card pulled from the catalog.
 */
export function CertificateScreen({ navigation }: NativeStackScreenProps<LearnerStackParamList, 'Certificate'>) {
  const insets = useSafeAreaInsets();
  const vm = useLearnerVm();
  const recommended = vm.catalog[0];
  const monthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 34 }]}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Certificate earned</Text>
        </View>
        <Display size={38}>Course Complete</Display>
        <Text style={styles.subtitle}>
          You finished all {vm.total} lessons of {vm.course.title}. Now go and launch it.
        </Text>
      </View>

      <View style={styles.certCard}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.certifies}>Soft Life Academy certifies</Text>
        <Display size={26}>{vm.learnerName}</Display>
        <Text style={styles.certMeta}>
          {vm.course.title} · {monthYear}
        </Text>
        <View style={styles.certActions}>
          <View style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save certificate</Text>
          </View>
          <SecondaryButton label="Share" />
        </View>
      </View>

      {recommended ? (
        <View style={{ gap: 11 }}>
          <Text style={styles.recommendedLabel}>Recommended next</Text>
          <View style={styles.recommendedCard}>
            <Placeholder size={58} radius={13} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Display size={20}>{recommended.title}</Display>
              <Text style={styles.recommendedTagline}>{recommended.tagline}</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceTagText}>{recommended.price}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <Pressable style={styles.homeLink} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeLinkText}>Back to Academy</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ivory },
  content: { paddingHorizontal: 22, paddingBottom: 46, gap: 26, alignItems: 'center' },
  header: { alignItems: 'center', gap: 14, textAlign: 'center' },
  badge: { backgroundColor: colors.roseBgStrong, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13 },
  badgeText: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: colors.roseText },
  subtitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.textSecondary, lineHeight: 19, textAlign: 'center', maxWidth: 280 },
  certCard: {
    width: '100%',
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.goldBorderTint,
    borderRadius: 18,
    padding: 26,
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: { width: 46, height: 46, borderRadius: 999, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontFamily: fonts.serif, fontSize: 22, color: colors.ivory },
  certifies: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: colors.textMutedLabel },
  certMeta: { fontFamily: fonts.sans, fontSize: 12.5, color: colors.textSecondary },
  certActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  saveButton: { backgroundColor: colors.gold, borderRadius: 999, paddingVertical: 11, paddingHorizontal: 18 },
  saveButtonText: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.ivory },
  recommendedLabel: { fontFamily: fonts.sansBold, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.textMutedLabel },
  recommendedCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  recommendedTagline: { fontFamily: fonts.sans, fontSize: 11.5, color: colors.textTertiary, marginTop: 3 },
  priceTag: { backgroundColor: colors.goldTint, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 9 },
  priceTagText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.textGoldDark },
  homeLink: { marginTop: 'auto', paddingTop: 8 },
  homeLinkText: { fontFamily: fonts.sansMedium, fontSize: 12, letterSpacing: 0.4, color: colors.textTertiary },
});
