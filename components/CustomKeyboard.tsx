import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius } from "../constants/theme";
import PressableScale from "./PressableScale";

const ROW1 = "QWERTYUIOP".split("");
const ROW2 = "ASDFGHJKL".split("");
const ROW3 = "ZXCVBNM".split("");

type CustomKeyboardProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export default function CustomKeyboard({
  value,
  onChange,
  disabled,
}: CustomKeyboardProps) {
  function pressKey(letter: string) {
    if (disabled) return;
    onChange(value + letter);
  }

  function pressSpace() {
    if (disabled) return;
    onChange(value + " ");
  }

  function pressBackspace() {
    if (disabled) return;
    onChange(value.slice(0, -1));
  }

  return (
    <View style={styles.keyboard}>
      <View style={styles.row}>
        {ROW1.map((k) => (
          <PressableScale
            key={k}
            style={styles.key}
            onPress={() => pressKey(k)}
          >
            <Text style={styles.keyText}>{k}</Text>
          </PressableScale>
        ))}
      </View>
      <View style={styles.row}>
        {ROW2.map((k) => (
          <PressableScale
            key={k}
            style={styles.key}
            onPress={() => pressKey(k)}
          >
            <Text style={styles.keyText}>{k}</Text>
          </PressableScale>
        ))}
      </View>
      <View style={styles.row}>
        {ROW3.map((k) => (
          <PressableScale
            key={k}
            style={styles.key}
            onPress={() => pressKey(k)}
          >
            <Text style={styles.keyText}>{k}</Text>
          </PressableScale>
        ))}
        <PressableScale
          style={[styles.key, styles.backspaceKey]}
          onPress={pressBackspace}
        >
          <Text style={styles.keyText}>⌫</Text>
        </PressableScale>
      </View>
      <View style={styles.row}>
        <PressableScale style={styles.spaceKey} onPress={pressSpace}>
          <Text style={styles.keyText}>space</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    width: "100%",
    backgroundColor: Colors.background,
    paddingTop: 8,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 6,
  },
  key: {
    width: "8.6%",
    aspectRatio: 0.8,
    marginHorizontal: "0.4%",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  backspaceKey: {
    width: "11%",
    backgroundColor: Colors.border,
  },
  keyText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.ink,
  },
  spaceKey: {
    width: "60%",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: "center",
  },
});
