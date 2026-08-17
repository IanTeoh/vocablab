import { useEffect, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import words from "../data/words.json";
import { getFavoriteWords } from "../logic/favorites";
import { getRarityStyle } from "../logic/rarity";
import PressableScale from "./PressableScale";
import WordDetailModal from "./WordDetailModal";

export default function FavoriteWordsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedWord, setSelectedWord] = useState<any | null>(null);

  useEffect(() => {
    if (visible) loadFavorites();
  }, [visible]);

  async function loadFavorites() {
    const favWords = await getFavoriteWords();
    const resolved = favWords
      .map((w) => (words as any[]).find((word) => word.word === w))
      .filter(Boolean);
    setFavorites(resolved);
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>❤️ Favorite Words</Text>
        </View>
        <Text style={styles.subtitle}>
          Words you've marked to use more often
        </Text>

        <FlatList
          data={favorites}
          keyExtractor={(item) => item.word}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No favorites yet — tap the heart on any word while reviewing or
              browsing to add it here.
            </Text>
          }
          renderItem={({ item }) => {
            const rarity = getRarityStyle(item.rarity);
            return (
              <PressableScale
                style={styles.wordRow}
                onPress={() => setSelectedWord(item)}
              >
                {item.icon && <Text style={styles.wordIcon}>{item.icon}</Text>}
                <View style={{ flex: 1 }}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  <Text style={styles.wordDefinition} numberOfLines={1}>
                    {item.definition}
                  </Text>
                </View>
                <Text style={[styles.rarityTag, { color: rarity.color }]}>
                  {rarity.label}
                </Text>
              </PressableScale>
            );
          }}
        />

        <View style={styles.footer}>
          <PressableScale style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </PressableScale>
        </View>

        <WordDetailModal
          visible={!!selectedWord}
          word={selectedWord}
          onClose={() => {
            setSelectedWord(null);
            loadFavorites();
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 24, color: Colors.ink },
  footer: { padding: Spacing.lg, paddingTop: 0 },
  closeButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 14,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    paddingHorizontal: Spacing.lg,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  listContent: { padding: Spacing.lg, paddingTop: 0 },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  wordIcon: { fontSize: 22, marginRight: Spacing.sm },
  wordText: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.ink },
  wordDefinition: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 1,
  },
  rarityTag: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    textTransform: "uppercase",
  },
});
