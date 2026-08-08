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
import { checkDerivative } from "../logic/derivativesGame";
import { recordDerivativesScore } from "../logic/rootDerivativesHighScore";
import PressableScale from "./PressableScale";

const ROUND_DURATION = 60;
const MAX_HINTS = 1;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Phase = "playing" | "results";

type Props = {
  root: any | null;
  onClose: () => void;
  onRoundEnd?: () => void;
};

export default function RootDerivativesGameScreen({
  root,
  onClose,
  onRoundEnd,
}: Props) {
  const [phase, setPhase] = useState<Phase>("playing");
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [guess, setGuess] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [flash, setFlash] = useState<"correct" | "wrong" | "dupe" | null>(null);
  const [overallHighScore, setOverallHighScore] = useState<number | null>(null);
  const [overallHighScoreRoot, setOverallHighScoreRoot] = useState<
    string | null
  >(null);
  const [rootHighScore, setRootHighScore] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(MAX_HINTS);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    if (root) {
      setShouldRender(true);
      setFoundWords([]);
      setHintsLeft(MAX_HINTS);
      setGuess("");
      setTimeLeft(ROUND_DURATION);
      setPhase("playing");
      setIsNewRecord(false);

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
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setShouldRender(false));
    }
    return () => {
      stopTimer();
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, [root]);

  useEffect(() => {
    if (!root) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [root]);

  useEffect(() => {
    if (root && phase === "playing" && timeLeft === 0) {
      endRound();
    }
  }, [timeLeft, phase, root]);

  async function endRound() {
    stopTimer();
    Keyboard.dismiss();
    setPhase("results");
    const result = await recordDerivativesScore(root.root, foundWords.length);
    setOverallHighScore(result.overallHighScore);
    setOverallHighScoreRoot(result.overallHighScoreRoot);
    setRootHighScore(result.rootHighScore);
    setIsNewRecord(result.overallNewRecord || result.rootNewRecord);
    onRoundEnd?.();
  }

  function handleHint() {
    if (!root || phase !== "playing" || hintsLeft <= 0) return;
    const foundSet = new Set(foundWords);
    const remaining = (root.derivatives as string[]).filter(
      (d) => !foundSet.has(d.toLowerCase()),
    );
    if (remaining.length === 0) return;

    const revealed = remaining[Math.floor(Math.random() * remaining.length)];
    setFoundWords((prev) => [...prev, revealed.toLowerCase()]);
    setHintsLeft((h) => h - 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash("correct");
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setFlash(null), 700);
  }

  function handleSubmit() {
    if (!root || phase !== "playing" || !guess.trim()) return;
    const normalizedGuess = guess.trim().toLowerCase();

    if (foundWords.includes(normalizedGuess)) {
      setFlash("dupe");
    } else if (checkDerivative(guess, root)) {
      setFoundWords((prev) => [...prev, normalizedGuess]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFlash("correct");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFlash("wrong");
    }

    setGuess("");
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setFlash(null), 700);
  }

  function handleClose() {
    stopTimer();
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    Keyboard.dismiss();
    setTimeout(() => onClose(), 60);
  }

  if (!shouldRender || !root) return null;

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
            {phase === "playing" && (
              <>
                <View style={styles.hud}>
                  <Text style={styles.hudRoot}>
                    {root.icon} {root.root}
                  </Text>
                  <Text
                    style={[
                      styles.hudTimer,
                      timeLeft <= 10 && { color: Colors.error },
                    ]}
                  >
                    ⏱ {timeLeft}s
                  </Text>
                </View>
                <Text style={styles.scoreText}>
                  Found: {foundWords.length} / {root.derivatives.length} known
                </Text>

                <View style={styles.foundWordsBox}>
                  <Text style={styles.foundWordsText} numberOfLines={3}>
                    {foundWords.length > 0
                      ? foundWords.join(", ")
                      : "Start typing derived words..."}
                  </Text>
                </View>

                {hintsLeft > 0 &&
                  foundWords.length < root.derivatives.length && (
                    <PressableScale
                      style={styles.hintButton}
                      onPress={handleHint}
                    >
                      <Text style={styles.hintButtonText}>
                        💡 Hint ({hintsLeft} left)
                      </Text>
                    </PressableScale>
                  )}

                {flash && (
                  <Text
                    style={[
                      styles.flashText,
                      {
                        color:
                          flash === "correct"
                            ? Colors.success
                            : flash === "dupe"
                              ? Colors.inkMuted
                              : Colors.error,
                      },
                    ]}
                  >
                    {flash === "correct"
                      ? "✅ Nice!"
                      : flash === "dupe"
                        ? "Already got that one"
                        : "❌ Not a match"}
                  </Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder={`A word with "${root.root.toLowerCase()}"...`}
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

                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>End Round</Text>
                </PressableScale>
              </>
            )}

            {phase === "results" && (
              <View style={styles.resultsBox}>
                <Text style={styles.resultsTitle}>Time's Up!</Text>
                <Text style={styles.resultsScore}>{foundWords.length}</Text>
                <Text style={styles.resultsLabel}>
                  words found for "{root.root}"
                </Text>

                {isNewRecord && (
                  <Text style={styles.newRecord}>🎉 New High Score!</Text>
                )}
                <Text style={styles.highScoreLine}>
                  🏆 Your best for this root: {rootHighScore}
                </Text>
                <Text style={styles.highScoreLine}>
                  🌟 Overall best: {overallHighScore}
                  {overallHighScore &&
                  overallHighScore > 0 &&
                  overallHighScoreRoot
                    ? ` (${overallHighScoreRoot})`
                    : ""}
                </Text>

                <Text style={styles.resultsWords}>
                  {foundWords.length > 0
                    ? foundWords.join(", ")
                    : "No words found this round."}
                </Text>

                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>Done</Text>
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
  hudRoot: { fontFamily: Fonts.bodySemiBold, fontSize: 18, color: Colors.ink },
  hudTimer: { fontFamily: Fonts.bodySemiBold, fontSize: 18, color: Colors.ink },
  scoreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
  },
  foundWordsBox: {
    width: "100%",
    minHeight: 60,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: Spacing.sm,
  },
  foundWordsText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.ink },
  hintButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: Spacing.sm,
  },
  hintButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.accent,
  },
  flashText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
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
  resultsBox: { alignItems: "center", width: "100%" },
  resultsTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  resultsScore: {
    fontFamily: Fonts.displayBold,
    fontSize: 56,
    color: Colors.accent,
  },
  resultsLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  newRecord: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  highScoreLine: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.xs,
  },
  resultsWords: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.ink,
    textAlign: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
});
