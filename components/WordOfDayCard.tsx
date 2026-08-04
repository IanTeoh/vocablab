import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import words from "../data/words.json";
import { addWordToDictionary, isTodayCompleted } from "../logic/dictionary";
import { buildQuizOptions } from "../logic/quiz";
import { getRarityStyle } from "../logic/rarity";
import { updateStreak } from "../logic/streaks";
import { getWordOfTheDay } from "../logic/wordOfDay";
import PressableScale from "./PressableScale";

export default function WordOfDayCard() {
  const today = getWordOfTheDay(words);
  const options = useMemo(() => buildQuizOptions(today), [today.word]);
  const rarity = getRarityStyle(today.rarity);

  const [streak, setStreak] = useState<number | null>(null);
  const [completedToday, setCompletedToday] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [added, setAdded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    updateStreak().then(setStreak);
    isTodayCompleted().then(setCompletedToday);
  }, []);

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

  function closeQuiz() {
    setModalVisible(false);
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
    await addWordToDictionary(today);
    setAdded(true);
    setCompletedToday(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setModalVisible(false), 900);
  }

  const isCorrect = selected === today.definition;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Word of the Day</Text>

      {completedToday ? (
        <View style={styles.completedContainer}>
          <Text style={styles.word}>{today.word}</Text>
          <Text style={styles.completedBadge}>✅ Completed for today</Text>
        </View>
      ) : (
        <View style={styles.startContainer}>
          <Text style={styles.word}>{today.word}</Text>
          <PressableScale style={styles.startButton} onPress={openQuiz}>
            <Text style={styles.startButtonText}>Start</Text>
          </PressableScale>
        </View>
      )}

      {streak !== null && (
        <Text style={styles.streak}>🔥 {streak} day streak</Text>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeQuiz}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
            <Text style={styles.modalWord}>{today.word}</Text>
            <Text
              style={[
                styles.rarityBadge,
                { color: rarity.color, borderColor: rarity.color },
              ]}
            >
              {rarity.label}
            </Text>

            {!revealed && (
              <>
                <Text style={styles.prompt}>What does this word mean?</Text>
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
                    { color: isCorrect ? "#2e7d32" : "#c62828" },
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
                      + Add to Dictionary
                    </Text>
                  </PressableScale>
                )}

                {added && (
                  <Text style={styles.addedText}>
                    Added to your dictionary 🎉
                  </Text>
                )}

                {!isCorrect && (
                  <PressableScale
                    style={styles.closeButton}
                    onPress={closeQuiz}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </PressableScale>
                )}
              </>
            )}
          </Animated.View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rarityBadge: {
    alignSelf: "center",
    fontSize: 12,
    fontWeight: "700",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  startContainer: { alignItems: "center", paddingVertical: 12 },
  completedContainer: { alignItems: "center", paddingVertical: 12 },
  word: { fontSize: 32, fontWeight: "bold", marginBottom: 16, color: "#222" },
  completedBadge: { fontSize: 15, fontWeight: "600", color: "#2e7d32" },
  startButton: {
    backgroundColor: "#e65100",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    marginTop: 8,
  },
  startButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  streak: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e65100",
    marginTop: 8,
    textAlign: "center",
  },

  modalContainer: { flex: 1, backgroundColor: "#f5f5f5" },
  modalContent: { flex: 1, padding: 24, justifyContent: "center" },
  modalWord: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#222",
    textAlign: "center",
  },
  prompt: {
    fontSize: 17,
    color: "#444",
    marginBottom: 16,
    textAlign: "center",
  },
  option: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  optionText: { fontSize: 16, color: "#333" },
  result: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  yourAnswer: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  definition: { fontSize: 17, color: "#444", marginBottom: 12, lineHeight: 24 },
  example: {
    fontSize: 15,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  addedText: {
    fontSize: 16,
    color: "#2e7d32",
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  closeButtonText: { color: "#555", fontSize: 15, fontWeight: "600" },
});
