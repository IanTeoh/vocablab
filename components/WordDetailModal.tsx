import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { getRarityStyle } from "../logic/rarity";
import PressableScale from "./PressableScale";

type WordDetailModalProps = {
  visible: boolean;
  word: any | null;
  onClose: () => void;
};

export default function WordDetailModal({
  visible,
  word,
  onClose,
}: WordDetailModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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
    }
  }, [visible]);

  if (!word) return null;
  const rarity = word.rarity ? getRarityStyle(word.rarity) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Pressable onPress={() => {}}>
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
            {word.example && (
              <Text style={styles.example}>"{word.example}"</Text>
            )}
            <PressableScale style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </PressableScale>
          </Pressable>
        </Animated.View>
      </Pressable>
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
