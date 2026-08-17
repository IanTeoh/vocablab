import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import allRoots from "../data/roots.json";
import {
  addRootToDictionary,
  getRootDictionary,
} from "../logic/rootDictionary";
import { getRootOfTheDay } from "../logic/rootOfDay";
import { buildRootQuizOptions } from "../logic/rootQuiz";
import PressableScale from "./PressableScale";
import WordDetailModal from "./WordDetailModal";

export default function RootOfDayCard({ onCaught }: { onCaught?: () => void }) {
  const [today, setToday] = useState<any | null>(null);
  const [alreadyCaught, setAlreadyCaught] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [added, setAdded] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    getRootOfTheDay(allRoots).then(setToday);
  }, []);

  useEffect(() => {
    if (!today) return;
    getRootDictionary().then((dict) => {
      setAlreadyCaught(dict.some((r: any) => r.root === today.root));
    });
  }, [today]);

  const options = useMemo(
    () => (today ? buildRootQuizOptions(today, allRoots) : []),
    [today?.root],
  );

  function openQuiz() {
    setSelected(null);
    setRevealed(false);
    setAdded(false);
    setModalVisible(true);
  }

  function handleSelect(option: string) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
    const correctAnswer = `${today.meaning} (${today.origin})`;
    if (option === correctAnswer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleAddToDictionary() {
    await addRootToDictionary(today);
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

  const correctAnswer = `${today.meaning} (${today.origin})`;
  const isCorrect = selected === correctAnswer;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Root of the Day</Text>

      {alreadyCaught ? (
        <PressableScale
          style={styles.startContainer}
          onPress={() => setDetailVisible(true)}
        >
          <Text style={styles.icon}>{today.icon}</Text>
          <Text style={styles.word}>{today.root}</Text>
          <Text style={styles.completedBadge}>
            ✅ Already in your collection
          </Text>
          <Text style={styles.tapHint}>Tap to view details</Text>
        </PressableScale>
      ) : (
        <View style={styles.startContainer}>
          <Text style={styles.icon}>{today.icon}</Text>
          <Text style={styles.word}>{today.root}</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>{today.icon}</Text>
            <Text style={styles.modalWord}>{today.root}</Text>

            {!revealed && (
              <>
                <Text style={styles.prompt}>
                  Where does this root come from?
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
                    { color: isCorrect ? Colors.success : Colors.error },
                  ]}
                >
                  {isCorrect ? "✅ Correct!" : "❌ Not quite"}
                </Text>
                <Text style={styles.definition}>
                  "{today.root}" comes from {today.origin}, meaning "
                  {today.meaning}."
                </Text>
                <Text style={styles.example}>{today.example}</Text>

                {!added ? (
                  <PressableScale
                    style={styles.addButton}
                    onPress={handleAddToDictionary}
                  >
                    <Text style={styles.addButtonText}>
                      + Add to Collection
                    </Text>
                  </PressableScale>
                ) : (
                  <Text style={styles.addedText}>
                    Added to your collection 🎉
                  </Text>
                )}

                {!added && (
                  <PressableScale
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </PressableScale>
                )}
              </>
            )}

            <PressableScale
              style={styles.exitButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.exitButtonText}>Exit</Text>
            </PressableScale>
          </View>
        </SafeAreaView>
      </Modal>

      <WordDetailModal
        visible={detailVisible}
        word={{
          word: today.root,
          definition: `${today.meaning} (${today.origin})`,
          example: today.example,
          icon: today.icon,
        }}
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
  icon: { fontSize: 34, marginBottom: Spacing.xs },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  word: {
    fontFamily: Fonts.displayBold,
    fontSize: 28,
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
  },
  startButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  exitButton: {
    paddingVertical: 10,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  exitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  modalContent: { flex: 1, padding: Spacing.lg, justifyContent: "center" },
  modalIcon: { fontSize: 48, textAlign: "center", marginBottom: Spacing.xs },
  modalWord: {
    fontFamily: Fonts.displayBold,
    fontSize: 32,
    marginBottom: Spacing.lg,
    color: Colors.ink,
    textAlign: "center",
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
  optionText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.ink,
    textAlign: "center",
  },
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
    marginBottom: Spacing.lg,
    textAlign: "center",
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
    marginTop: Spacing.sm,
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 15,
  },
});
