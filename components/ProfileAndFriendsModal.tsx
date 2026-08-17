import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getCurrentUser, updateUsername } from "../logic/auth";
import { getFriendProfile } from "../logic/friends";
import AvatarPicker from "./AvatarPicker";
import PressableScale from "./PressableScale";

export default function ProfileAndFriendsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const user = getCurrentUser();
  const [myProfile, setMyProfile] = useState<any>(null);
  const [username, setUsername] = useState(user?.displayName || "");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameSaved, setUsernameSaved] = useState(false);

  useEffect(() => {
    if (visible) loadProfile();
  }, [visible]);

  async function loadProfile() {
    if (!user) return;
    const profile = await getFriendProfile(user.uid);
    setMyProfile(profile);
    setUsername(user.displayName || "");
  }

  async function handleSaveUsername() {
    if (!username.trim() || username.trim() === user?.displayName) return;
    setSavingUsername(true);
    const result = await updateUsername(username.trim());
    setSavingUsername(false);
    if (result.success) {
      setUsernameSaved(true);
      setTimeout(() => setUsernameSaved(false), 1800);
    }
  }

  if (!user) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>✏️ Edit Profile</Text>
            <PressableScale style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.avatarSection}>
              <AvatarPicker
                uid={user.uid}
                profile={myProfile}
                size={88}
                onChanged={loadProfile}
              />
            </View>

            <Text style={styles.label}>Username</Text>
            <View style={styles.usernameRow}>
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <PressableScale
                style={styles.saveButton}
                onPress={handleSaveUsername}
                disabled={savingUsername}
              >
                {savingUsername ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {usernameSaved ? "✓ Saved" : "Save"}
                  </Text>
                )}
              </PressableScale>
            </View>

            <Text style={styles.autoSyncNote}>
              Your progress and stats sync automatically in the background.
            </Text>
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
  title: { fontFamily: Fonts.displayBold, fontSize: 22, color: Colors.ink },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  scrollContent: { padding: Spacing.lg, paddingTop: 0 },
  avatarSection: { alignItems: "center", marginBottom: Spacing.lg },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  usernameRow: { flexDirection: "row", marginBottom: Spacing.md },
  usernameInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: "#fff",
  },
  autoSyncNote: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});
