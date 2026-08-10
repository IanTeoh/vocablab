import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { signIn, signUp } from "../logic/auth";
import {
    hasCloudProgress,
    pullProgressFromCloud,
    pushProgressToCloud,
} from "../logic/fullProgressSync";
import { syncStatsToCloud } from "../logic/profileSync";
import PressableScale from "./PressableScale";

export default function AuthModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setEmail("");
    setPassword("");
    setUsername("");
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    setError(null);
    if (
      !email.trim() ||
      !password.trim() ||
      (mode === "signup" && !username.trim())
    ) {
      setError("Please fill in every field.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      const result = await signUp(email.trim(), password, username.trim());
      if (!result.success) {
        setLoading(false);
        setError(result.error);
        return;
      }
      await pushProgressToCloud(result.user.uid);
      await syncStatsToCloud(result.user.uid);
      setLoading(false);
      resetAndClose();
      return;
    }

    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    resetAndClose();

    const hasSaved = await hasCloudProgress(result.user.uid);
    if (hasSaved) {
      Alert.alert(
        "Load saved progress?",
        `This will replace the progress currently on this device with ${result.user.displayName}'s saved progress. This can't be undone.`,
        [
          { text: "Keep device progress", style: "cancel" },
          {
            text: "Load saved progress",
            style: "destructive",
            onPress: async () => {
              const restoreResult = await pullProgressFromCloud(
                result.user.uid,
              );
              if (!restoreResult.success) {
                Alert.alert(
                  "Restore failed",
                  restoreResult.error || "Unknown error",
                );
              } else {
                Alert.alert(
                  "Progress restored!",
                  "Please close and reopen the app so every screen reflects the update.",
                );
              }
            },
          },
        ],
      );
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.header}>
              <PressableScale
                style={styles.closeButton}
                onPress={resetAndClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </PressableScale>
            </View>

            <View style={styles.content}>
              <Text style={styles.icon}>👤</Text>
              <Text style={styles.title}>
                {mode === "signup" ? "Create your account" : "Welcome back"}
              </Text>
              <Text style={styles.subtitle}>
                Optional — your progress is saved locally either way. An account
                lets you back up your progress and add friends.
              </Text>

              <View style={styles.modeToggle}>
                <PressableScale
                  style={[
                    styles.modeButton,
                    mode === "login" && styles.modeButtonActive,
                  ]}
                  onPress={() => setMode("login")}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === "login" && styles.modeButtonTextActive,
                    ]}
                  >
                    Log In
                  </Text>
                </PressableScale>
                <PressableScale
                  style={[
                    styles.modeButton,
                    mode === "signup" && styles.modeButtonActive,
                  ]}
                  onPress={() => setMode("signup")}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      mode === "signup" && styles.modeButtonTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </PressableScale>
              </View>

              {mode === "signup" && (
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={Colors.inkMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.inkMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.inkMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <PressableScale
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === "signup" ? "Create Account" : "Log In"}
                  </Text>
                )}
              </PressableScale>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  content: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.md },
  icon: { fontSize: 44, textAlign: "center", marginBottom: Spacing.sm },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modeToggle: { flexDirection: "row", marginBottom: Spacing.lg },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: Radius.pill,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  modeButtonTextActive: { color: "#fff" },
  input: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  submitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
});
