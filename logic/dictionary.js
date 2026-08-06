import AsyncStorage from "@react-native-async-storage/async-storage";

const DICTIONARY_KEY = "vocablab_dictionary";
const COMPLETED_KEY = "vocablab_completed_date";

function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getDictionary() {
  const raw = await AsyncStorage.getItem(DICTIONARY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addWordToDictionary(word) {
  const dictionary = await getDictionary();
  if (!dictionary.some((w) => w.word === word.word)) {
    dictionary.push({ ...word, addedOn: getTodayDateString() });
    await AsyncStorage.setItem(DICTIONARY_KEY, JSON.stringify(dictionary));
  }
  await AsyncStorage.setItem(COMPLETED_KEY, getTodayDateString());
}

export async function isTodayCompleted() {
  const completedDate = await AsyncStorage.getItem(COMPLETED_KEY);
  return completedDate === getTodayDateString();
}

export async function getStats(totalWordsInApp) {
  const dictionary = await getDictionary();
  const streak = parseInt(
    (await AsyncStorage.getItem("vocablab_streak")) || "0",
    10,
  );

  return {
    wordsCollected: dictionary.length,
    totalWords: totalWordsInApp,
    currentStreak: streak,
    percentComplete: Math.round((dictionary.length / totalWordsInApp) * 100),
  };
}

export async function resetAllData() {
  await AsyncStorage.multiRemove([
    DICTIONARY_KEY,
    COMPLETED_KEY,
    "vocablab_streak",
    "vocablab_last_open",
    "vocablab_word_of_day",
    "vocablab_lives",
    "vocablab_lives_date",
    "vocablab_adventure_sessions_completed",
    "vocablab_idiom_dictionary",
    "vocablab_idiom_completed_date",
    "vocablab_idiom_of_day",
    "vocablab_idiom_sessions_completed",
  ]);
}
