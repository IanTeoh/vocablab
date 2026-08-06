import AsyncStorage from "@react-native-async-storage/async-storage";

const IDIOM_OF_DAY_KEY = "vocablab_idiom_of_day";

function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getIdiomOfTheDay(idiomList) {
  const today = getTodayDateString();

  const raw = await AsyncStorage.getItem(IDIOM_OF_DAY_KEY);
  const saved = raw ? JSON.parse(raw) : null;

  if (saved && saved.date === today) {
    const idiom = idiomList.find((w) => w.word === saved.word);
    if (idiom) return idiom;
  }

  const randomIdiom = idiomList[Math.floor(Math.random() * idiomList.length)];
  await AsyncStorage.setItem(
    IDIOM_OF_DAY_KEY,
    JSON.stringify({ date: today, word: randomIdiom.word }),
  );
  return randomIdiom;
}
