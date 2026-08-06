import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    BackHandler,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
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
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

function getBlankPattern(word: string, revealedIndices: Set<number>) {
  const pattern = word
    .split("")
    .map((ch, i) => {
      if (!/[a-zA-Z]/.test(ch)) return ch;
      return revealedIndices.has(i) ? ch : "_";
    })
    .join("");
  return pattern.replace(/ /g, "  ");
}

type Phase = "playing" | "feedback" | "timeup" | "gameover";

type IdiomojiGameScreenProps = {
  visible: boolean;
  onClose: () => void;
  onGameEnd?: () => void;
};

export default function IdiomojiGameScreen({
  visible,
  onClose,
  onGameEnd,
}: IdiomojiGameScreenProps) {
  const [highScore, setHighScore] = useState<number | null>(null);
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
  const startedRef = useRef(false);
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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

    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
  }

  async function endGame() {
    stopTimer();
    Keyboard.dismiss();
    setPhase("gameover");
    const result = await saveIdiomojiScoreIfBetter(score);
    setHighScore(result.highScore);
    setIsNewRecord(result.isNewRecord);
    onGameEnd?.();
  }

  // Start a fresh game whenever the screen becomes visible, and
  // animate the slide-up/slide-down transition.
  useEffect(() => {
    if (visible) {
      startedRef.current = true;
      setShouldRender(true);
      getIdiomojiHighScore().then(setHighScore);
      startGame();
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      stopTimer();
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setShouldRender(false));
    }
    return () => {
      stopTimer();
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [visible]);

  // Android hardware back button should exit the game screen.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) {
      stopTimer();
      Keyboard.dismiss();
      setPhase("timeup");
      feedbackTimeoutRef.current = setTimeout(() => endGame(), 1600);
    }
  }, [timeLeft, phase]);

  // Every REVEAL_INTERVAL_MS spent on the same idiom, reveal one more
  // random letter — always leaves at least one hidden.
  useEffect(() => {
    if (phase !== "playing" || !currentIdiom) return;

    const totalAlpha = ((currentIdiom.word as string).match(/[a-zA-Z]/g) || [])
      .length;
    // Longer idioms get hints sooner: ~4.75s for a short (~15-letter)
    // idiom, down to ~2s for a long (~30-letter) one, floor of 2s.
    const intervalMs = Math.max(2000, Math.min(6500, 7000 - totalAlpha * 150));

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
    }, intervalMs);

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
    // Give the keyboard-collapse animation a moment to settle before
    // starting the screen slide-down — running both at once causes a
    // visual jump/glitch.
    setTimeout(() => onClose(), 60);
  }

  if (!shouldRender) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <Animated.View
      style={[styles.overlay, { transform: [{ translateY: slideAnim }] }]}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.content}>
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

                {phase === "timeup" && (
                  <>
                    <Text style={[styles.result, { color: Colors.error }]}>
                      ⏰ Time's Up!
                    </Text>
                    <Text style={styles.answerWord}>{currentIdiom.word}</Text>
                  </>
                )}

                <PressableScale style={styles.exitButton} onPress={handleClose}>
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

                <PressableScale style={styles.startButton} onPress={startGame}>
                  <Text style={styles.startButtonText}>Play Again</Text>
                </PressableScale>
                <PressableScale style={styles.doneButton} onPress={handleClose}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </PressableScale>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    zIndex: 1000,
    elevation: 1000,
  },
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
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
    letterSpacing: 4,
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
  startButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: Radius.pill,
  },
  startButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
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
