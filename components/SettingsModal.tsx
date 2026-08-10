import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getCurrentUser, signOutUser } from "../logic/auth";
import {
    pullProgressFromCloud,
    pushProgressToCloud,
} from "../logic/fullProgressSync";
import {
    handleGoogleAuthResponse,
    useGoogleAuthRequest,
} from "../logic/googleAuth";
import {
    getDailyReminderEnabled,
    getHapticsEnabled,
    getShareStatsEnabled,
    getSoundEffectsEnabled,
    setDailyReminderEnabled,
    setHapticsEnabled,
    setShareStatsEnabled,
    setSoundEffectsEnabled,
} from "../logic/preferences";
import PressableScale from "./PressableScale";
import ProfileAndFriendsModal from "./ProfileAndFriendsModal";

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

function NavRow({
  icon,
  title,
  subtitle,
  onPress,
  badge,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  badge?: string;
}) {
  return (
    <PressableScale style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : (
        onPress && <Text style={styles.rowArrow}>→</Text>
      )}
    </PressableScale>
  );
}

export default function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const user = getCurrentUser();
  const [haptics, setHaptics] = useState(true);
  const [sound, setSound] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [shareStats, setShareStats] = useState(true);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [request, response, promptGoogleAuth] = useGoogleAuthRequest();

  useEffect(() => {
    if (response?.type === "success") {
      setConnectingGoogle(true);
      handleGoogleAuthResponse(response).then((result) => {
        setConnectingGoogle(false);
        if (result.success) {
          Alert.alert(
            "Connected!",
            result.linked
              ? "Your Google account is now linked — you can sign in with either method."
              : "Signed in with Google.",
          );
        } else {
          Alert.alert("Couldn't connect", result.error || "Unknown error");
        }
      });
    }
  }, [response]);

  async function handleConnectGoogle() {
    await promptGoogleAuth();
  }

  useEffect(() => {
    if (!visible) return;
    getHapticsEnabled().then(setHaptics);
    getSoundEffectsEnabled().then(setSound);
    getDailyReminderEnabled().then(setDailyReminder);
    getShareStatsEnabled().then(setShareStats);
  }, [visible]);

  async function toggleHaptics(v: boolean) {
    setHaptics(v);
    await setHapticsEnabled(v);
  }
  async function toggleSound(v: boolean) {
    setSound(v);
    await setSoundEffectsEnabled(v);
  }
  async function toggleReminder(v: boolean) {
    setDailyReminder(v);
    await setDailyReminderEnabled(v);
  }
  async function toggleShareStats(v: boolean) {
    setShareStats(v);
    await setShareStatsEnabled(v);
  }

  async function handleBackupNow() {
    if (!user) return;
    setBackingUp(true);
    const result = await pushProgressToCloud(user.uid);
    setBackingUp(false);
    if (result.success) {
      Alert.alert(
        "Backed up!",
        "Your progress has been saved to your account.",
      );
    } else {
      Alert.alert(
        "Backup failed",
        `${result.error}\n\nMake sure your Firestore security rules include the userProgress collection and have been published.`,
      );
    }
  }

  async function handleRestoreNow() {
    if (!user) return;
    Alert.alert(
      "Restore saved progress?",
      "This will replace the progress currently on this device. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            setRestoring(true);
            const result = await pullProgressFromCloud(user.uid);
            setRestoring(false);
            if (!result.success) {
              Alert.alert(
                "Restore failed",
                `${result.error}\n\nMake sure your Firestore security rules include the userProgress collection and have been published.`,
              );
            } else if (!result.found) {
              Alert.alert(
                "Nothing saved yet",
                "No backup was found for this account — try Backup Now first.",
              );
            } else {
              Alert.alert(
                "Restored!",
                "Please close and reopen the app so every screen reflects the update.",
              );
            }
          },
        },
      ],
    );
  }

  async function handleLogOut() {
    Alert.alert("Log out?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOutUser();
          onClose();
        },
      },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ Settings</Text>
            <PressableScale style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionLabel}>Preferences</Text>
            <View style={styles.card}>
              <SettingRow
                icon="📳"
                title="Haptic Feedback"
                subtitle="Vibration on taps and game results"
                value={haptics}
                onValueChange={toggleHaptics}
              />
              <SettingRow
                icon="🔊"
                title="Sound Effects"
                subtitle="Chimes and ambient sounds where available"
                value={sound}
                onValueChange={toggleSound}
              />
            </View>

            <Text style={styles.sectionLabel}>Notifications</Text>
            <View style={styles.card}>
              <SettingRow
                icon="🔔"
                title="Daily Reminder"
                subtitle="Preference saved for when push notifications launch"
                value={dailyReminder}
                onValueChange={toggleReminder}
              />
            </View>

            {user && (
              <>
                <Text style={styles.sectionLabel}>Profile</Text>
                <View style={styles.card}>
                  <NavRow
                    icon="🪪"
                    title="Edit Profile"
                    subtitle="Avatar, username, and stats sync"
                    onPress={() => setEditProfileVisible(true)}
                  />
                </View>

                <Text style={styles.sectionLabel}>Social Accounts</Text>
                <View style={styles.card}>
                  <NavRow
                    icon="🔗"
                    title="Google"
                    subtitle="Link Google so you can sign in either way"
                    onPress={connectingGoogle ? undefined : handleConnectGoogle}
                    badge={connectingGoogle ? "Connecting..." : undefined}
                  />
                  <NavRow icon="🔗" title="Apple" badge="Coming soon" />
                </View>

                <Text style={styles.sectionLabel}>Privacy</Text>
                <View style={styles.card}>
                  <SettingRow
                    icon="👁️"
                    title="Share Stats with Friends"
                    subtitle="Turning this off stops your stats from syncing at all"
                    value={shareStats}
                    onValueChange={toggleShareStats}
                  />
                </View>

                <Text style={styles.sectionLabel}>Data & Backup</Text>
                <View style={styles.card}>
                  <NavRow
                    icon="☁️"
                    title="Backup Now"
                    subtitle="Save everything on this device to your account"
                    onPress={backingUp ? undefined : handleBackupNow}
                  />
                  <NavRow
                    icon="⬇️"
                    title="Restore from Cloud"
                    subtitle="Replace this device's progress with your saved backup"
                    onPress={restoring ? undefined : handleRestoreNow}
                  />
                  {(backingUp || restoring) && (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color={Colors.accent} />
                    </View>
                  )}
                </View>

                <Text style={styles.sectionLabel}>Account</Text>
                <View style={styles.card}>
                  <PressableScale
                    style={styles.logOutRow}
                    onPress={handleLogOut}
                  >
                    <Text style={styles.logOutText}>Log Out</Text>
                  </PressableScale>
                </View>
              </>
            )}

            {!user && (
              <Text style={styles.loggedOutNote}>
                Log in or create an account to access Profile, Social Accounts,
                and Privacy settings.
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>

      <ProfileAndFriendsModal
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
      />
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
  title: { fontFamily: Fonts.displayBold, fontSize: 22, color: Colors.ink },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  scrollContent: { padding: Spacing.lg, paddingTop: 0, paddingBottom: 60 },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
    width: 26,
    textAlign: "center",
  },
  rowTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.ink },
  rowSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  rowArrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.accent,
  },
  badge: {
    backgroundColor: Colors.background,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.inkMuted,
  },
  loadingRow: { padding: Spacing.sm, alignItems: "center" },
  logOutRow: { padding: Spacing.md, alignItems: "center" },
  logOutText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.error,
  },
  loggedOutNote: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Spacing.xl,
  },
});
