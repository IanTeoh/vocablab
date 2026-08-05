import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import allWords from "../data/words.json";
import { getDictionary } from "../logic/dictionary";
import { buildQuizOptions } from "../logic/quiz";
import { getRarityStyle } from "../logic/rarity";
import PressableScale from "./PressableScale";

const MIN_WORDS_TO_UNLOCK = 10;

function pickRandomWord(list: any[], exclude?: any) {
  if (list.length === 0) return null;
  if (list.length === 1) return list[0];
  let candidate;
  do {
    candidate = list[Math.floor(Math.random() * list.length)];
  } while (candidate.word === exclude?.word);
  return candidate;
}

type Mode = "basic" | "quiz";

export default function ReviewCard() {
  const [dictionary, setDictionary] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<Mode>("basic");
  const [currentWord, setCurrentWord] = useState<any | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getDictionary().then(setDictionary);
    }, []),
  );

  if (dictionary.length < MIN_WORDS_TO_UNLOCK) {
    return null;
  }

  function loadWord(word: any) {
    setCurrentWord(word);
    setSelected(null);
    setRevealed(false);
    if (mode === "quiz" && word) {
      setQuizOptions(buildQuizOptions(word, allWords as any[]));
    }
  }

  function openReview(selectedMode: Mode) {
    setMode(selectedMode);
    const word = pickRandomWord(dictionary);
    setCurrentWord(word);
    setSelected(null);
    setRevealed(false);
    if (selectedMode === "quiz" && word) {
      setQuizOptions(buildQuizOptions(word, allWords as any[]));
    }
    setModalVisible(true);
  }

  function nextWord() {
    const word = pickRandomWord(dictionary, currentWord);
    loadWord(word);
  }

  function handleSelect(option: string) {
    if (revealed || !currentWord) return;
    setSelected(option);
    setRevealed(true);
    if (option === currentWord.definition) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  const rarity = currentWord ? getRarityStyle(currentWord.rarity) : null;
  const isCorrect = selected === currentWord?.definition;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Review</Text>
      <Text style={styles.subtitle}>
        Refresh your memory on the {dictionary.length} words you've already
        learned.
      </Text>

      <View style={styles.buttonRow}>
        <PressableScale
          style={[styles.startButton, styles.buttonHalf]}
          onPress={() => openReview("basic")}
        >
          <Text style={styles.startButtonText}>Basic Review</Text>
        </PressableScale>
        <PressableScale
          style={[styles.quizButton, styles.buttonHalf]}
          onPress={() => openReview("quiz")}
        >
          <Text style={styles.quizButtonText}>Quiz Review</Text>
        </PressableScale>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {currentWord && (
              <>
                <Text style={styles.modalWord}>{currentWord.word}</Text>
                <Text
                  style={[
                    styles.rarityBadge,
                    { color: rarity!.color, borderColor: rarity!.color },
                  ]}
                >
                  {rarity!.label}
                </Text>

                {mode === "basic" && (
                  <>
                    <Text style={styles.definition}>
                      {currentWord.definition}
                    </Text>
                    <Text style={styles.example}>"{currentWord.example}"</Text>
                  </>
                )}

                {mode === "quiz" && !revealed && (
                  <>
                    <Text style={styles.prompt}>What does this word mean?</Text>
                    {quizOptions.map((option, i) => (
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

                {mode === "quiz" && revealed && (
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
                    <Text style={styles.example}>"{currentWord.example}"</Text>
                  </>
                )}

                {(mode === "basic" || revealed) && (
                  <PressableScale style={styles.nextButton} onPress={nextWord}>
                    <Text style={styles.nextButtonText}>Next Word</Text>
                  </PressableScale>
                )}
                <PressableScale
                  style={styles.doneButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </PressableScale>
              </>
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
    fontSize: 13,
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
  buttonRow: {
    flexDirection: "row",
    width: "100%",
  },
  buttonHalf: { flex: 1, marginHorizontal: 4 },
  startButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    alignItems: "center",
  },
  startButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 14,
  },
  quizButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    alignItems: "center",
  },
  quizButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 14,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "center",
  },
  modalWord: {
    fontFamily: Fonts.displayBold,
    fontSize: 40,
    marginBottom: Spacing.sm,
    color: Colors.ink,
    textAlign: "center",
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
    fontSize: 22,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  definition: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Colors.ink,
    marginBottom: Spacing.md,
    lineHeight: 24,
    textAlign: "center",
  },
  example: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.inkMuted,
    fontStyle: "italic",
    marginBottom: Spacing.xl,
    textAlign: "center",
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
  doneButton: {
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  doneButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 15,
  },
});
