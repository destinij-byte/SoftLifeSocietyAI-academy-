import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { academyApi } from "../api";
import type { AcademyStackParamList } from "../navigation/AcademyNavigator";
import { colors, fonts, radii, spacing, textTones } from "../theme";
import type { WorkbookResponse } from "../types";

type Nav = NativeStackNavigationProp<AcademyStackParamList, "Workbook">;
type Route = { params: AcademyStackParamList["Workbook"] };

export function WorkbookScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>() as Route;
  const { courseId } = route.params;

  const [workbook, setWorkbook] = useState<WorkbookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    academyApi
      .getWorkbook(courseId)
      .then(setWorkbook)
      .finally(() => setLoading(false));
  }, [courseId]);

  async function handleDownload() {
    if (!workbook) return;
    setDownloading(true);
    try {
      await Linking.openURL(workbook.download_url);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!workbook) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No workbook available for this course yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
        <Text style={styles.backArrow}>←</Text>
        <Text style={styles.backLabel}>Course workbook</Text>
      </Pressable>

      <View style={styles.heroRow}>
        <View style={styles.cover} />
        <View style={styles.heroText}>
          <Text style={styles.workbookTitle}>{workbook.title}</Text>
          {workbook.description ? (
            <Text style={styles.workbookDesc}>{workbook.description}</Text>
          ) : null}
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>PDF</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Printable</Text>
            </View>
          </View>
        </View>
      </View>

      <View>
        <Pressable style={styles.downloadButton} onPress={handleDownload} disabled={downloading}>
          {downloading ? (
            <ActivityIndicator color={colors.ivory} />
          ) : (
            <Text style={styles.downloadLabel}>↓  Download workbook</Text>
          )}
        </Pressable>
        <Text style={styles.downloadCaption}>
          Yours to keep{workbook.file_size_mb ? ` · ${workbook.file_size_mb.toFixed(1)} MB` : ""}
        </Text>
      </View>

      {workbook.sections.length > 0 ? (
        <View style={styles.insideSection}>
          <Text style={styles.eyebrow}>Inside</Text>
          {workbook.sections.map((section, i) => (
            <View key={`${section.title}-${i}`} style={styles.sectionRow}>
              <Text style={styles.sectionNum}>{String(i + 1).padStart(2, "0")}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.pages ? <Text style={styles.sectionPages}>{section.pages}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ivory,
    padding: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: textTones.secondary,
    textAlign: "center",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backArrow: {
    fontSize: 18,
    color: textTones.secondary,
  },
  backLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: textTones.label,
  },
  heroRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  cover: {
    width: 100,
    height: 132,
    borderRadius: 6,
    backgroundColor: colors.cream,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
  },
  workbookTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
    lineHeight: 27,
  },
  workbookDesc: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: textTones.secondary,
    lineHeight: 17,
  },
  tagRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: "rgba(217,166,166,0.24)",
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#8B5F5F",
  },
  downloadButton: {
    backgroundColor: colors.gold,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  downloadLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.ivory,
  },
  downloadCaption: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: textTones.label,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  insideSection: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: textTones.label,
    marginBottom: spacing.xs,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(43,37,33,0.08)",
  },
  sectionNum: {
    fontFamily: "ui-monospace, Menlo, monospace",
    fontSize: 11,
    color: colors.gold,
    width: 22,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  sectionPages: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: textTones.label,
  },
});
