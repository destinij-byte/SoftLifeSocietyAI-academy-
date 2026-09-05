import React, { useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text } from "react-native";

import { academyApi } from "../api";
import { colors, fonts, radii, spacing } from "../theme";

interface WorkbookDownloadButtonProps {
  courseId: string;
}

export function WorkbookDownloadButton({ courseId }: WorkbookDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePress() {
    setLoading(true);
    try {
      const { download_url } = await academyApi.getWorkbook(courseId);
      await Linking.openURL(download_url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Pressable style={styles.button} onPress={handlePress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={colors.ivory} />
      ) : (
        <Text style={styles.label}>Download Workbook</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.gold,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.bodyBold,
    color: colors.ivory,
    fontSize: 15,
  },
});
