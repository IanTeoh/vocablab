import AsyncStorage from "@react-native-async-storage/async-storage";

const WORD_OF_DAY_KEY = "vocablab_word_of_day";

function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getWordOfTheDay(wordList) {
  const today = getTodayDateString();
  const raw = await AsyncStorage.getItem(WORD_OF_DAY_KEY);
  const saved = raw ? JSON.parse(raw) : null;

  if (saved && saved.date === today) {
    const word = wordList.find((w) => w.word === saved.word);
    if (word) return word;
  }

  // Pull from Epic and Legendary together — Legendary alone is too
  // small a pool now to avoid feeling repetitive day to day.
  const pool = wordList.filter(
    (w) => w.rarity === "epic" || w.rarity === "legendary",
  );
  const randomWord = pool[Math.floor(Math.random() * pool.length)];

  await AsyncStorage.setItem(
    WORD_OF_DAY_KEY,
    JSON.stringify({ date: today, word: randomWord.word }),
  );
  return randomWord;
}
