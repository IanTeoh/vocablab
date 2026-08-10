import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { evaluateAchievements, gatherAchievementStats } from "./achievements";
import { getContextQuizHighScore } from "./contextQuizHighScore";
import { getDictionary } from "./dictionary";
import { getIdiomDictionary } from "./idiomDictionary";
import { getIdiomojiHighScore } from "./idiomojiHighScore";
import { getLoanwordHighScore } from "./loanwordHighScore";
import { getShareStatsEnabled } from "./preferences";
import { getOverallDerivativesHighScore } from "./rootDerivativesHighScore";
import { getRootDictionary } from "./rootDictionary";
import { getLongestStreak } from "./streaks";
import { getUnscrambleHighScore } from "./unscrambleHighScore";

// Gathers a shareable summary of local progress — not the full
// detailed dictionaries, just enough for a friend's profile view.
export async function gatherStatsSummary() {
  const [
    words,
    idioms,
    roots,
    longestStreak,
    idiomojiHighScore,
    derivativesHighScore,
    loanwordHighScore,
    unscrambleHighScore,
    contextQuizHighScore,
    achievementStats,
  ] = await Promise.all([
    getDictionary(),
    getIdiomDictionary(),
    getRootDictionary(),
    getLongestStreak(),
    getIdiomojiHighScore(),
    getOverallDerivativesHighScore(),
    getLoanwordHighScore(),
    getUnscrambleHighScore(),
    getContextQuizHighScore(),
    gatherAchievementStats(),
  ]);

  const achievementsUnlocked = evaluateAchievements(achievementStats).filter(
    (a) => a.unlocked,
  ).length;

  return {
    wordsCollected: words.length,
    idiomsCollected: idioms.length,
    rootsCollected: roots.length,
    longestStreak,
    achievementsUnlocked,
    idiomojiHighScore: idiomojiHighScore || 0,
    derivativesHighScore: derivativesHighScore?.score || 0,
    loanwordHighScore: loanwordHighScore || 0,
    unscrambleHighScore: unscrambleHighScore || 0,
    contextQuizHighScore: contextQuizHighScore || 0,
  };
}

export async function syncStatsToCloud(uid) {
  const shareEnabled = await getShareStatsEnabled();
  if (!shareEnabled) return null;

  const stats = await gatherStatsSummary();
  await setDoc(
    doc(db, "users", uid),
    { stats, lastSyncedAt: serverTimestamp() },
    { merge: true },
  );
  return stats;
}
