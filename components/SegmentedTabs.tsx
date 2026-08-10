import { StyleSheet, Text, View } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import PressableScale from "./PressableScale";

export default function SegmentedTabs({
  segments,
  active,
  onChange,
}: {
  segments: string[];
  active: string;
  onChange: (segment: string) => void;
}) {
  return (
    <View style={styles.bar}>
      {segments.map((label) => (
        <PressableScale
          key={label}
          style={
            active === label
              ? [styles.button, styles.buttonActive]
              : styles.button
          }
          onPress={() => onChange(label)}
        >
          <Text
            style={[
              styles.text,
              active === label ? styles.textActive : undefined,
            ]}
          >
            {label}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", marginBottom: Spacing.md },
  button: {
    flex: 1,
    paddingVertical: 9,
    marginHorizontal: 3,
    borderRadius: Radius.pill,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  textActive: { color: "#fff" },
});
