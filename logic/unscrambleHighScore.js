import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGH_SCORE_KEY = "vocablab_unscramble_high_score";

export async function getUnscrambleHighScore() {
  const raw = await AsyncStorage.getItem(HIGH_SCORE_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export async function saveUnscrambleScoreIfBetter(score) {
  const current = await getUnscrambleHighScore();
  if (score > current) {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score));
    return { highScore: score, isNewRecord: true };
  }
  return { highScore: current, isNewRecord: false };
}
