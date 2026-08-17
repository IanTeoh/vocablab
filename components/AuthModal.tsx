import * as AppleAuthentication from "expo-apple-authentication";
import { useEffect, useState } from "react";
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
import { isAppleAuthAvailable, signInWithApple } from "../logic/appleAuth";
import { sendPasswordReset, signIn, signUp } from "../logic/auth";
import {
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
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (Platform.OS === "ios") {
      isAppleAuthAvailable().then(setAppleAvailable);
    }
  }, []);

  function resetAndClose() {
    setEmail("");
    setPassword("");
    setUsername("");
    setError(null);
    setResetSent(false);
    setMode("login");
    onClose();
  }

  async function handlePostLogin(user: any) {
    resetAndClose();

    const restoreResult = await pullProgressFromCloud(user.uid);
    if (!restoreResult.success) {
      Alert.alert(
        "Couldn't load your progress",
        `${restoreResult.error || "Unknown error"}\n\nIf this keeps happening, double-check your Firestore security rules include the userProgress collection and have been published.`,
      );
    } else if (restoreResult.found) {
      Alert.alert(
        "Welcome back!",
        "Your saved progress has been loaded. Please close and reopen the app so every screen reflects it.",
      );
    } else {
      Alert.alert(
        "Welcome!",
        "Starting fresh with this account. Please close and reopen the app.",
      );
    }
  }

  async function handleAppleSignIn() {
    setError(null);
    setLoading(true);
    const result = await signInWithApple();
    setLoading(false);

    if (result.canceled) return;
    if (!result.success) {
      setError(result.error || "Couldn't sign in with Apple.");
      return;
    }

    if (result.linked) {
      // Was already signed in — no progress change, just close.
      resetAndClose();
      return;
    }

    await handlePostLogin(result.user);
  }

  async function handleSendReset() {
    setError(null);
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setLoading(true);
    const result = await sendPasswordReset(email.trim());
    setLoading(false);
    if (result.success) {
      setResetSent(true);
    } else {
      setError(result.error);
    }
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

    await handlePostLogin(result.user);
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
                {mode === "signup"
                  ? "Create your account"
                  : mode === "reset"
                    ? "Reset password"
                    : "Welcome back"}
              </Text>

              {mode === "reset" ? (
                <>
                  <Text style={styles.subtitle}>
                    Enter your email and we'll send you a link to reset your
                    password.
                  </Text>

                  {resetSent ? (
                    <Text style={styles.successText}>
                      If an account exists for that email, a reset link is on
                      its way. Check your inbox.
                    </Text>
                  ) : (
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
                  )}

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  {!resetSent && (
                    <PressableScale
                      style={styles.submitButton}
                      onPress={handleSendReset}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          Send Reset Email
                        </Text>
                      )}
                    </PressableScale>
                  )}

                  <PressableScale
                    style={styles.backToLoginButton}
                    onPress={() => {
                      setMode("login");
                      setResetSent(false);
                      setError(null);
                    }}
                  >
                    <Text style={styles.backToLoginText}>← Back to Log In</Text>
                  </PressableScale>
                </>
              ) : (
                <>
                  <Text style={styles.subtitle}>
                    Optional — your progress is saved locally either way. An
                    account lets you back up your progress and add friends.
                  </Text>

                  {appleAvailable && (
                    <>
                      <AppleAuthentication.AppleAuthenticationButton
                        buttonType={
                          AppleAuthentication.AppleAuthenticationButtonType
                            .CONTINUE
                        }
                        buttonStyle={
                          AppleAuthentication.AppleAuthenticationButtonStyle
                            .BLACK
                        }
                        cornerRadius={999}
                        style={styles.appleButton}
                        onPress={handleAppleSignIn}
                      />
                      <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                      </View>
                    </>
                  )}

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

                  {mode === "login" && (
                    <PressableScale
                      style={styles.forgotPasswordButton}
                      onPress={() => {
                        setMode("reset");
                        setError(null);
                      }}
                    >
                      <Text style={styles.forgotPasswordText}>
                        Forgot password?
                      </Text>
                    </PressableScale>
                  )}

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
                </>
              )}
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
    marginBottom: Spacing.lg,
  },
  successText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.success,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  appleButton: { width: "100%", height: 48, marginBottom: Spacing.md },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginHorizontal: 10,
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.accent,
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
  backToLoginButton: { alignItems: "center", paddingVertical: Spacing.md },
  backToLoginText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
});
