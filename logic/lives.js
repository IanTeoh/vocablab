import AsyncStorage from "@react-native-async-storage/async-storage";

const LIVES_KEY = "vocablab_lives";
const LIVES_DATE_KEY = "vocablab_lives_date";
export const MAX_LIVES = 3;

function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getLives() {
  const today = getTodayDateString();
  const storedDate = await AsyncStorage.getItem(LIVES_DATE_KEY);

  if (storedDate !== today) {
    // new day, lives refill
    await AsyncStorage.setItem(LIVES_DATE_KEY, today);
    await AsyncStorage.setItem(LIVES_KEY, String(MAX_LIVES));
    return MAX_LIVES;
  }

  const stored = await AsyncStorage.getItem(LIVES_KEY);
  return stored !== null ? parseInt(stored, 10) : MAX_LIVES;
}

export async function loseLife() {
  const current = await getLives();
  const updated = Math.max(current - 1, 0);
  await AsyncStorage.setItem(LIVES_KEY, String(updated));
  return updated;
}
