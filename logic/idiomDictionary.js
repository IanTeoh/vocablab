import AsyncStorage from "@react-native-async-storage/async-storage";

const IDIOM_DICTIONARY_KEY = "vocablab_idiom_dictionary";
const IDIOM_COMPLETED_KEY = "vocablab_idiom_completed_date";

function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getIdiomDictionary() {
  const raw = await AsyncStorage.getItem(IDIOM_DICTIONARY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addIdiomToDictionary(idiom) {
  const dictionary = await getIdiomDictionary();
  if (!dictionary.some((w) => w.word === idiom.word)) {
    dictionary.push({ ...idiom, addedOn: getTodayDateString() });
    await AsyncStorage.setItem(
      IDIOM_DICTIONARY_KEY,
      JSON.stringify(dictionary),
    );
  }
  await AsyncStorage.setItem(IDIOM_COMPLETED_KEY, getTodayDateString());
}

export async function isTodayIdiomCompleted() {
  const completedDate = await AsyncStorage.getItem(IDIOM_COMPLETED_KEY);
  return completedDate === getTodayDateString();
}

export async function getIdiomStats(totalIdiomsInApp) {
  const dictionary = await getIdiomDictionary();
  return {
    idiomsCollected: dictionary.length,
    totalIdioms: totalIdiomsInApp,
    percentComplete: Math.round((dictionary.length / totalIdiomsInApp) * 100),
  };
}
