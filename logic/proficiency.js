import AsyncStorage from "@react-native-async-storage/async-storage";

const LEVEL_KEY = "vocablab_proficiency_level";

// Each level's own rarity weighting — replaces the single hardcoded
// weighting that used to apply to everyone regardless of skill.
// Higher weight = more likely to appear in a session.
export const PROFICIENCY_LEVELS = {
  beginner: {
    label: "Beginner",
    weights: { common: 4, rare: 2, epic: 1, legendary: 0 },
  },
  intermediate: {
    label: "Intermediate",
    weights: { common: 2, rare: 3, epic: 2, legendary: 1 },
  },
  advanced: {
    label: "Advanced",
    weights: { common: 1, rare: 2, epic: 3, legendary: 2 },
  },
  expert: {
    label: "Expert",
    weights: { common: 1, rare: 1, epic: 2, legendary: 3 },
  },
};

export async function getProficiencyLevel() {
  const raw = await AsyncStorage.getItem(LEVEL_KEY);
  return raw && PROFICIENCY_LEVELS[raw] ? raw : "intermediate";
}

export async function setProficiencyLevel(level) {
  if (!PROFICIENCY_LEVELS[level]) return;
  await AsyncStorage.setItem(LEVEL_KEY, level);
}

// Builds a quiz sampling every rarity tier so results reflect real
// range, not just luck on one difficulty band.
export function buildPlacementQuiz(allWords) {
  const byRarity = { common: [], rare: [], epic: [], legendary: [] };
  allWords.forEach((w) => {
    if (byRarity[w.rarity]) byRarity[w.rarity].push(w);
  });

  function sample(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  return [
    ...sample(byRarity.common, 3),
    ...sample(byRarity.rare, 3),
    ...sample(byRarity.epic, 3),
    ...sample(byRarity.legendary, 3),
  ].sort(() => Math.random() - 0.5);
}

// Scores per-tier accuracy and picks the level matching the highest
// tier where the person still did reasonably well, rather than just
// averaging everything together.
export function scorePlacementQuiz(results) {
  const tierScores = { common: [], rare: [], epic: [], legendary: [] };
  results.forEach(({ rarity, correct }) => {
    if (tierScores[rarity]) tierScores[rarity].push(correct);
  });

  const accuracy = (arr) =>
    arr.length === 0 ? 0 : arr.filter(Boolean).length / arr.length;

  const legendaryAcc = accuracy(tierScores.legendary);
  const epicAcc = accuracy(tierScores.epic);
  const rareAcc = accuracy(tierScores.rare);

  if (legendaryAcc >= 0.6) return "expert";
  if (epicAcc >= 0.6) return "advanced";
  if (rareAcc >= 0.6) return "intermediate";
  return "beginner";
}
