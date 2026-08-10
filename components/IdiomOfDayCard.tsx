import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import idioms from "../data/idioms.json";
import {
  addIdiomToDictionary,
  getIdiomDictionary,
} from "../logic/idiomDictionary";
import { getIdiomOfTheDay } from "../logic/idiomOfDay";
import { buildQuizOptions } from "../logic/quiz";
import PressableScale from "./PressableScale";
import WordDetailModal from "./WordDetailModal";

export default function IdiomOfDayCard({
  onCaught,
}: {
  onCaught?: () => void;
}) {
  const [today, setToday] = useState<any | null>(null);
  const [alreadyCaught, setAlreadyCaught] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [added, setAdded] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      getIdiomOfTheDay(idioms).then(setToday);
    }, []),
  );

  useEffect(() => {
    if (!today) return;
    getIdiomDictionary().then((dict: any[]) => {
      setAlreadyCaught(dict.some((i) => i.word === today.word));
    });
  }, [today]);

  const options = useMemo(
    () => (today ? buildQuizOptions(today, idioms) : []),
    [today?.word],
  );

  function openQuiz() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(null);
    setRevealed(false);
    setAdded(false);
    setModalVisible(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function handleSelect(option: string) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    if (option === today.definition) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleAddToDictionary() {
    await addIdiomToDictionary(today);
    setAdded(true);
    setAlreadyCaught(true);
    onCaught?.();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setModalVisible(false), 900);
  }

  if (!today) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const isCorrect = selected === today.definition;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Idiom of the Day</Text>

      {alreadyCaught ? (
        <PressableScale
          style={styles.completedContainer}
          onPress={() => setDetailVisible(true)}
        >
          {today.icon && <Text style={styles.icon}>{today.icon}</Text>}
          <Text style={styles.word}>{today.word}</Text>
          <Text style={styles.completedBadge}>
            ✅ Already in your collection
          </Text>
          <Text style={styles.tapHint}>Tap to view meaning</Text>
        </PressableScale>
      ) : (
        <View style={styles.startContainer}>
          {today.icon && <Text style={styles.icon}>{today.icon}</Text>}
          <Text style={styles.word}>{today.word}</Text>
          <PressableScale style={styles.startButton} onPress={openQuiz}>
            <Text style={styles.startButtonText}>Start</Text>
          </PressableScale>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            {today.icon && <Text style={styles.modalIcon}>{today.icon}</Text>}
            <Text style={styles.modalWord}>{today.word}</Text>
            {!revealed && (
              <>
                <Text style={styles.prompt}>What does this idiom mean?</Text>
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
                    { color: isCorrect ? Colors.success : Colors.error },
                  ]}
                >
                  {isCorrect ? "✅ Correct!" : "❌ Not quite"}
                </Text>
                {!isCorrect && (
                  <Text style={styles.yourAnswer}>
                    You selected: "{selected}"
                  </Text>
                )}
                <Text style={styles.definition}>{today.definition}</Text>
                <Text style={styles.example}>"{today.example}"</Text>

                {isCorrect && !added && (
                  <PressableScale
                    style={styles.addButton}
                    onPress={handleAddToDictionary}
                  >
                    <Text style={styles.addButtonText}>
                      + Add to Collection
                    </Text>
                  </PressableScale>
                )}

                {added && (
                  <Text style={styles.addedText}>
                    Added to your collection 🎉
                  </Text>
                )}

                {!isCorrect && (
                  <PressableScale
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </PressableScale>
                )}
              </>
            )}
          </Animated.View>
        </SafeAreaView>
      </Modal>

      <WordDetailModal
        visible={detailVisible}
        word={today}
        onClose={() => setDetailVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: "100%",
    borderWidth: 1.5,
    borderColor: Colors.accent,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.md,
    minHeight: 80,
    justifyContent: "center",
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  startContainer: { alignItems: "center", paddingVertical: Spacing.sm },
  completedContainer: { alignItems: "center", paddingVertical: Spacing.sm },
  icon: { fontSize: 34, marginBottom: Spacing.xs },
  modalIcon: { fontSize: 56, textAlign: "center", marginBottom: Spacing.xs },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  word: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    marginBottom: Spacing.md,
    color: Colors.ink,
    textAlign: "center",
  },
  completedBadge: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.success,
  },
  tapHint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
    marginTop: Spacing.sm,
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
    fontSize: 32,
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
  yourAnswer: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
    fontStyle: "italic",
    textAlign: "center",
  },
  definition: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Colors.ink,
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  example: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.inkMuted,
    fontStyle: "italic",
    marginBottom: Spacing.lg,
  },
  addButton: {
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
  },
  addButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  addedText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.success,
    textAlign: "center",
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 15,
  },
});
