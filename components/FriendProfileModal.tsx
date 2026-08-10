import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import PressableScale from "./PressableScale";

export default function FriendProfileModal({
  visible,
  friend,
  onClose,
  onRemove,
}: {
  visible: boolean;
  friend: any;
  onClose: () => void;
  onRemove: (uid: string) => void;
}) {
  if (!friend) return null;
  const stats = friend.stats || {};

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>👤 {friend.username}</Text>
            <PressableScale style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {!friend.stats ? (
              <Text style={styles.noStatsText}>
                {friend.username} hasn't synced their stats yet.
              </Text>
            ) : (
              <>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.longestStreak ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>🔥 Best Streak</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.wordsCollected ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>Words Caught</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.idiomsCollected ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>💬 Idioms Caught</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.rootsCollected ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>🌱 Roots Caught</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.achievementsUnlocked ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>🏆 Achievements</Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Game High Scores</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.idiomojiHighScore ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>🎮 Idiomoji</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.derivativesHighScore ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>🧩 Derivatives</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.loanwordHighScore ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>🌍 Origins</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.unscrambleHighScore ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>🔤 Unscramble</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statNumber}>
                      {stats.contextQuizHighScore ?? 0}
                    </Text>
                    <Text style={styles.statLabel}>📝 Context Clues</Text>
                  </View>
                </View>
              </>
            )}

            <PressableScale
              style={styles.removeButton}
              onPress={() => onRemove(friend.uid)}
            >
              <Text style={styles.removeButtonText}>Remove Friend</Text>
            </PressableScale>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 24, color: Colors.ink },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  scrollContent: { padding: Spacing.lg, paddingTop: 0 },
  noStatsText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap" },
  statBox: {
    width: "31%",
    margin: "1.16%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.accent,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 4,
    textAlign: "center",
  },
  removeButton: { alignItems: "center", paddingVertical: Spacing.lg },
  removeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.error,
  },
});
