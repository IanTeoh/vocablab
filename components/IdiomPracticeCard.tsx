import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Modal, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import idioms from "../data/idioms.json";
import {
    addIdiomToDictionary,
    getIdiomDictionary,
} from "../logic/idiomDictionary";
import { generateIdiomSession } from "../logic/idiomSessions";
import { getLives, loseLife, MAX_LIVES } from "../logic/lives";
import LevelQuiz from "./LevelQuiz";
import PressableScale from "./PressableScale";

type Session = { id: number; words: any[]; title: string };

export default function IdiomPracticeCard({
  onCaught,
}: {
  onCaught?: () => void;
}) {
  const [lives, setLives] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [outOfLives, setOutOfLives] = useState(false);
  const [poolExhausted, setPoolExhausted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getLives().then(setLives);
    }, []),
  );

  useEffect(() => {
    if (!justCompleted) return;
    const t = setTimeout(() => setJustCompleted(false), 4000);
    return () => clearTimeout(t);
  }, [justCompleted]);

  async function handlePlay() {
    if (lives === 0) return;
    const dictionary = await getIdiomDictionary();
    const sessionWords = generateIdiomSession(idioms, dictionary, 3);

    if (sessionWords.length === 0) {
      setPoolExhausted(true);
      return;
    }

    setPoolExhausted(false);
    setOutOfLives(false);
    setJustCompleted(false);
    setActiveSession({ id: 0, words: sessionWords, title: "" });
    setModalVisible(true);
  }

  async function handleLoseLife() {
    const remaining = await loseLife();
    setLives(remaining);
    return remaining;
  }

  async function handleWordCaught(idiom: any) {
    await addIdiomToDictionary(idiom);
    onCaught?.();
  }

  function handleSessionComplete() {
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
      <Text style={styles.label}>Idiom Practice</Text>
      <Text style={styles.subtitle}>
        Quick rounds of idioms you haven't caught yet.
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
          Out of lives — come back tomorrow for 3 more!
        </Text>
      )}

      {poolExhausted && (
        <Text style={styles.bannerTextMuted}>
          You've caught every idiom! 🎉 New ones unlock as more get added.
        </Text>
      )}

      {justCompleted && (
        <Text style={styles.bannerTextSuccess}>Round complete! 🎉</Text>
      )}

      <PressableScale
        style={[
          styles.playButton,
          ...(lives === 0 ? [styles.playButtonDisabled] : []),
        ]}
        onPress={handlePlay}
      >
        <Text style={styles.playButtonText}>
          {lives === 0 ? "Come back tomorrow" : "Play"}
        </Text>
      </PressableScale>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleExit}
      >
        <SafeAreaView style={styles.modalContainer}>
          {activeSession && (
            <LevelQuiz
              level={activeSession}
              allWords={idioms}
              livesLeft={lives ?? 0}
              onLoseLife={handleLoseLife}
              onLevelComplete={handleSessionComplete}
              onOutOfLives={handleOutOfLives}
              onExit={handleExit}
              onWordCaught={handleWordCaught}
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
    marginBottom: Spacing.md,
    textAlign: "center",
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
  playButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
});
