import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

/** Labeled admin input — the eyebrow-label-over-field pattern used throughout AdminScreen.dc.html. */
export function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function BoxedInput(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textMutedLabel} style={styles.boxedInput} {...props} />;
}

export function BoxedTextArea(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMutedLabel}
      multiline
      style={[styles.boxedInput, styles.textArea]}
      {...props}
    />
  );
}

/** Borderless underline input, used for the big title fields at the top of each editor. */
export function TitleInput(props: TextInputProps & { fontSize?: number }) {
  const { fontSize = 26, style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={colors.textMutedLabel}
      style={[styles.titleInput, { fontSize, lineHeight: fontSize * 1.1 }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.textMutedLabel,
  },
  boxedInput: {
    borderWidth: 1,
    borderColor: colors.hairlineStrong,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: colors.ink,
    backgroundColor: colors.offWhite,
  },
  textArea: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  titleInput: {
    fontFamily: fonts.serif,
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineStrong,
    paddingBottom: 8,
  },
});
