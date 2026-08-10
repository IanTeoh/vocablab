import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import {
    DEFAULT_AVATARS,
    setDefaultAvatar,
    uploadAvatarImage,
} from "../logic/avatar";
import Avatar from "./Avatar";
import PressableScale from "./PressableScale";

export default function AvatarPicker({
  uid,
  profile,
  size = 72,
  onChanged,
}: {
  uid: string;
  profile: any;
  size?: number;
  onChanged: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handlePickDefault(avatarId: string) {
    await setDefaultAvatar(uid, avatarId);
    setPickerOpen(false);
    onChanged();
  }

  async function handleUpload() {
    setUploadError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      await uploadAvatarImage(uid, result.assets[0].uri);
      setPickerOpen(false);
      onChanged();
    } catch (error) {
      setUploadError(
        "Photo upload isn't available yet — pick one of the default avatars below for now.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <View>
      <PressableScale onPress={() => setPickerOpen(true)}>
        <View>
          <Avatar profile={profile} size={size} />
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeIcon}>✏️</Text>
          </View>
        </View>
      </PressableScale>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="none"
        onRequestClose={() => setPickerOpen(false)}
      >
        <PressableScale
          style={styles.overlay}
          onPress={() => setPickerOpen(false)}
        >
          <PressableScale style={styles.sheet} onPress={() => {}}>
            <Text style={styles.title}>Choose your avatar</Text>

            <View style={styles.grid}>
              {DEFAULT_AVATARS.map((a) => (
                <PressableScale
                  key={a.id}
                  style={styles.gridItem}
                  onPress={() => handlePickDefault(a.id)}
                >
                  <View
                    style={[styles.gridCircle, { backgroundColor: a.color }]}
                  >
                    <Text style={styles.gridEmoji}>{a.emoji}</Text>
                  </View>
                </PressableScale>
              ))}
            </View>

            <PressableScale
              style={styles.uploadButton}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.uploadButtonText}>📷 Upload a Photo</Text>
              )}
            </PressableScale>

            {uploadError && <Text style={styles.errorText}>{uploadError}</Text>}

            <PressableScale
              style={styles.cancelButton}
              onPress={() => setPickerOpen(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </PressableScale>
          </PressableScale>
        </PressableScale>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  editBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBadgeIcon: { fontSize: 11 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 340,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 18,
    color: Colors.ink,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  gridItem: { margin: 6 },
  gridCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  gridEmoji: { fontSize: 24 },
  uploadButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  uploadButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: "#fff",
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  cancelButton: { alignItems: "center", paddingVertical: 8 },
  cancelButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
});
