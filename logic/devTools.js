import AsyncStorage from "@react-native-async-storage/async-storage";

function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Dev-only helper: directly writes every word/idiom/root into its
// dictionary in one shot, instead of looping hundreds of individual
// add calls. Only touches collection state — doesn't fake streaks,
// lives, or "completed today" flags.
export async function learnEverything(words, idioms, roots) {
  const today = getTodayDateString();

  const wordEntries = words.map((w) => ({ ...w, addedOn: today }));
  const idiomEntries = idioms.map((i) => ({ ...i, addedOn: today }));
  const rootEntries = roots.map((r) => ({ ...r }));

  await AsyncStorage.setItem(
    "vocablab_dictionary",
    JSON.stringify(wordEntries),
  );
  await AsyncStorage.setItem(
    "vocablab_idiom_dictionary",
    JSON.stringify(idiomEntries),
  );
  await AsyncStorage.setItem(
    "vocablab_root_dictionary",
    JSON.stringify(rootEntries),
  );
}
