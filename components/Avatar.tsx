import { Image, StyleSheet, Text, View } from "react-native";
import { getDefaultAvatar } from "../logic/avatar";

export default function Avatar({
  profile,
  size = 48,
}: {
  profile: any;
  size?: number;
}) {
  if (profile?.avatarType === "upload" && profile?.avatarUrl) {
    return (
      <Image
        source={{ uri: profile.avatarUrl }}
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  const defaultAvatar = getDefaultAvatar(profile?.avatarId);
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: defaultAvatar.color,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{defaultAvatar.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { overflow: "hidden" },
});
