import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundPattern from "../../components/BackgroundPattern";
import { Colors, Fonts, Spacing } from "../../constants/theme";

export default function ComingSoon() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BackgroundPattern />
      <Text style={styles.emoji}>🚧</Text>
      <Text style={styles.title}>More coming soon</Text>
      <Text style={styles.subtitle}>
        Word duels and minigames are on the way.
      </Text>
    </SafeAreaView>
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
