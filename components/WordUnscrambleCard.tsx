import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getUnscrambleHighScore } from "../logic/unscrambleHighScore";
import PressableScale from "./PressableScale";
import RulesModal from "./RulesModal";

const RULES = [
  "You'll see the scrambled letters of a real word from your word bank (6\u20138 letters, to keep it fair).",
  "Type your best guess for the unscrambled word and hit Submit.",
  "Wrong guesses cost nothing \u2014 just try again.",
  "You get 3 hints per round (reveals the definition) and can skip a word if you're stuck \u2014 skipping shows you the answer.",
  "You have 60 seconds. Score is how many words you unscramble correctly.",
  "Your best score is saved and shown right on the card.",
];

export default function WordUnscrambleCard({ onPlay }: { onPlay: () => void }) {
  const [highScore, setHighScore] = useState<number | null>(null);
  const [rulesVisible, setRulesVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getUnscrambleHighScore().then(setHighScore);
    }, []),
  );

  return (
    <View style={styles.card}>
      <View style={styles.accentStripe} />
      <PressableScale
        style={styles.helpButton}
        onPress={() => setRulesVisible(true)}
      >
        <Text style={styles.helpButtonText}>?</Text>
      </PressableScale>
      <View style={styles.content}>
        <Text style={styles.gameIcon}>🔤</Text>
        <Text style={styles.title}>Word Unscramble</Text>
        <Text style={styles.subtitle}>
          Unscramble as many words as you can in 60 seconds
        </Text>

        <View style={styles.highScorePill}>
          <Text style={styles.highScoreText}>
            🏆 Best: {highScore ?? "..."}
          </Text>
        </View>

        <PressableScale style={styles.startButton} onPress={onPlay}>
          <Text style={styles.startButtonText}>🚀 Play</Text>
        </PressableScale>
      </View>

      <RulesModal
        visible={rulesVisible}
        onClose={() => setRulesVisible(false)}
        title="🔤 Word Unscramble Rules"
        rules={RULES}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  accentStripe: { height: 5, backgroundColor: Colors.accent },
  helpButton: {
    position: "absolute",
    top: 13,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  helpButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  content: { padding: Spacing.lg, alignItems: "center" },
  gameIcon: { fontSize: 30, marginBottom: Spacing.xs },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  highScorePill: {
    backgroundColor: Colors.background,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  highScoreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.accent,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
  },
  startButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
});
