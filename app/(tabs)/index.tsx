import { SetStateAction, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import words from "../../data/words.json";
import { buildQuizOptions } from "../../logic/quiz";
import { updateStreak } from "../../logic/streaks";
import { getWordOfTheDay } from "../../logic/wordOfDay";

export default function Index() {
  const today = getWordOfTheDay(words);
  const options = useMemo(() => buildQuizOptions(today), [today.word]);

  const [streak, setStreak] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    updateStreak().then(setStreak);
  }, []);

  function handleSelect(option: SetStateAction<string | null>) {
    if (revealed) return;
    setSelected(option);
    setRevealed(true);
  }

  const isCorrect = selected === today.definition;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Word of the Day</Text>
        <Text style={styles.word}>{today.word}</Text>

        {!revealed && (
          <>
            <Text style={styles.prompt}>What does this word mean?</Text>
            {options.map((option, i) => (
              <Pressable
                key={i}
                style={styles.option}
                onPress={() => handleSelect(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
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
            <Text style={styles.definition}>{today.definition}</Text>
            <Text style={styles.example}>"{today.example}"</Text>
          </>
        )}

        {streak !== null && (
          <Text style={styles.streak}>🔥 {streak} day streak</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
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
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  word: { fontSize: 32, fontWeight: "bold", marginBottom: 16, color: "#222" },
  prompt: { fontSize: 16, color: "#444", marginBottom: 12 },
  option: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  optionText: { fontSize: 15, color: "#333" },
  result: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  definition: { fontSize: 16, color: "#444", marginBottom: 12, lineHeight: 22 },
  example: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 16,
  },
  streak: { fontSize: 16, fontWeight: "600", color: "#e65100", marginTop: 8 },
});
