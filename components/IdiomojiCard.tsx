import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getIdiomojiHighScore } from "../logic/idiomojiHighScore";
import PressableScale from "./PressableScale";
import RulesModal from "./RulesModal";

const RULES = [
  "Guess the idiom from the emoji clues and the blank-letter pattern.",
  "You have 120 seconds and 3 lives for the whole game.",
  "A wrong guess costs a life. The game ends when time or lives run out.",
  "Stuck on one idiom? A random letter reveals itself the longer you wait.",
  "You get 3 hints per game — each one reveals the idiom's definition.",
  "Play as many times as you like. Your best score is saved.",
];

export default function IdiomojiCard({
  onPlay,
  refreshKey,
}: {
  onPlay: () => void;
  refreshKey?: number;
}) {
  const [highScore, setHighScore] = useState<number | null>(null);
  const [rulesVisible, setRulesVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getIdiomojiHighScore().then(setHighScore);
    }, []),
  );

  useEffect(() => {
    getIdiomojiHighScore().then(setHighScore);
  }, [refreshKey]);

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
        <Text style={styles.gameIcon}>🎮</Text>
        <Text style={styles.title}>Idiomoji</Text>
        <Text style={styles.subtitle}>
          Guess as many idioms as you can before time runs out.
        </Text>

        <View style={styles.highScorePill}>
          <Text style={styles.highScoreText}>
            🏆 Best: {highScore ?? "..."}
          </Text>
        </View>

        <PressableScale style={styles.startButton} onPress={onPlay}>
          <Text style={styles.startButtonText}>🚀 Play Idiomoji!</Text>
        </PressableScale>
      </View>

      <RulesModal
        visible={rulesVisible}
        onClose={() => setRulesVisible(false)}
        title="🎮 Idiomoji Rules"
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
  accentStripe: {
    height: 5,
    backgroundColor: Colors.accent,
  },
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
  content: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  gameIcon: { fontSize: 32, marginBottom: Spacing.xs },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
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
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
  },
  startButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
});
