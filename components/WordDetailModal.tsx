import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { isFavorite, toggleFavorite } from "../logic/favorites";
import { getRarityStyle } from "../logic/rarity";
import { getSynonymsForWord, REGISTER_LABELS } from "../logic/synonyms";
import PressableScale from "./PressableScale";

type WordDetailModalProps = {
  visible: boolean;
  word: any | null;
  onClose: () => void;
  standalone?: boolean;
};

export default function WordDetailModal({
  visible,
  word,
  onClose,
  standalone = true,
}: WordDetailModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
        }),
      ]).start();
      if (word) isFavorite(word.word).then(setFavorited);
    }
  }, [visible, word?.word]);

  async function handleToggleFavorite() {
    if (!word) return;
    await toggleFavorite(word.word);
    setFavorited((f) => !f);
  }

  if (!word || !visible) return null;
  const rarity = word.rarity ? getRarityStyle(word.rarity) : null;
  const synonymData = getSynonymsForWord(word.word);

  const content = (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Pressable onPress={() => {}}>
          <PressableScale
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Text style={styles.favoriteIcon}>{favorited ? "❤️" : "🤍"}</Text>
          </PressableScale>
          {rarity && (
            <Text
              style={[
                styles.rarityBadge,
                { color: rarity.color, borderColor: rarity.color },
              ]}
            >
              {rarity.label}
            </Text>
          )}
          {word.icon && <Text style={styles.icon}>{word.icon}</Text>}
          <Text style={styles.word}>{word.word}</Text>
          <Text style={styles.definition}>{word.definition}</Text>
          {word.example && <Text style={styles.example}>"{word.example}"</Text>}

          {synonymData && (
            <View style={styles.synonymSection}>
              <Text style={styles.synonymLabel}>Other ways to say this</Text>
              {synonymData.alternatives.map((alt) => (
                <View key={alt.word} style={styles.synonymRow}>
                  <Text style={styles.synonymEmoji}>
                    {REGISTER_LABELS[alt.register].emoji}
                  </Text>
                  <Text style={styles.synonymWord}>{alt.word}</Text>
                  <Text
                    style={[
                      styles.synonymRegister,
                      { color: REGISTER_LABELS[alt.register].color },
                    ]}
                  >
                    {REGISTER_LABELS[alt.register].label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <PressableScale style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </PressableScale>
        </Pressable>
      </Animated.View>
    </Pressable>
  );

  if (!standalone) {
    // Rendered inside another already-open Modal — no nested Modal
    // wrapper, just an absolutely-positioned overlay in the same
    // native window, so touches route correctly.
    return (
      <Animated.View style={StyleSheet.absoluteFillObject}>
        {content}
      </Animated.View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(36, 49, 43, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  favoriteButton: {
    position: "absolute",
    top: -4,
    right: -4,
    zIndex: 10,
    padding: 6,
  },
  favoriteIcon: { fontSize: 20 },
  rarityBadge: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
    alignSelf: "center",
  },
  word: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
    color: Colors.ink,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  icon: { fontSize: 40, textAlign: "center", marginBottom: Spacing.xs },
  definition: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.ink,
    textAlign: "center",
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  example: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  synonymSection: {
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  synonymLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  synonymRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  synonymEmoji: { fontSize: 12, marginRight: 6 },
  synonymWord: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.ink,
  },
  synonymRegister: { fontFamily: Fonts.bodySemiBold, fontSize: 11 },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: "center",
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.inkMuted,
    fontSize: 14,
  },
});
