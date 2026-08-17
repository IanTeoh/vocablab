import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProficiencyLevel, PROFICIENCY_LEVELS } from "./proficiency";

const SESSIONS_KEY = "vocablab_adventure_sessions_completed";

// Picks `count` random words, weighted by the person's own
// proficiency level, excluding anything already caught. Legendary
// words can now appear here too, at whatever weight matches the
// person's level — previously excluded entirely regardless of skill.
export async function generateAdventureSession(
  words,
  collectedWords,
  count = 3,
) {
  const collectedSet = new Set(collectedWords.map((w) => w.word));
  const pool = words.filter((w) => !collectedSet.has(w.word));

  if (pool.length === 0) return [];

  const level = await getProficiencyLevel();
  const rarityWeight = PROFICIENCY_LEVELS[level].weights;

  const weighted = [];
  pool.forEach((w, i) => {
    const weight = rarityWeight[w.rarity] ?? 1;
    for (let k = 0; k < weight; k++) weighted.push(i);
  });

  if (weighted.length === 0) return [];

  const chosenIndices = new Set();
  let attempts = 0;
  while (chosenIndices.size < Math.min(count, pool.length) && attempts < 300) {
    const randIdx = weighted[Math.floor(Math.random() * weighted.length)];
    chosenIndices.add(randIdx);
    attempts++;
  }

  return Array.from(chosenIndices).map((i) => pool[i]);
}

export async function getSessionsCompletedCount() {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export async function incrementSessionsCompleted() {
  const current = await getSessionsCompletedCount();
  const updated = current + 1;
  await AsyncStorage.setItem(SESSIONS_KEY, String(updated));
  return updated;
}
