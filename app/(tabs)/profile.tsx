import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import PressableScale from "../../components/PressableScale";
import words from "../../data/words.json";
import { getCategoryProgress } from "../../logic/categories";
import { getDictionary, getStats, resetAllData } from "../../logic/dictionary";
import { getRarityStyle } from "../../logic/rarity";

export default function Profile() {
  const [stats, setStats] = useState(null);
  const [collectedWords, setCollectedWords] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getStats(words.length).then(setStats);
      getDictionary().then(setCollectedWords);
    }, []),
  );

  const collectedSet = new Set(collectedWords.map((w) => w.word));
  const categoryProgress = getCategoryProgress(words, collectedWords);

  function handleReset() {
    Alert.alert("Reset all data?", "For testing only.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await resetAllData();
          setStats(await getStats(words.length));
          setCollectedWords([]);
        },
      },
    ]);
  }

  return (
    <FlatList
      style={styles.container}
      data={categoryProgress}
      keyExtractor={(item) => item.category}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Your Dictionary</Text>
          {stats && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>🔥 Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.wordsCollected}</Text>
                <Text style={styles.statLabel}>Words Caught</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.percentComplete}%</Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>{item.category}</Text>
            <Text style={styles.categoryProgressText}>
              {item.caught}/{item.total}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[styles.progressBarFill, { width: `${item.percent}%` }]}
            />
          </View>
          <View style={styles.grid}>
            {item.words.map((w) => {
              const caught = collectedSet.has(w.word);
              const rarity = getRarityStyle(w.rarity);
              return (
                <View
                  key={w.word}
                  style={[
                    styles.wordTile,
                    caught
                      ? {
                          backgroundColor: "#fff",
                          borderWidth: 2,
                          borderColor: rarity.color,
                        }
                      : styles.tileLocked,
                  ]}
                >
                  <Text style={styles.tileEmoji}>{caught ? "📖" : "🔒"}</Text>
                  <Text
                    style={[styles.tileText, caught && { color: rarity.color }]}
                    numberOfLines={1}
                  >
                    {caught ? w.word : "?????"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
      ListFooterComponent={
        <PressableScale style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>
            🧪 Reset App Data (dev only)
          </Text>
        </PressableScale>
      }
      contentContainerStyle={{ padding: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, marginTop: 8 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#e65100" },
  statLabel: { fontSize: 12, color: "#888", marginTop: 4, textAlign: "center" },
  categorySection: { marginBottom: 24 },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  categoryProgressText: { fontSize: 13, color: "#888" },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 999,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBarFill: { height: 6, backgroundColor: "#e65100", borderRadius: 999 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  wordTile: {
    width: "31%",
    aspectRatio: 1,
    margin: "1.16%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  tileLocked: { backgroundColor: "#eee" },
  tileEmoji: { fontSize: 22, marginBottom: 4 },
  tileText: { fontSize: 11, fontWeight: "600", color: "#444" },
  resetButton: {
    borderWidth: 1,
    borderColor: "#c62828",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  resetButtonText: { color: "#c62828", fontSize: 13, fontWeight: "600" },
});
