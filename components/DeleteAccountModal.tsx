import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { deleteAccount } from "../logic/auth";
import PressableScale from "./PressableScale";

export default function DeleteAccountModal({
  visible,
  onClose,
  onDeleted,
}: {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setPassword("");
    setConfirmText("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleDelete() {
    setError(null);
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setError('Type "DELETE" to confirm.');
      return;
    }
    if (!password.trim()) {
      setError("Enter your password to confirm.");
      return;
    }

    setLoading(true);
    const result = await deleteAccount(password);
    setLoading(false);

    if (result.success) {
      reset();
      onDeleted();
    } else {
      setError(result.error || "Something went wrong.");
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Delete Account</Text>
            <PressableScale style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </PressableScale>
          </View>

          <View style={styles.content}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningTitle}>This can't be undone</Text>
            <Text style={styles.warningText}>
              Deleting your account permanently removes your profile, friend
              connections, and cloud-backed progress. Progress currently on this
              device will also be cleared. This cannot be recovered.
            </Text>

            <Text style={styles.label}>Confirm your password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.inkMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>Type DELETE to confirm</Text>
            <TextInput
              style={styles.input}
              placeholder="DELETE"
              placeholderTextColor={Colors.inkMuted}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <PressableScale
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteButtonText}>
                  Permanently Delete My Account
                </Text>
              )}
            </PressableScale>
          </View>
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
  title: { fontFamily: Fonts.displayBold, fontSize: 20, color: Colors.error },
  closeButton: { paddingVertical: 8, paddingHorizontal: 4 },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  content: { paddingHorizontal: Spacing.lg },
  warningIcon: { fontSize: 40, textAlign: "center", marginBottom: Spacing.sm },
  warningTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  warningText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.error,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  deleteButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 15,
  },
});
