import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getCurrentUser } from "../logic/auth";
import { getFriendProfile, getFriendsList } from "../logic/friends";
import { gatherStatsSummary } from "../logic/profileSync";
import Avatar from "./Avatar";
import PressableScale from "./PressableScale";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const user = getCurrentUser();
  const [ranked, setRanked] = useState<any[] | null>(null);

  useEffect(() => {
    if (visible) loadLeaderboard();
  }, [visible]);

  async function loadLeaderboard() {
    setRanked(null);
    const [friends, myStats, myProfile] = await Promise.all([
      getFriendsList(),
      gatherStatsSummary(),
      user ? getFriendProfile(user.uid) : Promise.resolve(null),
    ]);

    const me = {
      uid: user?.uid,
      username: user?.displayName,
      avatarType: (myProfile as any)?.avatarType,
      avatarUrl: (myProfile as any)?.avatarUrl,
      avatarId: (myProfile as any)?.avatarId,
      isSelf: true,
      total:
        (myStats.wordsCollected || 0) +
        (myStats.idiomsCollected || 0) +
        (myStats.rootsCollected || 0),
    };

    const friendEntries = friends
      .filter((f) => f !== null)
      .map((f: any) => ({
        uid: f.uid,
        username: f.username,
        avatarType: f.avatarType,
        avatarUrl: f.avatarUrl,
        avatarId: f.avatarId,
        isSelf: false,
        total: f.stats
          ? (f.stats.wordsCollected || 0) +
            (f.stats.idiomsCollected || 0) +
            (f.stats.rootsCollected || 0)
          : 0,
      }));

    const combined = [me, ...friendEntries].sort((a, b) => b.total - a.total);
    setRanked(combined);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🏆 Leaderboard</Text>
            <PressableScale style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </View>
          <Text style={styles.subtitle}>
            Ranked by total words, idioms, and roots caught
          </Text>

          {!ranked ? (
            <ActivityIndicator
              color={Colors.accent}
              style={{ marginTop: Spacing.xl }}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {ranked.map((entry, index) => (
                <View
                  key={entry.uid || index}
                  style={[styles.row, entry.isSelf && styles.rowSelf]}
                >
                  <Text style={styles.rank}>
                    {MEDALS[index] || `#${index + 1}`}
                  </Text>
                  <Avatar profile={entry} size={40} />
                  <Text style={styles.username} numberOfLines={1}>
                    {entry.isSelf ? "You" : entry.username}
                  </Text>
                  <Text style={styles.total}>{entry.total}</Text>
                </View>
              ))}

              {ranked.length === 1 && (
                <Text style={styles.emptyText}>
                  Add some friends to see how you stack up!
                </Text>
              )}
            </ScrollView>
          )}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 22, color: Colors.ink },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    paddingHorizontal: Spacing.lg,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  rowSelf: { borderColor: Colors.accent, borderWidth: 2 },
  rank: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    width: 32,
    textAlign: "center",
  },
  username: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
    marginLeft: 10,
  },
  total: { fontFamily: Fonts.displayBold, fontSize: 18, color: Colors.accent },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
