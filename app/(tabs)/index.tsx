import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import words from "../../data/words.json";
import { updateStreak } from "../../logic/streaks";
import { getWordOfTheDay } from "../../logic/wordOfDay";

export default function Index() {
  const today = getWordOfTheDay(words);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    updateStreak().then(setStreak);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Word of the Day</Text>
        <Text style={styles.word}>{today.word}</Text>
        <Text style={styles.definition}>{today.definition}</Text>
        <Text style={styles.example}>"{today.example}"</Text>
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
  word: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
  },
  definition: {
    fontSize: 16,
    color: "#444",
    marginBottom: 12,
    lineHeight: 22,
  },
  example: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  streak: {
    fontSize: 16,
    color: "#ff6b35",
    fontWeight: "bold",
    marginTop: 12,
  },
});
