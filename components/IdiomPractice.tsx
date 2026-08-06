import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import idioms from "../data/idioms.json";
import {
    addIdiomToDictionary,
    getIdiomDictionary,
} from "../logic/idiomDictionary";
import { generateIdiomSession } from "../logic/idiomSessions";
import { buildQuizOptions } from "../logic/quiz";
import { getRarityStyle } from "../logic/rarity";
import PressableScale from "./PressableScale";

export default function IdiomPracticeCard({
  onCaught,
}: {
  onCaught?: () => void;
}) {
  const [dictionary, setDictionary] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [poolExhausted, setPoolExhausted] = useState(false);
  const [currentIdiom, setCurrentIdiom] = useState<any | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getIdiomDictionary().then(setDictionary);
    }, []),
  );

  function loadNextIdiom(currentDictionary: any[]) {
    const pool = generateIdiomSession(idioms, currentDictionary, 1);
    if (pool.length === 0) {
      setPoolExhausted(true);
      setModalVisible(false);
      return;
    }
    const idiom = pool[0];
    setCurrentIdiom(idiom);
    setOptions(buildQuizOptions(idiom, idioms));
    setSelected(null);
    setRevealed(false);
  }

  function openPractice() {
    const pool = generateIdiomSession(idioms, dictionary, 1);
    if (pool.length === 0) {
      setPoolExhausted(true);
      return;
    }
    setPoolExhausted(false);
    loadNextIdiom(dictionary);
    setModalVisible(true);
  }

  async function handleSelect(option: string) {
    if (revealed || !currentIdiom) return;
    setSelected(option);
    setRevealed(true);

    if (option === currentIdiom.definition) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await addIdiomToDictionary(currentIdiom);
      setDictionary((prev) => [...prev, currentIdiom]);
      onCaught?.();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function handleNext() {
    loadNextIdiom(dictionary);
  }

  const rarity = currentIdiom ? getRarityStyle(currentIdiom.rarity) : null;
  const isCorrect = selected === currentIdiom?.definition;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Idiom Practice</Text>
      <Text style={styles.subtitle}>
        Learn a new idiom, one at a time — no pressure.
      </Text>

      {poolExhausted && (
        <Text style={styles.bannerTextMuted}>
          You've caught every idiom! 🎉 New ones unlock as more get added.
        </Text>
      )}

      <PressableScale style={styles.startButton} onPress={openPractice}>
        <Text style={styles.startButtonText}>Practice</Text>
      </PressableScale>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {currentIdiom && (
              <>
                <Text style={styles.modalWord}>{currentIdiom.word}</Text>
                <Text
                  style={[
                    styles.rarityBadge,
                    { color: rarity!.color, borderColor: rarity!.color },
                  ]}
                >
                  {rarity!.label}
                </Text>

                {!revealed && (
                  <>
                    <Text style={styles.prompt}>
                      What does this idiom mean?
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

                {revealed && (
                  <>
                    <Text
                      style={[
                        styles.result,
                        {
                          color: isCorrect ? Colors.success : Colors.error,
                        },
                      ]}
                    >
                      {isCorrect ? "✅ Correct!" : "❌ Not quite"}
                    </Text>
                    <Text style={styles.definition}>
                      {currentIdiom.definition}
                    </Text>
                    <Text style={styles.example}>"{currentIdiom.example}"</Text>
                    {isCorrect && (
                      <Text style={styles.addedText}>
                        Added to your collection 🎉
                      </Text>
                    )}

                    <PressableScale
                      style={styles.nextButton}
                      onPress={handleNext}
                    >
                      <Text style={styles.nextButtonText}>Next Idiom</Text>
                    </PressableScale>
                  </>
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
  bannerTextMuted: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: Radius.pill,
  },
  startButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalContent: { flex: 1, padding: Spacing.lg, justifyContent: "center" },
  modalWord: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
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
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  addedText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.success,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  nextButton: {
    backgroundColor: Colors.primary,
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
