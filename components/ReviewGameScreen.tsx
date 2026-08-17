import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { blankSentence } from "../logic/contextQuiz";
import { isFavorite, toggleFavorite } from "../logic/favorites";
import { getRarityStyle } from "../logic/rarity";
import { recordReviewResult } from "../logic/spacedRepetition";
import PressableScale from "./PressableScale";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// First letter + underscores for the rest — narrows a fill-in-the-
// blank down to exactly one word even when several synonyms would
// otherwise fit the sentence and definition equally well.
function getScaffold(word: string) {
  return word[0].toUpperCase() + " " + "_ ".repeat(word.length - 1).trim();
}

export default function ReviewGameScreen({
  visible,
  queue,
  onClose,
  onSessionEnd,
}: {
  visible: boolean;
  queue: any[];
  onClose: () => void;
  onSessionEnd: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    box: number;
    movedUp: boolean;
  } | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    movedUp: 0,
    backToStart: 0,
  });
  const [phase, setPhase] = useState<"reviewing" | "results">("reviewing");
  const [shouldRender, setShouldRender] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setIndex(0);
      setGuess("");
      setRevealed(false);
      setLastResult(null);
      setSessionStats({ reviewed: 0, movedUp: 0, backToStart: 0 });
      setPhase("reviewing");
      if (queue[0]) isFavorite(queue[0].word).then(setFavorited);

      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setShouldRender(false));
    }
  }, [visible]);

  async function handleSubmit() {
    const currentWord = queue[index];
    if (revealed || !currentWord || !guess.trim()) return;

    const correct =
      guess.trim().toLowerCase() === currentWord.word.toLowerCase();
    const result = await recordReviewResult(currentWord.word, correct);
    setLastResult({ correct, box: result.box, movedUp: result.movedUp });
    setRevealed(true);

    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      movedUp: prev.movedUp + (result.movedUp ? 1 : 0),
      backToStart: prev.backToStart + (!correct ? 1 : 0),
    }));
  }

  async function handleToggleFavorite() {
    const currentWord = queue[index];
    if (!currentWord) return;
    await toggleFavorite(currentWord.word);
    setFavorited((f) => !f);
  }

  async function handleNext() {
    if (index + 1 >= queue.length) {
      setPhase("results");
      onSessionEnd();
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setGuess("");
    setRevealed(false);
    setLastResult(null);
    setFavorited(await isFavorite(queue[nextIndex].word));
  }

  function handleClose() {
    onSessionEnd();
    onClose();
  }

  if (!shouldRender) return null;

  const currentWord = queue[index];
  const rarity = currentWord ? getRarityStyle(currentWord.rarity) : null;
  const blanked = currentWord
    ? blankSentence(currentWord.example, currentWord.word)
    : "";

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
            {phase === "reviewing" && currentWord && (
              <>
                <View style={styles.topRow}>
                  <Text style={styles.progressText}>
                    {index + 1} of {queue.length}
                  </Text>
                  <PressableScale onPress={handleToggleFavorite}>
                    <Text style={styles.favoriteIcon}>
                      {favorited ? "❤️" : "🤍"}
                    </Text>
                  </PressableScale>
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

                {!revealed ? (
                  <>
                    <Text style={styles.definition}>
                      {currentWord.definition}
                    </Text>
                    <Text style={styles.sentence}>{blanked}</Text>
                    <Text style={styles.scaffold}>
                      {getScaffold(currentWord.word)}
                    </Text>
                    <Text style={styles.prompt}>What word fits here?</Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Type the word..."
                      placeholderTextColor={Colors.inkMuted}
                      value={guess}
                      onChangeText={setGuess}
                      onSubmitEditing={handleSubmit}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      autoFocus
                    />
                    <PressableScale
                      style={styles.submitButton}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.submitButtonText}>Submit</Text>
                    </PressableScale>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalWord}>{currentWord.word}</Text>
                    <Text
                      style={[
                        styles.result,
                        {
                          color: lastResult?.correct
                            ? Colors.success
                            : Colors.error,
                        },
                      ]}
                    >
                      {lastResult?.correct ? "✅ Correct!" : "❌ Not quite"}
                    </Text>
                    <Text style={styles.boxText}>
                      {lastResult?.correct
                        ? `Moved to box ${lastResult.box} of 5 — you'll see this again in a bit longer.`
                        : "Back to box 1 — you'll see this again soon."}
                    </Text>
                    <Text style={styles.exampleFull}>
                      "{currentWord.example}"
                    </Text>

                    <PressableScale
                      style={styles.nextButton}
                      onPress={handleNext}
                    >
                      <Text style={styles.nextButtonText}>
                        {index + 1 >= queue.length ? "Finish" : "Next Word"}
                      </Text>
                    </PressableScale>
                  </>
                )}

                <PressableScale style={styles.exitButton} onPress={handleClose}>
                  <Text style={styles.exitButtonText}>Exit</Text>
                </PressableScale>
              </>
            )}

            {phase === "results" && (
              <View style={styles.resultsBox}>
                <Text style={styles.resultsTitle}>Session Complete!</Text>
                <Text style={styles.resultsScore}>{sessionStats.reviewed}</Text>
                <Text style={styles.resultsLabel}>words reviewed</Text>
                <Text style={styles.resultsDetail}>
                  {sessionStats.movedUp} moved to a longer interval
                  {sessionStats.backToStart > 0
                    ? ` · ${sessionStats.backToStart} back to box 1`
                    : ""}
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
    zIndex: 900,
    elevation: 900,
  },
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.lg, justifyContent: "center" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  favoriteIcon: { fontSize: 22 },
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
  definition: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 27,
  },
  sentence: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  scaffold: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.accent,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  prompt: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  submitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  modalWord: {
    fontFamily: Fonts.displayBold,
    fontSize: 34,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  result: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  boxText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  exampleFull: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  nextButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  nextButtonText: {
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
  resultsBox: { alignItems: "center" },
  resultsTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 24,
    color: Colors.ink,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.sm,
  },
  resultsDetail: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
});
