import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import PressableScale from "./PressableScale";

type RulesModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  rules: string[];
};

export default function RulesModal({
  visible,
  onClose,
  title,
  rules,
}: RulesModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {rules.map((rule, i) => (
            <View key={i} style={styles.ruleRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
          <PressableScale style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Got it</Text>
          </PressableScale>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: "100%",
    maxWidth: 380,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  ruleRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  bullet: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.accent,
    marginRight: 8,
  },
  ruleText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  closeButtonText: {
    fontFamily: Fonts.bodySemiBold,
    color: "#fff",
    fontSize: 15,
  },
});
