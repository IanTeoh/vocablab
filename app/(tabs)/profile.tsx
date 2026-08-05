import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundPattern from "../../components/BackgroundPattern";
import PressableScale from "../../components/PressableScale";
import WordDetailModal from "../../components/WordDetailModal";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";
import words from "../../data/words.json";
import { getCategoryProgress } from "../../logic/categories";
import { getDictionary, getStats, resetAllData } from "../../logic/dictionary";
import { getSessionsCompletedCount } from "../../logic/levels";
import { getRarityStyle } from "../../logic/rarity";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Profile() {
  const [stats, setStats] = useState<any | null>(null);
  const [collectedWords, setCollectedWords] = useState<any[]>([]);
  const [adventureLevel, setAdventureLevel] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  function openCategory(item: any) {
    setSelectedCategory(item);
    slideAnim.setValue(SCREEN_WIDTH);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }

  function closeCategoryModal() {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 240,
      useNativeDriver: true,
    }).start(() => setSelectedCategory(null));
  }

  useFocusEffect(
    useCallback(() => {
      getStats(words.length).then(setStats);
      getDictionary().then(setCollectedWords);
      getSessionsCompletedCount().then((count) => setAdventureLevel(count + 1));
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
          setAdventureLevel(1);
        },
      },
    ]);
  }

  function renderWordTile(w: any) {
    const caught = collectedSet.has(w.word);
    const rarity = getRarityStyle(w.rarity);
    const tileStyle = [
      styles.wordTile,
      caught
        ? {
            backgroundColor: Colors.surface,
            borderWidth: 2,
            borderColor: rarity.color,
          }
        : styles.tileLocked,
    ];
    const content = (
      <>
        <Text style={styles.tileEmoji}>{caught ? "📖" : "🔒"}</Text>
        <Text
          style={[styles.tileText, caught && { color: rarity.color }]}
          numberOfLines={1}
        >
          {caught ? w.word : "?????"}
        </Text>
      </>
    );

    if (!caught) {
      return (
        <View key={w.word} style={tileStyle}>
          {content}
        </View>
      );
    }

    return (
      <PressableScale
        key={w.word}
        style={tileStyle}
        onPress={() => setSelectedWord(w)}
      >
        {content}
      </PressableScale>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.background }}
      edges={["top"]}
    >
      <BackgroundPattern />

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
                  <Text style={styles.statNumber}>
                    {stats.percentComplete}%
                  </Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{adventureLevel ?? "-"}</Text>
                  <Text style={styles.statLabel}>Adventure Level</Text>
                </View>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => {
          const sortedWords = [...item.words].sort((a: any, b: any) => {
            const scoreOf = (w: any) =>
              (collectedSet.has(w.word) ? 2 : 0) +
              (w.rarity === "legendary" ? 1 : 0);
            return scoreOf(b) - scoreOf(a);
          });
          const previewWords = sortedWords.slice(0, 3);
          const hasMore = item.words.length > 3;

          return (
            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{item.category}</Text>
                <View style={styles.headerRightRow}>
                  <Text style={styles.categoryProgressText}>
                    {item.caught}/{item.total}
                  </Text>
                  {hasMore && (
                    <PressableScale
                      style={styles.seeAllLink}
                      onPress={() => openCategory(item)}
                    >
                      <Text style={styles.seeAllLinkText}>See all →</Text>
                    </PressableScale>
                  )}
                </View>
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.percent}%` },
                  ]}
                />
              </View>
              <View style={styles.grid}>
                {previewWords.map((w: any) => renderWordTile(w))}
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <PressableScale style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>
              🧪 Reset App Data (dev only)
            </Text>
          </PressableScale>
        }
        contentContainerStyle={{ padding: Spacing.lg }}
      />

      <Modal
        visible={!!selectedCategory}
        animationType="none"
        transparent
        onRequestClose={closeCategoryModal}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {selectedCategory?.category}
              </Text>
              <Text style={styles.modalSubtitle}>
                {selectedCategory?.caught}/{selectedCategory?.total} caught
              </Text>
              <View style={styles.grid}>
                {selectedCategory?.words.map((w: any) => renderWordTile(w))}
              </View>
              <PressableScale
                style={styles.closeButton}
                onPress={closeCategoryModal}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </PressableScale>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </Modal>

      <WordDetailModal
        visible={!!selectedWord}
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
    color: Colors.ink,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  statBox: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.accent,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
    textAlign: "center",
  },
  categorySection: { marginBottom: Spacing.lg },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.ink,
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryProgressText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  seeAllLink: {
    marginLeft: 10,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  seeAllLinkText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: Radius.pill,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 },
  wordTile: {
    width: "31%",
    aspectRatio: 1,
    margin: "1.16%",
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  tileLocked: { backgroundColor: Colors.border },
  tileEmoji: { fontSize: 22, marginBottom: 4 },
  tileText: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.ink },
  resetButton: {
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  resetButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.error,
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    width: SCREEN_WIDTH,
  },
  modalContent: { padding: Spacing.lg },
  modalTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.lg,
  },
  closeButton: {
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 15,
  },
});
