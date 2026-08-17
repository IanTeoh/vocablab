import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { blockUser, reportUser } from "../logic/moderation";
import PressableScale from "./PressableScale";

const REPORT_REASONS = [
  "Inappropriate username",
  "Inappropriate photo",
  "Harassment",
  "Other",
];

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
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [reportNote, setReportNote] = useState("");

  if (!friend) return null;
  const stats = friend.stats || {};

  async function handleBlock() {
    Alert.alert(
      "Block this person?",
      `You won't see ${friend.username} in search, and they won't be able to send you friend requests. This also removes them as a friend.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            await blockUser(friend.uid, friend.username);
            onClose();
          },
        },
      ],
    );
  }

  async function handleSubmitReport() {
    if (!reportReason) return;
    const reason = reportNote.trim()
      ? `${reportReason}: ${reportNote.trim()}`
      : reportReason;
    const result = await reportUser(friend.uid, friend.username, reason);
    setReportVisible(false);
    setReportReason(null);
    setReportNote("");
    Alert.alert(
      result.success ? "Report submitted" : "Couldn't submit report",
      result.success ? "Thanks for letting us know." : result.error,
    );
  }

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

            {!reportVisible ? (
              <View style={styles.safetyRow}>
                <PressableScale
                  style={styles.safetyButton}
                  onPress={() => setReportVisible(true)}
                >
                  <Text style={styles.safetyButtonText}>🚩 Report</Text>
                </PressableScale>
                <PressableScale
                  style={styles.safetyButton}
                  onPress={handleBlock}
                >
                  <Text style={styles.safetyButtonText}>🚫 Block</Text>
                </PressableScale>
              </View>
            ) : (
              <View style={styles.reportBox}>
                <Text style={styles.reportTitle}>
                  Why are you reporting {friend.username}?
                </Text>
                {REPORT_REASONS.map((reason) => (
                  <PressableScale
                    key={reason}
                    style={[
                      styles.reasonOption,
                      reportReason === reason && styles.reasonOptionSelected,
                    ]}
                    onPress={() => setReportReason(reason)}
                  >
                    <Text
                      style={[
                        styles.reasonOptionText,
                        reportReason === reason &&
                          styles.reasonOptionTextSelected,
                      ]}
                    >
                      {reason}
                    </Text>
                  </PressableScale>
                ))}
                <TextInput
                  style={styles.reportNoteInput}
                  placeholder="Add details (optional)"
                  placeholderTextColor={Colors.inkMuted}
                  value={reportNote}
                  onChangeText={setReportNote}
                  multiline
                />
                <View style={styles.safetyRow}>
                  <PressableScale
                    style={styles.reportCancelButton}
                    onPress={() => {
                      setReportVisible(false);
                      setReportReason(null);
                    }}
                  >
                    <Text style={styles.reportCancelText}>Cancel</Text>
                  </PressableScale>
                  <PressableScale
                    style={[
                      styles.reportSubmitButton,
                      !reportReason && { opacity: 0.5 },
                    ]}
                    onPress={handleSubmitReport}
                  >
                    <Text style={styles.reportSubmitText}>Submit</Text>
                  </PressableScale>
                </View>
              </View>
            )}
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
  safetyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: Spacing.lg,
  },
  safetyButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  safetyButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  reportBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  reportTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  reasonOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: 6,
  },
  reasonOptionSelected: {
    borderColor: Colors.error,
    backgroundColor: Colors.background,
  },
  reasonOptionText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.ink },
  reasonOptionTextSelected: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.error,
  },
  reportNoteInput: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.ink,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 6,
    marginBottom: Spacing.sm,
    minHeight: 60,
    textAlignVertical: "top",
  },
  reportCancelButton: { paddingVertical: 10, paddingHorizontal: 16 },
  reportCancelText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  reportSubmitButton: {
    backgroundColor: Colors.error,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  reportSubmitText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: "#fff",
  },
});
