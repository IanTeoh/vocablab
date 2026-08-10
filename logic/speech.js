import * as Speech from "expo-speech";
import { getSoundEffectsEnabled } from "./preferences";

// Ties into the existing "Sound Effects" preference in Settings —
// turning that off also silences pronunciation, rather than adding
// yet another separate toggle for the same concept.
export async function speakText(text, options = {}) {
  const enabled = await getSoundEffectsEnabled();
  if (!enabled) {
    options.onDone?.();
    return;
  }
  Speech.stop();
  Speech.speak(text, {
    language: "en-US",
    pitch: 1.0,
    rate: 0.92,
    ...options,
  });
}

export function stopSpeaking() {
  Speech.stop();
}
