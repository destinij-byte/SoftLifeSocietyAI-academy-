import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

export function PrimaryButton({
  label,
  onPress,
  dark = false,
}: {
  label: string;
  onPress?: () => void;
  /** Player screen sits on an ink background, where the CTA hover-brightens instead of darkens. */
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? (dark ? colors.goldHoverDark : colors.goldHoverLight) : colors.gold },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondary,
        { borderColor: pressed ? colors.gold : colors.hairlineBorderStrong },
      ]}
    >
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

/** Small circular icon-only button, used for the workbook shortcut on the player screen. */
export function CircleButton({
  children,
  onPress,
  dark = false,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.circle,
        { borderColor: dark ? colors.onDarkHairlineStrong : colors.hairlineBorderStrong },
      ]}
    >
      <View>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.ivory,
    letterSpacing: 0.4,
  },
  secondary: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12.5,
    color: colors.ink,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
