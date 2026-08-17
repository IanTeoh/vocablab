import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Modal, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import words from "../data/words.json";
import {
    buildPlacementQuiz,
    PROFICIENCY_LEVELS,
    scorePlacementQuiz,
    setProficiencyLevel,
} from "../logic/proficiency";
import { buildQuizOptions } from "../logic/quiz";
import PressableScale from "./PressableScale";

export default function PlacementQuizModal({
  visible,
  onClose,
  onLevelSet,
}: {
  visible: boolean;
  onClose: () => void;
  onLevelSet: (level: string) => void;
}) {
  const [quiz, setQuiz] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<
    { rarity: string; correct: boolean }[]
  >([]);
  const [phase, setPhase] = useState<"intro" | "quiz" | "results">("intro");
  const [finalLevel, setFinalLevel] = useState<string | null>(null);

  function startQuiz() {
    const generated = buildPlacementQuiz(words as any[]);
    setQuiz(generated);
    setIndex(0);
    setResults([]);
    setSelected(null);
    setRevealed(false);
    setPhase("quiz");
  }

  function handleSelect(option: string) {
    if (revealed) return;
    const currentWord = quiz[index];
    const correct = option === currentWord.definition;
    setSelected(option);
    setRevealed(true);
    setResults((prev) => [...prev, { rarity: currentWord.rarity, correct }]);

    if (correct)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  async function handleNext() {
    if (index + 1 >= quiz.length) {
      const level = scorePlacementQuiz(results);
      await setProficiencyLevel(level);
      setFinalLevel(level);
      setPhase("results");
      onLevelSet(level);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  function handleClose() {
    setPhase("intro");
    onClose();
  }

  const currentWord = quiz[index];
  const options = currentWord
    ? buildQuizOptions(currentWord, words as any[])
    : [];
  const isCorrect = selected === currentWord?.definition;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {phase === "intro" && (
            <View style={styles.centerBox}>
              <Text style={styles.icon}>🎯</Text>
              <Text style={styles.title}>Placement Quiz</Text>
              <Text style={styles.subtitle}>
                12 quick questions spanning every difficulty tier. Your results
                set how challenging Word Adventure sessions are — you can retake
                this anytime as you improve.
              </Text>
              <PressableScale style={styles.primaryButton} onPress={startQuiz}>
                <Text style={styles.primaryButtonText}>Start Quiz</Text>
              </PressableScale>
              <PressableScale style={styles.textButton} onPress={handleClose}>
                <Text style={styles.textButtonText}>Maybe Later</Text>
              </PressableScale>
            </View>
          )}

          {phase === "quiz" && currentWord && (
            <>
              <Text style={styles.progressText}>
                {index + 1} of {quiz.length}
              </Text>
              <Text style={styles.word}>{currentWord.word}</Text>

              {!revealed && (
                <>
                  <Text style={styles.prompt}>What does this mean?</Text>
                  {options.map((option: string, i: number) => (
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
                    {isCorrect ? "✅ Correct!" : "❌ Not quite"}
                  </Text>
                  <Text style={styles.definition}>
                    {currentWord.definition}
                  </Text>
                  <PressableScale
                    style={styles.primaryButton}
                    onPress={handleNext}
                  >
                    <Text style={styles.primaryButtonText}>
                      {index + 1 >= quiz.length ? "See My Level" : "Next"}
                    </Text>
                  </PressableScale>
                </>
              )}
            </>
          )}

          {phase === "results" && finalLevel && (
            <View style={styles.centerBox}>
              <Text style={styles.icon}>🏆</Text>
              <Text style={styles.title}>
                You're at {PROFICIENCY_LEVELS[finalLevel].label}!
              </Text>
              <Text style={styles.subtitle}>
                Word Adventure sessions will now lean into words matched to this
                level. Improve over time and retake the quiz whenever you want a
                recalibration.
              </Text>
              <PressableScale
                style={styles.primaryButton}
                onPress={handleClose}
              >
                <Text style={styles.primaryButtonText}>Done</Text>
              </PressableScale>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.lg, justifyContent: "center" },
  centerBox: { alignItems: "center" },
  icon: { fontSize: 44, marginBottom: Spacing.sm },
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
    paddingHorizontal: Spacing.sm,
  },
  progressText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  word: {
    fontFamily: Fonts.displayBold,
    fontSize: 32,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.lg,
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
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  textButton: { paddingVertical: 12, marginTop: Spacing.xs },
  textButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 13,
  },
});
