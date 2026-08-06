import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import allIdioms from "../data/idioms.json";
import {
    checkIdiomGuess,
    pickRandomIdiomForGame,
} from "../logic/idiomEmojiGame";
import {
    getIdiomojiHighScore,
    saveIdiomojiScoreIfBetter,
} from "../logic/idiomojiHighScore";
import PressableScale from "./PressableScale";

const GAME_DURATION = 120;
const MAX_LIVES = 3;
const MAX_HINTS = 3;
const REVEAL_INTERVAL_MS = 4000;

function getBlankPattern(word: string, revealedIndices: Set<number>) {
  return word
    .split("")
    .map((ch, i) => {
      if (!/[a-zA-Z]/.test(ch)) return ch;
      return revealedIndices.has(i) ? ch : "_";
    })
    .join("");
}

type Phase = "playing" | "feedback" | "gameover";

export default function IdiomojiCard() {
  const [highScore, setHighScore] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("playing");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentIdiom, setCurrentIdiom] = useState<any | null>(null);
  const [guess, setGuess] = useState("");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(MAX_HINTS);
  const [hintUsedThisRound, setHintUsedThisRound] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(
    new Set(),
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      getIdiomojiHighScore().then(setHighScore);
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

  async function endGame() {
    stopTimer();
    Keyboard.dismiss();
    setPhase("gameover");
    const result = await saveIdiomojiScoreIfBetter(score);
    setHighScore(result.highScore);
    setIsNewRecord(result.isNewRecord);
  }

  function startGame() {
    setScore(0);
    setLives(MAX_LIVES);
    setTimeLeft(GAME_DURATION);
    setIsNewRecord(false);
    setGuess("");
    setHintsLeft(MAX_HINTS);
    setHintUsedThisRound(false);
    setRevealedIndices(new Set());
    setCurrentIdiom(pickRandomIdiomForGame(allIdioms as any[]));
    setPhase("playing");
    setModalVisible(true);

    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  }

  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, phase]);

  // Every REVEAL_INTERVAL_MS spent on the same idiom, reveal one more
  // random letter — always leaves at least one hidden.
  useEffect(() => {
    if (phase !== "playing" || !currentIdiom) return;

    const revealTimer = setInterval(() => {
      setRevealedIndices((prev) => {
        const word: string = currentIdiom.word;
        const totalAlpha = (word.match(/[a-zA-Z]/g) || []).length;
        if (prev.size >= totalAlpha - 1) return prev;

        const hiddenIndices: number[] = [];
        for (let i = 0; i < word.length; i++) {
          if (/[a-zA-Z]/.test(word[i]) && !prev.has(i)) hiddenIndices.push(i);
        }
        if (hiddenIndices.length === 0) return prev;

        const pick =
          hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
        const next = new Set(prev);
        next.add(pick);
        return next;
      });
    }, REVEAL_INTERVAL_MS);

    return () => clearInterval(revealTimer);
  }, [currentIdiom, phase]);

  function handleSubmit() {
    if (!currentIdiom || phase !== "playing") return;
    const correct = checkIdiomGuess(guess, currentIdiom.word);
    setLastCorrect(correct);
    Keyboard.dismiss();

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore((s) => s + 1);
      setPhase("feedback");
      feedbackTimeoutRef.current = setTimeout(() => nextRound(), 500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const remainingLives = lives - 1;
      setLives(remainingLives);
      setPhase("feedback");
      feedbackTimeoutRef.current = setTimeout(() => {
        if (remainingLives <= 0) {
          endGame();
        } else {
          nextRound();
        }
      }, 900);
    }
  }

  function nextRound() {
    setCurrentIdiom((prev: any) =>
      pickRandomIdiomForGame(allIdioms as any[], prev),
    );
    setGuess("");
    setHintUsedThisRound(false);
    setRevealedIndices(new Set());
    setPhase("playing");
  }

  function handleHint() {
    if (hintsLeft <= 0 || hintUsedThisRound || phase !== "playing") return;
    setHintsLeft((h) => h - 1);
    setHintUsedThisRound(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleClose() {
    stopTimer();
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    Keyboard.dismiss();
    setModalVisible(false);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Idiomoji</Text>
      <Text style={styles.subtitle}>
        Guess as many idioms as you can before time runs out.
      </Text>

      <View style={styles.highScorePill}>
        <Text style={styles.highScoreText}>🏆 Best: {highScore ?? "..."}</Text>
      </View>

      <PressableScale style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>Play</Text>
      </PressableScale>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.modalContent}>
              {phase !== "gameover" && currentIdiom && (
                <>
                  <View style={styles.hud}>
                    <Text style={styles.hudText}>
                      {"❤️".repeat(lives)}
                      {"🖤".repeat(Math.max(0, MAX_LIVES - lives))}
                    </Text>
                    <Text
                      style={[
                        styles.hudTimer,
                        timeLeft <= 10 && { color: Colors.error },
                      ]}
                    >
                      ⏱ {timeDisplay}
                    </Text>
                  </View>
                  <Text style={styles.scoreText}>Score: {score}</Text>

                  <Text style={styles.emojiRow}>
                    {currentIdiom.emojiClue.join("  ")}
                  </Text>

                  <Text style={styles.blankPattern}>
                    {getBlankPattern(currentIdiom.word, revealedIndices)}
                  </Text>

                  {phase === "playing" && (
                    <>
                      {!hintUsedThisRound && hintsLeft > 0 && (
                        <PressableScale
                          style={styles.hintButton}
                          onPress={handleHint}
                        >
                          <Text style={styles.hintButtonText}>
                            💡 Hint ({hintsLeft} left)
                          </Text>
                        </PressableScale>
                      )}

                      {hintUsedThisRound && (
                        <Text style={styles.hintText}>
                          💡 {currentIdiom.definition}
                        </Text>
                      )}

                      <TextInput
                        style={styles.input}
                        placeholder="Type the idiom..."
                        placeholderTextColor={Colors.inkMuted}
                        value={guess}
                        onChangeText={setGuess}
                        onSubmitEditing={handleSubmit}
                        returnKeyType="done"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus
                      />
                      <PressableScale
                        style={styles.submitButton}
                        onPress={handleSubmit}
                      >
                        <Text style={styles.submitButtonText}>Submit</Text>
                      </PressableScale>
                    </>
                  )}

                  {phase === "feedback" && (
                    <>
                      <Text
                        style={[
                          styles.result,
                          {
                            color: lastCorrect ? Colors.success : Colors.error,
                          },
                        ]}
                      >
                        {lastCorrect ? "✅ Correct!" : "❌ Not quite"}
                      </Text>
                      <Text style={styles.answerWord}>{currentIdiom.word}</Text>
                    </>
                  )}

                  <PressableScale
                    style={styles.exitButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.exitButtonText}>End Game</Text>
                  </PressableScale>
                </>
              )}

              {phase === "gameover" && (
                <View style={styles.gameOverBox}>
                  <Text style={styles.gameOverTitle}>Time's Up!</Text>
                  <Text style={styles.finalScore}>{score}</Text>
                  <Text style={styles.finalScoreLabel}>idioms guessed</Text>

                  {isNewRecord && (
                    <Text style={styles.newRecord}>🎉 New High Score!</Text>
                  )}
                  <Text style={styles.highScoreLine}>🏆 Best: {highScore}</Text>

                  <PressableScale
                    style={styles.startButton}
                    onPress={startGame}
                  >
                    <Text style={styles.startButtonText}>Play Again</Text>
                  </PressableScale>
                  <PressableScale
                    style={styles.doneButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </PressableScale>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.inkMuted,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1.2,
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
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
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
    marginBottom: Spacing.xs,
  },
  hudText: { fontSize: 18 },
  hudTimer: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 18,
    color: Colors.ink,
  },
  scoreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
  },
  emojiRow: {
    fontSize: 52,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  blankPattern: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 20,
    letterSpacing: 3,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  hintButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: Spacing.md,
  },
  hintButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.accent,
  },
  hintText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  input: {
    width: "100%",
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: Radius.pill,
    marginBottom: Spacing.sm,
  },
  submitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  result: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  answerWord: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  exitButton: {
    paddingVertical: 10,
    marginTop: Spacing.sm,
  },
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
  doneButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  doneButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 15,
  },
});
