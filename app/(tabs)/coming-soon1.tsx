import BackgroundPattern from "@/components/BackgroundPattern";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Spacing } from "../../constants/theme";

export default function ComingSoon1() {
  return (
    <View style={styles.container}>
      <BackgroundPattern />
      <Text style={styles.emoji}>🌱</Text>
      <Text style={styles.title}>More coming soon</Text>
      <Text style={styles.subtitle}>A new way to learn is on the way.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  emoji: { fontSize: 48, marginBottom: Spacing.sm },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: "center",
  },
});
