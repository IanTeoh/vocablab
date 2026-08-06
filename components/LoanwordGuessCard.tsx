import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import allLoanwords from "../data/loanwords.json";
import {
  getLoanwordHighScore,
  saveLoanwordScoreIfBetter,
} from "../logic/loanwordHighScore";
import {
  buildLoanwordOptions,
  pickRandomLoanword,
} from "../logic/loanwordQuiz";
import PressableScale from "./PressableScale";

const PLAY_DURATION = 60;
const PLAY_LIVES = 3;

type Mode = "learn" | "play";
type PlayPhase = "playing" | "feedback" | "gameover";

export default function LoanwordGuessCard() {
  const [highScore, setHighScore] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("learn");

  // Shared quiz state
  const [currentWord, setCurrentWord] = useState<any | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Play-mode-only state
  const [playPhase, setPlayPhase] = useState<PlayPhase>("playing");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(PLAY_LIVES);
  const [timeLeft, setTimeLeft] = useState(PLAY_DURATION);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      getLoanwordHighScore().then(setHighScore);
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

  function loadWord(exclude?: any) {
    const word = pickRandomLoanword(allLoanwords as any[], exclude);
    setCurrentWord(word);
    setOptions(buildLoanwordOptions(word, allLoanwords as any[]));
    setSelected(null);
    setRevealed(false);
    return word;
  }

  // --- Learn mode ---
  function openLearn() {
    setMode("learn");
    loadWord();
    setModalVisible(true);
  }

  function handleLearnSelect(option: string) {
    if (revealed || !currentWord) return;
    setSelected(option);
    setRevealed(true);
    if (option === currentWord.origin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleLearnNext() {
    loadWord(currentWord);
  }

  // --- Play mode ---
  function openPlay() {
    setMode("play");
    setScore(0);
    setLives(PLAY_LIVES);
    setTimeLeft(PLAY_DURATION);
    setIsNewRecord(false);
    loadWord();
    setPlayPhase("playing");
    setModalVisible(true);

    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  }

  async function endPlayGame() {
    stopTimer();
    setPlayPhase("gameover");
    const result = await saveLoanwordScoreIfBetter(score);
    setHighScore(result.highScore);
    setIsNewRecord(result.isNewRecord);
  }

  useEffect(() => {
    if (mode === "play" && playPhase === "playing" && timeLeft === 0) {
      endPlayGame();
    }
  }, [timeLeft, playPhase, mode]);

  function handlePlaySelect(option: string) {
    if (!currentWord || playPhase !== "playing") return;
    setSelected(option);
    setRevealed(true);

    if (option === currentWord.origin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore((s) => s + 1);
      setPlayPhase("feedback");
      feedbackTimeoutRef.current = setTimeout(() => nextPlayRound(), 500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setPlayPhase("feedback");
      feedbackTimeoutRef.current = setTimeout(() => {
        if (remainingLives <= 0) {
          endPlayGame();
        } else {
          nextPlayRound();
        }
      }, 1100);
    }
  }

  function nextPlayRound() {
    loadWord(currentWord);
    setPlayPhase("playing");
  }

  function handleClose() {
    stopTimer();
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setModalVisible(false);
  }

  const isCorrect = selected === currentWord?.origin;

  return (
    <View style={styles.card}>
      <View style={styles.accentStripe} />
      <View style={styles.content}>
        <Text style={styles.gameIcon}>🌍</Text>
        <Text style={styles.title}>Guess the Origin</Text>
        <Text style={styles.subtitle}>
          Where did this borrowed English word actually come from?
        </Text>

        <View style={styles.highScorePill}>
          <Text style={styles.highScoreText}>
            🏆 Best: {highScore ?? "..."}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <PressableScale
            style={[styles.modeButton, styles.learnButton]}
            onPress={openLearn}
          >
            <Text style={styles.modeButtonText}>📖 Learn</Text>
          </PressableScale>
          <PressableScale
            style={[styles.modeButton, styles.playButton]}
            onPress={openPlay}
          >
            <Text style={styles.modeButtonText}>🎮 Play</Text>
          </PressableScale>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {mode === "learn" && currentWord && (
              <>
                <Text style={styles.modalIcon}>{currentWord.icon}</Text>
                <Text style={styles.modalWord}>{currentWord.word}</Text>

                {!revealed && (
                  <>
                    <Text style={styles.prompt}>
                      Which language does this word come from?
                    </Text>
                    {options.map((option, i) => (
                      <PressableScale
                        key={i}
                        style={styles.option}
                        onPress={() => handleLearnSelect(option)}
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
                    {!isCorrect && (
                      <Text style={styles.yourAnswer}>
                        You selected: {selected}
                      </Text>
                    )}
                    <Text style={styles.originText}>{currentWord.origin}</Text>
                    <Text style={styles.reason}>{currentWord.reason}</Text>
                    <PressableScale
                      style={styles.nextButton}
                      onPress={handleLearnNext}
                    >
                      <Text style={styles.nextButtonText}>Next Word</Text>
                    </PressableScale>
                  </>
                )}

                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>Done</Text>
                </PressableScale>
              </>
            )}

            {mode === "play" && playPhase !== "gameover" && currentWord && (
              <>
                <View style={styles.hud}>
                  <Text style={styles.hudText}>
                    {"❤️".repeat(lives)}
                    {"🖤".repeat(Math.max(0, PLAY_LIVES - lives))}
                  </Text>
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

                <Text style={styles.modalIcon}>{currentWord.icon}</Text>
                <Text style={styles.modalWord}>{currentWord.word}</Text>

                {playPhase === "playing" && (
                  <>
                    <Text style={styles.prompt}>
                      Which language does this word come from?
                    </Text>
                    {options.map((option, i) => (
                      <PressableScale
                        key={i}
                        style={styles.option}
                        onPress={() => handlePlaySelect(option)}
                      >
                        <Text style={styles.optionText}>{option}</Text>
                      </PressableScale>
                    ))}
                  </>
                )}

                {playPhase === "feedback" && (
                  <>
                    <Text
                      style={[
                        styles.result,
                        { color: isCorrect ? Colors.success : Colors.error },
                      ]}
                    >
                      {isCorrect ? "✅ Correct!" : "❌ Not quite"}
                    </Text>
                    {!isCorrect && (
                      <Text style={styles.yourAnswer}>
                        You selected: {selected}
                      </Text>
                    )}
                    <Text style={styles.originText}>{currentWord.origin}</Text>
                  </>
                )}

                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>End Game</Text>
                </PressableScale>
              </>
            )}

            {mode === "play" && playPhase === "gameover" && (
              <View style={styles.gameOverBox}>
                <Text style={styles.gameOverTitle}>Game Over!</Text>
                <Text style={styles.finalScore}>{score}</Text>
                <Text style={styles.finalScoreLabel}>
                  words guessed correctly
                </Text>

                {isNewRecord && (
                  <Text style={styles.newRecord}>🎉 New High Score!</Text>
                )}
                <Text style={styles.highScoreLine}>🏆 Best: {highScore}</Text>

                <PressableScale
                  style={styles.playAgainButton}
                  onPress={openPlay}
                >
                  <Text style={styles.modeButtonText}>Play Again</Text>
                </PressableScale>
                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>Done</Text>
                </PressableScale>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
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
  content: {
    padding: Spacing.lg,
    alignItems: "center",
  },
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
  buttonRow: { flexDirection: "row", width: "100%" },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginHorizontal: 4,
  },
  learnButton: { backgroundColor: Colors.secondary },
  playButton: { backgroundColor: Colors.accent },
  playAgainButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: Radius.pill,
    marginBottom: Spacing.sm,
  },
  modeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 15,
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
  hudText: { fontSize: 16 },
  scoreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  hudTimer: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.ink },
  modalIcon: { fontSize: 48, marginBottom: Spacing.xs },
  modalWord: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
    marginBottom: Spacing.lg,
    color: Colors.ink,
    textAlign: "center",
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
    fontSize: 22,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  yourAnswer: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    fontStyle: "italic",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  originText: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  reason: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 21,
    paddingHorizontal: Spacing.sm,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginBottom: Spacing.sm,
    paddingHorizontal: 40,
  },
  nextButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  exitButton: { paddingVertical: 10, marginTop: Spacing.xs },
  exitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 13,
  },
  gameOverBox: { alignItems: "center", width: "100%" },
  gameOverTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  finalScore: {
    fontFamily: Fonts.displayBold,
    fontSize: 64,
    color: Colors.accent,
  },
  finalScoreLabel: {
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
