import AsyncStorage from "@react-native-async-storage/async-storage";
import achievementsList from "../data/achievements.json";
import idioms from "../data/idioms.json";
import roots from "../data/roots.json";
import words from "../data/words.json";
import { getContextQuizHighScore } from "./contextQuizHighScore";
import { getDictionary } from "./dictionary";
import { getIdiomDictionary } from "./idiomDictionary";
import { getIdiomojiHighScore } from "./idiomojiHighScore";
import { getLoanwordHighScore } from "./loanwordHighScore";
import { getOverallDerivativesHighScore } from "./rootDerivativesHighScore";
import { getRootDictionary } from "./rootDictionary";
import { getLongestStreak } from "./streaks";
import { getUnscrambleHighScore } from "./unscrambleHighScore";

const SEEN_KEY = "vocablab_achievements_seen";

// Gathers every stat achievements might depend on, in one place.
export async function gatherAchievementStats() {
  const [
    collectedWords,
    collectedIdioms,
    collectedRoots,
    longestStreak,
    idiomojiHighScore,
    derivativesHighScore,
    loanwordHighScore,
    unscrambleHighScore,
    contextQuizHighScore,
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
  ]);

  const rarityCounts = { common: 0, rare: 0, epic: 0, legendary: 0 };
  collectedWords.forEach((w) => {
    if (rarityCounts[w.rarity] !== undefined) rarityCounts[w.rarity]++;
  });

  const categoryTotals = {};
  const categoryCaught = {};
  words.forEach((w) => {
    categoryTotals[w.category] = (categoryTotals[w.category] || 0) + 1;
  });
  const caughtWordNames = new Set(collectedWords.map((w) => w.word));
  words.forEach((w) => {
    if (caughtWordNames.has(w.word)) {
      categoryCaught[w.category] = (categoryCaught[w.category] || 0) + 1;
    }
  });

  return {
    wordsTotal: collectedWords.length,
    rarityCounts,
    idiomsTotal: collectedIdioms.length,
    idiomsFullTotal: idioms.length,
    rootsTotal: collectedRoots.length,
    rootsFullTotal: roots.length,
    longestStreak,
    idiomojiHighScore: idiomojiHighScore || 0,
    derivativesHighScore: derivativesHighScore?.score || 0,
    loanwordHighScore: loanwordHighScore || 0,
    unscrambleHighScore: unscrambleHighScore || 0,
    contextQuizHighScore: contextQuizHighScore || 0,
    categoryTotals,
    categoryCaught,
    wordsFullTotal: words.length,
  };
}

function isUnlocked(achievement, stats) {
  switch (achievement.type) {
    case "words_total":
      return stats.wordsTotal >= achievement.threshold;
    case "words_rarity":
      return (
        (stats.rarityCounts[achievement.rarity] || 0) >= achievement.threshold
      );
    case "idioms_total":
      return stats.idiomsTotal >= achievement.threshold;
    case "roots_total":
      return stats.rootsTotal >= achievement.threshold;
    case "streak_longest":
      return stats.longestStreak >= achievement.threshold;
    case "idiomoji_score":
      return stats.idiomojiHighScore >= achievement.threshold;
    case "derivatives_score":
      return stats.derivativesHighScore >= achievement.threshold;
    case "loanword_score":
      return stats.loanwordHighScore >= achievement.threshold;
    case "unscramble_score":
      return stats.unscrambleHighScore >= achievement.threshold;
    case "context_score":
      return stats.contextQuizHighScore >= achievement.threshold;
    case "category_complete":
      return (
        stats.categoryTotals[achievement.category] > 0 &&
        stats.categoryCaught[achievement.category] ===
          stats.categoryTotals[achievement.category]
      );
    case "idioms_complete":
      return (
        stats.idiomsTotal >= stats.idiomsFullTotal && stats.idiomsFullTotal > 0
      );
    case "roots_complete":
      return (
        stats.rootsTotal >= stats.rootsFullTotal && stats.rootsFullTotal > 0
      );
    case "all_complete":
      return (
        stats.wordsTotal >= stats.wordsFullTotal &&
        stats.idiomsTotal >= stats.idiomsFullTotal &&
        stats.rootsTotal >= stats.rootsFullTotal
      );
    default:
      return false;
  }
}

// Returns every achievement with its unlocked status attached.
export function evaluateAchievements(stats) {
  return achievementsList.map((a) => ({
    ...a,
    unlocked: isUnlocked(a, stats),
  }));
}

export async function getSeenAchievementIds() {
  const raw = await AsyncStorage.getItem(SEEN_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function markSeen(ids) {
  const seen = await getSeenAchievementIds();
  const updated = [...new Set([...seen, ...ids])];
  await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(updated));
}

// Call this from any screen's focus effect. Gathers fresh stats,
// figures out which unlocked achievements haven't been celebrated
// yet, marks them seen, and returns the newly-unlocked ones so the
// caller can show a toast.
export async function checkForNewAchievements() {
  const stats = await gatherAchievementStats();
  const evaluated = evaluateAchievements(stats);
  const unlockedIds = evaluated.filter((a) => a.unlocked).map((a) => a.id);
  const seenIds = new Set(await getSeenAchievementIds());

  const newlyUnlocked = evaluated.filter(
    (a) => a.unlocked && !seenIds.has(a.id),
  );

  if (unlockedIds.length > 0) {
    await markSeen(unlockedIds);
  }

  return newlyUnlocked;
}
