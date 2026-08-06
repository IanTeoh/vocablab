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
import { getLives, loseLife, MAX_LIVES } from "../logic/lives";
import { buildQuizOptions } from "../logic/quiz";
import PressableScale from "./PressableScale";

export default function IdiomPracticeCard({
  onCaught,
}: {
  onCaught?: () => void;
}) {
  const [lives, setLives] = useState<number | null>(null);
  const [dictionary, setDictionary] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [outOfLives, setOutOfLives] = useState(false);
  const [poolExhausted, setPoolExhausted] = useState(false);
  const [currentIdiom, setCurrentIdiom] = useState<any | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getLives().then(setLives);
      getIdiomDictionary().then(setDictionary);
    }, []),
  );

  function loadIdiom(currentDictionary: any[]) {
    const pool = generateIdiomSession(idioms, currentDictionary, 1);
    if (pool.length === 0) {
      setPoolExhausted(true);
      setModalVisible(false);
      return false;
    }
    const idiom = pool[0];
    setCurrentIdiom(idiom);
    setOptions(buildQuizOptions(idiom, idioms));
    setSelected(null);
    setRevealed(false);
    return true;
  }

  async function handlePlay() {
    if (lives === 0) return;
    const freshDictionary = await getIdiomDictionary();
    setDictionary(freshDictionary);
    setPoolExhausted(false);
    setOutOfLives(false);
    if (loadIdiom(freshDictionary)) {
      setModalVisible(true);
    }
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
      const remaining = await loseLife();
      setLives(remaining);
      if (remaining <= 0) {
        setTimeout(() => {
          setOutOfLives(true);
          setModalVisible(false);
        }, 1200);
      }
    }
  }

  function handleNext() {
    loadIdiom(dictionary);
  }

  function handleExit() {
    setModalVisible(false);
  }

  const isCorrect = selected === currentIdiom?.definition;
  const canContinue = (lives ?? 0) > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Idiom Practice</Text>
      <Text style={styles.subtitle}>
        Quick rounds of idioms you haven't caught yet.
      </Text>

      <View style={styles.livesRow}>
        <Text style={styles.livesText}>
          {lives !== null
            ? "❤️".repeat(lives) + "🖤".repeat(MAX_LIVES - lives)
            : "..."}
        </Text>
      </View>

      {(outOfLives || lives === 0) && (
        <Text style={styles.bannerTextError}>
          Out of lives — come back tomorrow for 3 more! ❤️
        </Text>
      )}

      {poolExhausted && (
        <Text style={styles.bannerTextMuted}>
          You've caught every idiom! 🎉 New ones unlock as more get added.
        </Text>
      )}

      <PressableScale
        style={[styles.playButton, lives === 0 && styles.playButtonDisabled]}
        onPress={handlePlay}
      >
        <Text style={styles.playButtonText}>
          {lives === 0 ? "Come back tomorrow" : "Play"}
        </Text>
      </PressableScale>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleExit}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {currentIdiom && (
              <>
                <View style={styles.topRow}>
                  <View />
                  <Text style={styles.livesText}>
                    {"❤️".repeat(lives ?? 0)}
                    {"🖤".repeat(Math.max(0, MAX_LIVES - (lives ?? 0)))}
                  </Text>
                </View>

                {currentIdiom.icon && (
                  <Text style={styles.icon}>{currentIdiom.icon}</Text>
                )}
                <Text style={styles.word}>{currentIdiom.word}</Text>

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
                      {isCorrect ? "✅ Correct!" : "❌ Not quite (-1 life)"}
                    </Text>
                    <Text style={styles.definition}>
                      {currentIdiom.definition}
                    </Text>

                    {canContinue && (
                      <PressableScale
                        style={styles.nextButton}
                        onPress={handleNext}
                      >
                        <Text style={styles.nextButtonText}>Next Idiom</Text>
                      </PressableScale>
                    )}
                  </>
                )}

                <PressableScale style={styles.exitButton} onPress={handleExit}>
                  <Text style={styles.exitButtonText}>Exit</Text>
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
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  livesRow: { marginBottom: Spacing.sm },
  livesText: { fontSize: 20 },
  bannerTextError: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  bannerTextMuted: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  playButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  playButtonDisabled: {
    backgroundColor: Colors.border,
  },
  playButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalContent: { flex: 1, padding: Spacing.lg, justifyContent: "center" },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  icon: { fontSize: 40, textAlign: "center", marginBottom: Spacing.xs },
  word: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
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
  exitButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  exitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 13,
  },
});
