import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme/colors';

/**
 * The rounded pill used throughout both prototypes for tab switchers, status choices,
 * and tier choices (e.g. the Draft/Published/Archived and Single/Bundle/Full access
 * pill rows in AdminScreen.dc.html's course editor).
 */
export function Pill({
  label,
  active,
  activeBg,
  activeColor,
  onPress,
}: {
  label: string;
  active: boolean;
  activeBg?: string;
  activeColor?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: active ? activeBg ?? colors.ink : colors.transparent,
          borderColor: active ? activeBg ?? colors.ink : colors.hairlineBorderStrong,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: active ? activeColor ?? colors.ivory : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
