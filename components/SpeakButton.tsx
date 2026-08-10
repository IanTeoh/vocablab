import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Colors } from "../constants/theme";
import { speakText, stopSpeaking } from "../logic/speech";
import PressableScale from "./PressableScale";

export default function SpeakButton({
  text,
  size = 18,
  style,
}: {
  text: string;
  size?: number;
  style?: any;
}) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  function handlePress() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakText(text, {
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  return (
    <PressableScale style={[styles.button, style]} onPress={handlePress}>
      <Text
        style={{
          fontSize: size,
          color: speaking ? Colors.accent : Colors.inkMuted,
        }}
      >
        {speaking ? "🔊" : "🔈"}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4 },
});
