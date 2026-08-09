import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import words from "../data/words.json";
import {
    blankSentence,
    buildContextOptions,
    pickRandomWord,
} from "../logic/contextQuiz";
import {
    getContextQuizHighScore,
    saveContextQuizScoreIfBetter,
} from "../logic/contextQuizHighScore";
import { getRarityStyle } from "../logic/rarity";
import AnimatedNumber from "./AnimatedNumber";
import PopIn from "./PopIn";
import PressableScale from "./PressableScale";
import RulesModal from "./RulesModal";

const ROUND_DURATION = 60;
const WORD_POOL = (words as any[]).filter(
  (w) => w.rarity === "rare" || w.rarity === "epic" || w.rarity === "legendary",
);

const RULES = [
  "A sentence is shown with its key word blanked out, pulled from rare, epic, and legendary words \u2014 not just words you've already caught.",
  "Pick which of the three words correctly fills the blank.",
  "This tests using a word in context, not just its dry definition \u2014 a different skill from your other quizzes.",
  "You have 60 seconds. Score is how many blanks you fill correctly.",
  "Your best score is saved.",
];

export default function ContextQuizCard() {
  const [highScore, setHighScore] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [phase, setPhase] = useState<"playing" | "feedback" | "results">(
    "playing",
  );
  const [currentWord, setCurrentWord] = useState<any | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      getContextQuizHighScore().then(setHighScore);
    }, []),
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function loadNextWord(exclude?: any) {
    const word = pickRandomWord(WORD_POOL, exclude);
    setCurrentWord(word);
    setOptions(buildContextOptions(word, WORD_POOL));
    setSelected(null);
  }

  function openGame() {
    setScore(0);
    setTimeLeft(ROUND_DURATION);
    setIsNewRecord(false);
    loadNextWord();
    setPhase("playing");
    setModalVisible(true);

    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  }

  async function endGame() {
    stopTimer();
    setPhase("results");
    const result = await saveContextQuizScoreIfBetter(score);
    setHighScore(result.highScore);
    setIsNewRecord(result.isNewRecord);
  }

  useEffect(() => {
    if (modalVisible && phase === "playing" && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, phase, modalVisible]);

  function handleSelect(option: string) {
    if (!currentWord || phase !== "playing") return;
    setSelected(option);

    if (option === currentWord.word) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore((s) => s + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setPhase("feedback");
    feedbackTimeoutRef.current = setTimeout(() => {
      loadNextWord(currentWord);
      setPhase("playing");
    }, 900);
  }

  function handleClose() {
    stopTimer();
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setModalVisible(false);
  }

  const blanked = currentWord
    ? blankSentence(currentWord.example, currentWord.word)
    : "";
  const rarity = currentWord ? getRarityStyle(currentWord.rarity) : null;

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
        <Text style={styles.gameIcon}>📝</Text>
        <Text style={styles.title}>Context Clues</Text>
        <Text style={styles.subtitle}>
          Fill the blank as many times as you can in 60 seconds
        </Text>

        <View style={styles.highScorePill}>
          <Text style={styles.highScoreText}>
            🏆 Best: {highScore ?? "..."}
          </Text>
        </View>

        <PressableScale style={styles.startButton} onPress={openGame}>
          <Text style={styles.startButtonText}>🚀 Play</Text>
        </PressableScale>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {(phase === "playing" || phase === "feedback") && currentWord && (
              <>
                <View style={styles.hud}>
                  <Text style={styles.scoreText}>Score: {score}</Text>
                  <Text
                    style={[
                      styles.hudTimer,
                      timeLeft <= 10 && { color: Colors.error },
                    ]}
                  >
                    ⏱ {timeLeft}s
                  </Text>
                </View>

                {rarity && (
                  <Text
                    style={[
                      styles.rarityBadge,
                      { color: rarity.color, borderColor: rarity.color },
                    ]}
                  >
                    {rarity.label}
                  </Text>
                )}

                <Text style={styles.sentence}>{blanked}</Text>

                {phase === "playing" && (
                  <>
                    <Text style={styles.prompt}>
                      Which word belongs in the blank?
                    </Text>
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

                {phase === "feedback" && (
                  <PopIn trigger={currentWord.word}>
                    <Text
                      style={[
                        styles.result,
                        {
                          color:
                            selected === currentWord.word
                              ? Colors.success
                              : Colors.error,
                        },
                      ]}
                    >
                      {selected === currentWord.word
                        ? "✅ Correct!"
                        : `❌ It was "${currentWord.word}"`}
                    </Text>
                  </PopIn>
                )}

                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>End Game</Text>
                </PressableScale>
              </>
            )}

            {phase === "results" && (
              <PopIn trigger="results" style={styles.resultsBox}>
                <Text style={styles.resultsTitle}>Time's Up!</Text>
                <AnimatedNumber value={score} style={styles.resultsScore} />
                <Text style={styles.resultsLabel}>correct</Text>

                {isNewRecord && (
                  <Text style={styles.newRecord}>🎉 New High Score!</Text>
                )}
                <Text style={styles.highScoreLine}>🏆 Best: {highScore}</Text>

                <PressableScale style={styles.startButton} onPress={openGame}>
                  <Text style={styles.startButtonText}>Play Again</Text>
                </PressableScale>
                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>Done</Text>
                </PressableScale>
              </PopIn>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <RulesModal
        visible={rulesVisible}
        onClose={() => setRulesVisible(false)}
        title="📝 Context Clues Rules"
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
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: Spacing.md,
  },
  scoreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.inkMuted,
  },
  hudTimer: { fontFamily: Fonts.bodySemiBold, fontSize: 18, color: Colors.ink },
  rarityBadge: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sentence: {
    fontFamily: Fonts.displayBold,
    fontSize: 19,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 27,
  },
  prompt: {
    fontFamily: Fonts.body,
    fontSize: 15,
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
    width: "100%",
  },
  optionText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.ink,
    textAlign: "center",
  },
  result: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  exitButton: { paddingVertical: 10, marginTop: Spacing.sm },
  exitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 13,
  },
  resultsBox: { alignItems: "center" },
  resultsTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  resultsScore: {
    fontFamily: Fonts.displayBold,
    fontSize: 64,
    color: Colors.accent,
  },
  resultsLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.lg,
  },
  newRecord: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  highScoreLine: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.inkMuted,
    marginBottom: Spacing.xl,
  },
});
