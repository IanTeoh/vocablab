import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_KEY = "vocablab_adventure_sessions_completed";

// Legendary words are reserved for Word of the Day only — never
// pulled into a Word Adventure session.
const RARITY_WEIGHT = { common: 3, rare: 2, epic: 1 };

// Picks `count` random words, biased toward lower rarity, excluding
// anything already in the dictionary and excluding legendary entirely.
export function generateAdventureSession(words, collectedWords, count = 3) {
  const collectedSet = new Set(collectedWords.map((w) => w.word));
  const pool = words.filter(
    (w) => w.rarity !== "legendary" && !collectedSet.has(w.word),
  );

  if (pool.length === 0) return [];

  const weighted = [];
  pool.forEach((w, i) => {
    const weight = RARITY_WEIGHT[w.rarity] || 1;
    for (let k = 0; k < weight; k++) weighted.push(i);
  });

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
