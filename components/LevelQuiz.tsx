import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { addWordToDictionary } from "../logic/dictionary";
import { buildQuizOptions } from "../logic/quiz";
import { getRarityStyle } from "../logic/rarity";
import PressableScale from "./PressableScale";

type LevelQuizProps = {
  level: { id: number; words: any[] };
  livesLeft: number;
  onLoseLife: () => Promise<number>;
  onLevelComplete: () => void;
  onOutOfLives: () => void;
  onExit: () => void;
};

export default function LevelQuiz({
  level,
  livesLeft,
  onLoseLife,
  onLevelComplete,
  onOutOfLives,
  onExit,
}: LevelQuizProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const currentWord = level.words[wordIndex];
  const options = useMemo(
    () => buildQuizOptions(currentWord),
    [currentWord.word],
  );
  const rarity = getRarityStyle(currentWord.rarity);
  const isCorrect = selected === currentWord.definition;
  const isLastWord = wordIndex === level.words.length - 1;

  async function handleSelect(option: string) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);

    if (option === currentWord.definition) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await addWordToDictionary(currentWord);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const remaining = await onLoseLife();

      if (remaining <= 0) {
        setTimeout(() => onOutOfLives(), 1200);
      } else {
        setTimeout(() => onExit(), 1200);
      }
    }
  }

  function handleContinue() {
    if (isLastWord) {
      onLevelComplete();
    } else {
      setWordIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.levelLabel}>Level {level.id}</Text>
        <Text style={styles.livesText}>
          {"❤️".repeat(livesLeft)}
          {"🖤".repeat(Math.max(0, 3 - livesLeft))}
        </Text>
      </View>

      <Text style={styles.progressText}>
        Word {wordIndex + 1} of {level.words.length}
      </Text>

      <Text style={styles.word}>{currentWord.word}</Text>
      <Text
        style={[
          styles.rarityBadge,
          { color: rarity.color, borderColor: rarity.color },
        ]}
      >
        {rarity.label}
      </Text>

      {!revealed && (
        <>
          <Text style={styles.prompt}>What does this word mean?</Text>
          {options.map((option, i) => (
            <PressableScale
              key={i}
              style={styles.option}
              onPress={() => handleSelect(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </PressableScale>
          ))}
        </>
      )}

      {revealed && (
        <>
          <Text
            style={[
              styles.result,
              { color: isCorrect ? Colors.success : Colors.error },
            ]}
          >
            {isCorrect ? "✅ Correct!" : `❌ Not quite (-1 life)`}
          </Text>
          <Text style={styles.definition}>{currentWord.definition}</Text>

          {isCorrect && livesLeft > 0 && (
            <PressableScale
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                {isLastWord ? "Finish Level" : "Next Word"}
              </Text>
            </PressableScale>
          )}
        </>
      )}

      <PressableScale style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitButtonText}>Exit Level</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, justifyContent: "center" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  levelLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    textTransform: "uppercase",
  },
  livesText: { fontSize: 16 },
  progressText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  word: {
    fontFamily: Fonts.displayBold,
    fontSize: 36,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  rarityBadge: {
    alignSelf: "center",
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: Spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  prompt: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  option: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 16,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  optionText: { fontFamily: Fonts.body, fontSize: 16, color: Colors.ink },
  result: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  definition: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.ink,
    marginBottom: Spacing.lg,
    textAlign: "center",
    lineHeight: 22,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  continueButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  exitButton: { paddingVertical: 10, alignItems: "center" },
  exitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 13,
  },
});
