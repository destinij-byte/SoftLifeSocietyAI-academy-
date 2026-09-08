import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

/**
 * A module/lesson row in the admin editors, with reorder + remove controls.
 * Ported from the repeated `<sc-for list="{{ vm.modules }}">` / `{{ vm.lessons }}`
 * blocks in AdminScreen.dc.html's course and module editors.
 */
export function ReorderableRow({
  num,
  title,
  meta,
  onPress,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  num: string;
  title: string;
  meta: string;
  onPress: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.num}>{num}</Text>
      <Pressable style={styles.body} onPress={onPress}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
      </Pressable>
      <View style={styles.arrows}>
        <Pressable hitSlop={6} onPress={onMoveUp}>
          <Text style={styles.arrow}>↑</Text>
        </Pressable>
        <Pressable hitSlop={6} onPress={onMoveDown}>
          <Text style={styles.arrow}>↓</Text>
        </Pressable>
      </View>
      <Pressable hitSlop={6} onPress={onRemove}>
        <Text style={styles.remove}>Remove</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  num: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.gold,
    width: 20,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: fonts.sansMedium,
    fontSize: 13.5,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 10.5,
    color: colors.textMutedLabel,
    marginTop: 2,
  },
  arrows: {
    alignItems: 'center',
    gap: 2,
  },
  arrow: {
    fontSize: 10,
    color: colors.textMutedLabel,
    padding: 2,
  },
  remove: {
    fontSize: 10,
    color: colors.roseText,
    paddingLeft: 4,
  },
});
