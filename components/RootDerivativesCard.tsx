import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { pickRandomCaughtRoot } from "../logic/derivativesGame";
import {
  getOverallDerivativesHighScore,
  getRootScore,
} from "../logic/rootDerivativesHighScore";
import { getRootDictionary } from "../logic/rootDictionary";
import PressableScale from "./PressableScale";
import RulesModal from "./RulesModal";

const RULES = [
  "Pick a root you've already caught in Root of the Day — tap a root to see your personal best with it first.",
  "You get 60 seconds to type as many real words derived from that root as you can.",
  "Wrong or duplicate guesses cost nothing — just try again.",
  "You get 1 hint per round, revealing a word you haven't found yet.",
  "Your best score is saved both per-root and as an overall record.",
];

const MIN_ROOTS_TO_UNLOCK = 1;
const SEARCH_THRESHOLD = 20;

function chunkArray(arr: any[], size: number) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default function RootDerivativesCard({
  onStart,
  refreshKey,
}: {
  onStart: (root: any) => void;
  refreshKey?: number;
}) {
  const [caughtRoots, setCaughtRoots] = useState<any[]>([]);
  const [highScore, setHighScore] = useState<{
    score: number;
    root: string | null;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoot, setSelectedRoot] = useState<any | null>(null);
  const [selectedRootScore, setSelectedRootScore] = useState<number | null>(
    null,
  );
  const [rootSearch, setRootSearch] = useState("");
  const [rulesVisible, setRulesVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getRootDictionary().then(setCaughtRoots);
      getOverallDerivativesHighScore().then(setHighScore);
    }, []),
  );

  // Refresh when a root is actually caught elsewhere on this tab —
  // not on every tap, so opening the picker never has to wait on
  // AsyncStorage.
  useEffect(() => {
    getRootDictionary().then(setCaughtRoots);
  }, [refreshKey]);

  function openPicker() {
    setSelectedRoot(null);
    setRootSearch("");
    setModalVisible(true);
  }

  function handleChipPress(root: any) {
    setSelectedRoot(root);
    getRootScore(root.root).then(setSelectedRootScore);
  }

  function handleStart() {
    if (!selectedRoot) return;
    setModalVisible(false);
    onStart(selectedRoot);
  }

  function handleRandomStart() {
    const root = pickRandomCaughtRoot(caughtRoots);
    if (root) {
      setModalVisible(false);
      onStart(root);
    }
  }

  const hasCaughtRoots = caughtRoots.length >= MIN_ROOTS_TO_UNLOCK;

  return (
    <View style={styles.card}>
      <View style={styles.accentStripe} />
      <PressableScale
        style={styles.helpButton}
        onPress={() => setRulesVisible(true)}
      >
        <Text style={styles.helpButtonText}>?</Text>
      </PressableScale>
      <View style={styles.content}>
        <Text style={styles.gameIcon}>🧩</Text>
        <Text style={styles.title}>Root Derivatives</Text>
        <Text style={styles.subtitle}>
          Pick a root you've caught and list as many derived words as you can in
          60 seconds.
        </Text>

        <View style={styles.highScorePill}>
          <Text style={styles.highScoreText}>
            🏆 Best: {highScore?.score ?? "..."}
            {highScore && highScore.score > 0 && highScore.root
              ? ` (${highScore.root})`
              : ""}
          </Text>
        </View>

        {!hasCaughtRoots ? (
          <Text style={styles.lockedText}>
            Catch a root in Root of the Day first to unlock this game.
          </Text>
        ) : (
          <PressableScale style={styles.startButton} onPress={openPicker}>
            <Text style={styles.startButtonText}>🚀 Play</Text>
          </PressableScale>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {!selectedRoot ? (
              <>
                <Text style={styles.pickTitle}>Choose a root</Text>
                <Text style={styles.pickSubtitle}>
                  Tap a root to see your best score with it
                </Text>
                <PressableScale
                  style={styles.randomButton}
                  onPress={handleRandomStart}
                >
                  <Text style={styles.randomButtonText}>🎲 Random Root</Text>
                </PressableScale>

                {caughtRoots.length >= SEARCH_THRESHOLD && (
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search your roots..."
                    placeholderTextColor={Colors.inkMuted}
                    value={rootSearch}
                    onChangeText={setRootSearch}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

                <FlatList
                  style={styles.rootScroll}
                  keyboardShouldPersistTaps="handled"
                  data={chunkArray(
                    caughtRoots.filter((r) =>
                      r.root
                        .toLowerCase()
                        .includes(rootSearch.trim().toLowerCase()),
                    ),
                    3,
                  )}
                  keyExtractor={(row: any[], index: number) =>
                    `row-${index}-${row[0]?.root}`
                  }
                  initialNumToRender={10}
                  windowSize={5}
                  maxToRenderPerBatch={10}
                  renderItem={({ item: row }: { item: any[] }) => (
                    <View style={styles.rootGrid}>
                      {row.map((r) => (
                        <PressableScale
                          key={r.root}
                          style={styles.rootChip}
                          onPress={() => handleChipPress(r)}
                        >
                          <Text style={styles.rootChipIcon}>{r.icon}</Text>
                          <Text style={styles.rootChipText}>{r.root}</Text>
                        </PressableScale>
                      ))}
                    </View>
                  )}
                />

                <PressableScale
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </PressableScale>
              </>
            ) : (
              <View style={styles.detailBox}>
                <Text style={styles.detailIcon}>{selectedRoot.icon}</Text>
                <Text style={styles.detailRoot}>{selectedRoot.root}</Text>
                <Text style={styles.detailMeaning}>
                  {selectedRoot.meaning} ({selectedRoot.origin})
                </Text>
                <Text style={styles.detailDerivativeCount}>
                  {selectedRoot.derivatives.length <= 3
                    ? `🎯 ${selectedRoot.derivatives.length} known derivatives — a quick, focused round`
                    : `${selectedRoot.derivatives.length} known derivatives to find`}
                </Text>
                <View style={styles.detailScorePill}>
                  <Text style={styles.detailScoreText}>
                    🏆 Your best: {selectedRootScore ?? "..."}
                  </Text>
                </View>
                <PressableScale
                  style={styles.startButton}
                  onPress={handleStart}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </PressableScale>
                <PressableScale
                  style={styles.exitButton}
                  onPress={() => setSelectedRoot(null)}
                >
                  <Text style={styles.exitButtonText}>← Back to roots</Text>
                </PressableScale>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      <RulesModal
        visible={rulesVisible}
        onClose={() => setRulesVisible(false)}
        title="🧩 Root Derivatives Rules"
        rules={RULES}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  accentStripe: {
    height: 5,
    backgroundColor: Colors.accent,
  },
  helpButton: {
    position: "absolute",
    top: 13,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  helpButtonText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  content: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  gameIcon: { fontSize: 30, marginBottom: Spacing.xs },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  lockedText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
  },
  highScorePill: {
    backgroundColor: Colors.background,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: Spacing.md,
  },
  highScoreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.accent,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  startButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  pickTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 22,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  pickSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  randomButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radius.pill,
    marginBottom: Spacing.lg,
  },
  randomButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 15,
  },
  searchInput: {
    width: "100%",
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  rootScroll: {
    maxHeight: 260,
    width: "100%",
    marginBottom: Spacing.sm,
  },
  rootGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  rootChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 4,
    alignItems: "center",
    minWidth: 70,
  },
  rootChipIcon: { fontSize: 18 },
  rootChipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.ink,
    marginTop: 2,
  },
  exitButton: { paddingVertical: 8, marginTop: Spacing.xs },
  exitButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 13,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  cancelButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 14,
  },
  detailBox: { alignItems: "center" },
  detailIcon: { fontSize: 48, marginBottom: Spacing.xs },
  detailRoot: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  detailMeaning: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  detailDerivativeCount: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.accent,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  detailScorePill: {
    backgroundColor: Colors.background,
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: Spacing.lg,
  },
  detailScoreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.accent,
  },
});
