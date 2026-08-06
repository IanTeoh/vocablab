import AsyncStorage from "@react-native-async-storage/async-storage";

const ROOT_OF_DAY_KEY = "vocablab_root_of_day";

function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getRootOfTheDay(rootList) {
  const today = getTodayDateString();
  const raw = await AsyncStorage.getItem(ROOT_OF_DAY_KEY);
  const saved = raw ? JSON.parse(raw) : null;

  if (saved && saved.date === today) {
    const root = rootList.find((r) => r.root === saved.root);
    if (root) return root;
  }

  const randomRoot = rootList[Math.floor(Math.random() * rootList.length)];
  await AsyncStorage.setItem(
    ROOT_OF_DAY_KEY,
    JSON.stringify({ date: today, root: randomRoot.root }),
  );
  return randomRoot;
}
