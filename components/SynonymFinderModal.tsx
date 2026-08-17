import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import {
  getAllSynonymGroups,
  REGISTER_LABELS,
  searchSynonymGroups,
} from "../logic/synonyms";
import PressableScale from "./PressableScale";

export default function SynonymFinderModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [registerFilter, setRegisterFilter] = useState<string | null>(null);

  const results = query.trim()
    ? searchSynonymGroups(query)
    : getAllSynonymGroups();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🎭 Synonyms & Register</Text>
          </View>
          <Text style={styles.subtitle}>
            Search a word or idea to find formal, neutral, and informal ways to
            say it
          </Text>

          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Try 'begin', 'tired', 'money'..."
              placeholderTextColor={Colors.inkMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.filterRow}>
            {(
              ["slang", "casual", "neutral", "formal", "literary"] as const
            ).map((r) => (
              <PressableScale
                key={r}
                style={[
                  styles.filterChip,
                  registerFilter === r && {
                    backgroundColor: REGISTER_LABELS[r].color,
                    borderColor: REGISTER_LABELS[r].color,
                  },
                ]}
                onPress={() =>
                  setRegisterFilter(registerFilter === r ? null : r)
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    registerFilter === r && { color: "#fff" },
                  ]}
                >
                  {REGISTER_LABELS[r].emoji} {REGISTER_LABELS[r].label}
                </Text>
              </PressableScale>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {results.length === 0 && (
              <Text style={styles.emptyText}>
                No matches in the starter set yet — this list is intentionally
                small and growing.
              </Text>
            )}

            {results.map((group) => {
              const visibleWords = registerFilter
                ? group.words.filter((w) => w.register === registerFilter)
                : group.words;
              if (visibleWords.length === 0) return null;

              return (
                <View key={group.id} style={styles.groupCard}>
                  <Text style={styles.groupMeaning}>{group.meaning}</Text>
                  {visibleWords.map((w) => (
                    <View key={w.word} style={styles.wordRow}>
                      <Text style={styles.wordText}>{w.word}</Text>
                      <Text
                        style={[
                          styles.registerBadge,
                          {
                            color: REGISTER_LABELS[w.register].color,
                            borderColor: REGISTER_LABELS[w.register].color,
                          },
                        ]}
                      >
                        {REGISTER_LABELS[w.register].emoji}{" "}
                        {REGISTER_LABELS[w.register].label}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <PressableScale style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  title: { fontFamily: Fonts.displayBold, fontSize: 22, color: Colors.ink },
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
    fontSize: 12,
    color: Colors.inkMuted,
    paddingHorizontal: Spacing.lg,
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: 12,
    marginBottom: Spacing.sm,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.ink,
    paddingVertical: 10,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  scrollContent: { padding: Spacing.lg, paddingTop: 0 },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Spacing.xl,
  },
  groupCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  groupMeaning: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    fontStyle: "italic",
    marginBottom: Spacing.sm,
  },
  wordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  wordText: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.ink },
  registerBadge: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    textTransform: "uppercase",
  },
});
