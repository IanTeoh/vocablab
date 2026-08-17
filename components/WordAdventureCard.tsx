import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Modal, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import words from "../data/words.json";
import { addWordToDictionary, getDictionary } from "../logic/dictionary";
import {
  generateAdventureSession,
  getSessionsCompletedCount,
  incrementSessionsCompleted,
} from "../logic/levels";
import { getLives, loseLife, MAX_LIVES } from "../logic/lives";
import { getProficiencyLevel, PROFICIENCY_LEVELS } from "../logic/proficiency";
import LevelQuiz from "./LevelQuiz";
import PlacementQuizModal from "./PlacementQuizModal";
import PressableScale from "./PressableScale";

type Session = { id: number; words: any[] };

export default function WordAdventureCard() {
  const [lives, setLives] = useState<number | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState<number | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [outOfLives, setOutOfLives] = useState(false);
  const [poolExhausted, setPoolExhausted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [proficiencyLevel, setProficiencyLevelState] =
    useState<string>("intermediate");
  const [placementQuizVisible, setPlacementQuizVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getLives().then(setLives);
      getSessionsCompletedCount().then(setSessionsCompleted);
      getProficiencyLevel().then(setProficiencyLevelState);
    }, []),
  );

  useEffect(() => {
    if (!justCompleted) return;
    const t = setTimeout(() => setJustCompleted(false), 4000);
    return () => clearTimeout(t);
  }, [justCompleted]);

  async function handlePlay() {
    if (lives === 0) return;
    const dictionary = await getDictionary();
    const sessionWords = await generateAdventureSession(words, dictionary, 3);

    if (sessionWords.length === 0) {
      setPoolExhausted(true);
      return;
    }

    setPoolExhausted(false);
    setOutOfLives(false);
    setJustCompleted(false);
    setActiveSession({ id: (sessionsCompleted ?? 0) + 1, words: sessionWords });
    setModalVisible(true);
  }

  async function handleLoseLife() {
    const remaining = await loseLife();
    setLives(remaining);
    return remaining;
  }

  async function handleSessionComplete() {
    const newCount = await incrementSessionsCompleted();
    setSessionsCompleted(newCount);
    setActiveSession(null);
    setModalVisible(false);
    setJustCompleted(true);
  }

  function handleOutOfLives() {
    setOutOfLives(true);
    setActiveSession(null);
    setModalVisible(false);
  }

  function handleExit() {
    setActiveSession(null);
    setModalVisible(false);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Word Adventure</Text>
      <Text style={styles.subtitle}>
        Quick rounds of words you haven't caught yet.
      </Text>
      <Text style={styles.levelBadge}>
        Level {(sessionsCompleted ?? 0) + 1}
      </Text>

      <View style={styles.livesRow}>
        <Text style={styles.livesText}>
          {lives !== null
            ? "❤️".repeat(lives) + "🖤".repeat(MAX_LIVES - lives)
            : "..."}
        </Text>
      </View>

      {(outOfLives || lives === 0) && (
        <Text style={styles.bannerTextError}>
          Out of lives — come back tomorrow for 3 more! ❤️
        </Text>
      )}

      {poolExhausted && (
        <Text style={styles.bannerTextMuted}>
          You've caught every practice word! 🎉 New rounds unlock as you add
          more words.
        </Text>
      )}

      {justCompleted && (
        <Text style={styles.bannerTextSuccess}>Round complete! 🎉</Text>
      )}

      <PressableScale
        style={[styles.playButton, lives === 0 && styles.playButtonDisabled]}
        onPress={handlePlay}
      >
        <Text style={styles.playButtonText}>
          {lives === 0 ? "Come back tomorrow" : "Play"}
        </Text>
      </PressableScale>

      <View style={styles.difficultyRow}>
        <Text style={styles.difficultyText}>
          Difficulty:{" "}
          {PROFICIENCY_LEVELS[proficiencyLevel]?.label ?? "Intermediate"}
        </Text>
        <PressableScale onPress={() => setPlacementQuizVisible(true)}>
          <Text style={styles.placementLink}>🎯 Take Placement Quiz</Text>
        </PressableScale>
      </View>

      <PlacementQuizModal
        visible={placementQuizVisible}
        onClose={() => setPlacementQuizVisible(false)}
        onLevelSet={setProficiencyLevelState}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleExit}
      >
        <SafeAreaView style={styles.modalContainer}>
          {activeSession && (
            <LevelQuiz
              level={activeSession}
              allWords={words}
              livesLeft={lives ?? 0}
              onLoseLife={handleLoseLife}
              onLevelComplete={handleSessionComplete}
              onOutOfLives={handleOutOfLives}
              onExit={handleExit}
              onWordCaught={addWordToDictionary}
            />
          )}
        </SafeAreaView>
      </Modal>
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
    fontSize: 15,
    color: Colors.inkMuted,
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  levelBadge: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  livesRow: { marginBottom: Spacing.sm },
  livesText: { fontSize: 20 },
  bannerTextError: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  bannerTextMuted: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  bannerTextSuccess: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.success,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  playButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  playButtonDisabled: {
    backgroundColor: Colors.border,
  },
  difficultyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: Spacing.sm,
  },
  difficultyText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  placementLink: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.accent,
  },
  playButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
});
