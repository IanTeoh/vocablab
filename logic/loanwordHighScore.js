import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGH_SCORE_KEY = "vocablab_loanword_play_high_score";

export async function getLoanwordHighScore() {
  const raw = await AsyncStorage.getItem(HIGH_SCORE_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export async function saveLoanwordScoreIfBetter(score) {
  const current = await getLoanwordHighScore();
  if (score > current) {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score));
    return { highScore: score, isNewRecord: true };
  }
  return { highScore: current, isNewRecord: false };
}
