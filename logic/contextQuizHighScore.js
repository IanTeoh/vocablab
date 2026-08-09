import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGH_SCORE_KEY = "vocablab_context_quiz_high_score";

export async function getContextQuizHighScore() {
  const raw = await AsyncStorage.getItem(HIGH_SCORE_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export async function saveContextQuizScoreIfBetter(score) {
  const current = await getContextQuizHighScore();
  if (score > current) {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, String(score));
    return { highScore: score, isNewRecord: true };
  }
  return { highScore: current, isNewRecord: false };
}
