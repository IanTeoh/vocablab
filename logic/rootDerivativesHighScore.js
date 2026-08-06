import AsyncStorage from "@react-native-async-storage/async-storage";

const OVERALL_HIGH_SCORE_KEY = "vocablab_root_derivatives_high_score_v2";
const PER_ROOT_SCORES_KEY = "vocablab_root_derivatives_scores";

// Overall high score is stored as { score, root } so the UI can show
// which root the record belongs to.
export async function getOverallDerivativesHighScore() {
  const raw = await AsyncStorage.getItem(OVERALL_HIGH_SCORE_KEY);
  return raw ? JSON.parse(raw) : { score: 0, root: null };
}

export async function getPerRootScores() {
  const raw = await AsyncStorage.getItem(PER_ROOT_SCORES_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function getRootScore(rootName) {
  const scores = await getPerRootScores();
  return scores[rootName] || 0;
}

// Updates both the overall high score (only reassigning the "record
// holder" root when the score is strictly beaten, not tied) and this
// specific root's personal best.
export async function recordDerivativesScore(rootName, score) {
  const overallCurrent = await getOverallDerivativesHighScore();
  const overallNewRecord = score > overallCurrent.score;
  const overall = overallNewRecord ? { score, root: rootName } : overallCurrent;
  if (overallNewRecord) {
    await AsyncStorage.setItem(OVERALL_HIGH_SCORE_KEY, JSON.stringify(overall));
  }

  const scores = await getPerRootScores();
  const rootCurrent = scores[rootName] || 0;
  const rootNewRecord = score > rootCurrent;
  const rootHighScore = rootNewRecord ? score : rootCurrent;
  if (rootNewRecord) {
    scores[rootName] = rootHighScore;
    await AsyncStorage.setItem(PER_ROOT_SCORES_KEY, JSON.stringify(scores));
  }

  return {
    overallHighScore: overall.score,
    overallHighScoreRoot: overall.root,
    overallNewRecord,
    rootHighScore,
    rootNewRecord,
  };
}
