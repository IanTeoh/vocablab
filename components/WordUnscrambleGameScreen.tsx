import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
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
import words from "../data/words.json";
import { getRarityStyle } from "../logic/rarity";
import { pickWordForUnscramble, scrambleWord } from "../logic/unscramble";
import {
    getUnscrambleHighScore,
    saveUnscrambleScoreIfBetter,
} from "../logic/unscrambleHighScore";
import AnimatedNumber from "./AnimatedNumber";
import PopIn from "./PopIn";
import PressableScale from "./PressableScale";

const ROUND_DURATION = 60;
const HINTS_PER_ROUND = 3;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Phase = "playing" | "skipReveal" | "results";

export default function WordUnscrambleGameScreen({
  visible,
  onClose,
  onGameEnd,
}: {
  visible: boolean;
  onClose: () => void;
  onGameEnd?: (score: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("playing");
  const [currentWord, setCurrentWord] = useState<any | null>(null);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(HINTS_PER_ROUND);
  const [hintRevealed, setHintRevealed] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function loadNextWord(exclude?: any) {
    const word = pickWordForUnscramble(words as any[], exclude);
    setCurrentWord(word);
    setScrambled(word ? scrambleWord(word.word) : []);
    setGuess("");
    setHintRevealed(false);
  }

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setScore(0);
      setTimeLeft(ROUND_DURATION);
      setIsNewRecord(false);
      setHintsLeft(HINTS_PER_ROUND);
      setPhase("playing");
      loadNextWord();
      getUnscrambleHighScore().then(setHighScore);

      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();

      stopTimer();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    } else {
      stopTimer();
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setShouldRender(false));
    }
    return () => {
      stopTimer();
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (visible && phase === "playing" && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, phase, visible]);

  async function endGame() {
    stopTimer();
    Keyboard.dismiss();
    setPhase("results");
    const result = await saveUnscrambleScoreIfBetter(score);
    setHighScore(result.highScore);
    setIsNewRecord(result.isNewRecord);
    onGameEnd?.(score);
  }

  function handleHint() {
    if (hintsLeft <= 0) return;
    setHintRevealed(true);
    setHintsLeft((h) => h - 1);
  }

  function handleSkip() {
    if (!currentWord || phase !== "playing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase("skipReveal");
    skipTimeoutRef.current = setTimeout(() => {
      loadNextWord(currentWord);
      setPhase("playing");
    }, 1600);
  }

  function handleSubmit() {
    if (!currentWord || phase !== "playing" || !guess.trim()) return;

    if (guess.trim().toLowerCase() === currentWord.word.toLowerCase()) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFlash("correct");
      loadNextWord(currentWord);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFlash("wrong");
      setGuess("");
    }

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setFlash(null), 600);
  }

  function handleClose() {
    stopTimer();
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    Keyboard.dismiss();
    setTimeout(() => onClose(), 60);
  }

  if (!shouldRender) return null;

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
            {(phase === "playing" || phase === "skipReveal") && currentWord && (
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

                <Text style={styles.scrambledLetters}>
                  {scrambled.join(" ")}
                </Text>
                <Text style={styles.lengthHint}>
                  {currentWord.word.length} letters
                </Text>
                {currentWord.rarity &&
                  (() => {
                    const rarity = getRarityStyle(currentWord.rarity);
                    return (
                      <Text
                        style={[
                          styles.rarityBadge,
                          { color: rarity.color, borderColor: rarity.color },
                        ]}
                      >
                        {rarity.label}
                      </Text>
                    );
                  })()}

                {phase === "skipReveal" ? (
                  <PopIn trigger="skip">
                    <Text style={styles.skipRevealText}>
                      The word was "{currentWord.word}"
                    </Text>
                  </PopIn>
                ) : (
                  <>
                    {hintRevealed && (
                      <Text style={styles.hintText}>
                        💡 {currentWord.definition}
                      </Text>
                    )}

                    <View style={styles.actionRow}>
                      {hintsLeft > 0 && (
                        <PressableScale
                          style={styles.hintButton}
                          onPress={handleHint}
                        >
                          <Text style={styles.hintButtonText}>
                            💡 Hint ({hintsLeft})
                          </Text>
                        </PressableScale>
                      )}
                      <PressableScale
                        style={styles.skipButton}
                        onPress={handleSkip}
                      >
                        <Text style={styles.skipButtonText}>⏭ Skip</Text>
                      </PressableScale>
                    </View>

                    {flash && (
                      <PopIn trigger={flash}>
                        <Text
                          style={[
                            styles.flashText,
                            {
                              color:
                                flash === "correct"
                                  ? Colors.success
                                  : Colors.error,
                            },
                          ]}
                        >
                          {flash === "correct" ? "✅ Nice!" : "❌ Not quite"}
                        </Text>
                      </PopIn>
                    )}

                    <TextInput
                      style={styles.input}
                      placeholder="Type the unscrambled word..."
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

                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>End Game</Text>
                </PressableScale>
              </>
            )}

            {phase === "results" && (
              <PopIn trigger="results" style={styles.resultsBox}>
                <Text style={styles.resultsTitle}>Time's Up!</Text>
                <AnimatedNumber value={score} style={styles.resultsScore} />
                <Text style={styles.resultsLabel}>words unscrambled</Text>

                {isNewRecord && (
                  <Text style={styles.newRecord}>🎉 New High Score!</Text>
                )}
                <Text style={styles.highScoreLine}>🏆 Best: {highScore}</Text>

                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>Done</Text>
                </PressableScale>
              </PopIn>
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
    marginBottom: Spacing.lg,
  },
  scoreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.inkMuted,
  },
  hudTimer: { fontFamily: Fonts.bodySemiBold, fontSize: 18, color: Colors.ink },
  scrambledLetters: {
    fontFamily: Fonts.displayBold,
    fontSize: 34,
    color: Colors.ink,
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  lengthHint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
  },
  rarityBadge: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  skipRevealText: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.accent,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  hintText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  actionRow: { flexDirection: "row", marginBottom: Spacing.sm },
  hintButton: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  hintButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.accent,
  },
  skipButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  skipButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  flashText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  input: {
    width: "100%",
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
    marginBottom: Spacing.sm,
  },
  submitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 15,
  },
  exitButton: { paddingVertical: 8, marginTop: Spacing.xs },
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
