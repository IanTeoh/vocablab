import AsyncStorage from "@react-native-async-storage/async-storage";

const IDIOM_SESSIONS_KEY = "vocablab_idiom_sessions_completed";

// No rarity tier anymore, so this is just a uniform random pick
// from idioms not yet caught.
export function generateIdiomSession(idioms, collectedIdioms, count = 3) {
  const collectedSet = new Set(collectedIdioms.map((w) => w.word));
  const pool = idioms.filter((w) => !collectedSet.has(w.word));

  if (pool.length === 0) return [];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}

export async function getIdiomSessionsCompletedCount() {
  const raw = await AsyncStorage.getItem(IDIOM_SESSIONS_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export async function incrementIdiomSessionsCompleted() {
  const current = await getIdiomSessionsCompletedCount();
  const updated = current + 1;
  await AsyncStorage.setItem(IDIOM_SESSIONS_KEY, String(updated));
  return updated;
}
