import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import allWords from "../data/words.json";
import { getDictionary } from "../logic/dictionary";
import { getDueWords } from "../logic/spacedRepetition";
import PressableScale from "./PressableScale";

const MIN_WORDS_TO_UNLOCK = 10;

export default function ReviewCard({
  onPlay,
  refreshKey,
}: {
  onPlay: (queue: any[]) => void;
  refreshKey?: number;
}) {
  const [dictionary, setDictionary] = useState<any[]>([]);
  const [dueCount, setDueCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadDictionary();
    }, []),
  );

  useEffect(() => {
    if (refreshKey !== undefined) loadDictionary();
  }, [refreshKey]);

  async function loadDictionary() {
    const stored = await getDictionary();
    const hydrated = stored.map(
      (s: any) => (allWords as any[]).find((w) => w.word === s.word) || s,
    );
    setDictionary(hydrated);
    const due = await getDueWords(hydrated);
    setDueCount(due.length);
  }

  if (dictionary.length < MIN_WORDS_TO_UNLOCK) {
    return null;
  }

  async function handlePress() {
    const due = await getDueWords(dictionary);
    if (due.length === 0) return;
    onPlay(due);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Review</Text>
      <Text style={styles.subtitle}>
        {dueCount > 0
          ? `${dueCount} ${dueCount === 1 ? "word is" : "words are"} due for review`
          : "All caught up! Nothing due right now."}
      </Text>

      <PressableScale
        style={[
          styles.reviewButton,
          dueCount === 0 && styles.reviewButtonDisabled,
        ]}
        onPress={handlePress}
        disabled={dueCount === 0}
      >
        <Text style={styles.reviewButtonText}>
          {dueCount === 0
            ? "Nothing due"
            : `Review ${dueCount} ${dueCount === 1 ? "Word" : "Words"}`}
        </Text>
      </PressableScale>
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
  reviewButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
  },
  reviewButtonDisabled: { backgroundColor: Colors.border },
  reviewButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 15,
  },
});
