import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import {
    evaluateAchievements,
    gatherAchievementStats,
} from "../logic/achievements";
import PressableScale from "./PressableScale";

const GROUP_LABELS: Record<string, string> = {
  words_total: "Vocabulary",
  words_rarity: "Vocabulary",
  idioms_total: "Idioms",
  roots_total: "Roots",
  streak_longest: "Streaks",
  idiomoji_score: "Idiomoji",
  derivatives_score: "Root Derivatives",
  loanword_score: "Guess the Origin",
  category_complete: "Completion",
  idioms_complete: "Completion",
  roots_complete: "Completion",
  all_complete: "Completion",
};

const GROUP_ORDER = [
  "Vocabulary",
  "Idioms",
  "Roots",
  "Streaks",
  "Idiomoji",
  "Root Derivatives",
  "Guess the Origin",
  "Completion",
];

export default function AchievementsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [achievements, setAchievements] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (visible) {
        gatherAchievementStats().then((stats) => {
          setAchievements(evaluateAchievements(stats));
        });
      }
    }, [visible]),
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const grouped: Record<string, any[]> = {};
  achievements.forEach((a) => {
    const group = GROUP_LABELS[a.type] || "Other";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(a);
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Achievements</Text>
          <Text style={styles.subtitle}>
            {unlockedCount} / {achievements.length} unlocked
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {GROUP_ORDER.filter((g) => grouped[g]).map((group) => (
            <View key={group} style={styles.section}>
              <Text style={styles.sectionTitle}>{group}</Text>
              {grouped[group].map((a) => (
                <View
                  key={a.id}
                  style={[
                    styles.row,
                    a.unlocked ? styles.rowUnlocked : styles.rowLocked,
                  ]}
                >
                  <Text style={styles.rowIcon}>
                    {a.unlocked ? a.icon : "🔒"}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.rowTitle,
                        a.unlocked
                          ? { color: Colors.ink }
                          : { color: Colors.inkMuted },
                      ]}
                    >
                      {a.unlocked ? a.title : "???"}
                    </Text>
                    <Text style={styles.rowDescription}>{a.description}</Text>
                  </View>
                  {a.unlocked && <Text style={styles.checkmark}>✅</Text>}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <PressableScale style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </PressableScale>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontFamily: Fonts.displayBold, fontSize: 26, color: Colors.ink },
  subtitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.accent,
    marginTop: 4,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 40,
  },
  section: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: 8,
    borderWidth: 1,
  },
  rowUnlocked: { borderColor: Colors.accent },
  rowLocked: { borderColor: Colors.border },
  rowIcon: {
    fontSize: 26,
    marginRight: Spacing.sm,
    width: 34,
    textAlign: "center",
  },
  rowTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 14 },
  rowDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  checkmark: { fontSize: 16, marginLeft: Spacing.xs },
  footer: { padding: Spacing.lg, paddingTop: 0 },
  closeButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 14,
  },
});
