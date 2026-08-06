import AsyncStorage from "@react-native-async-storage/async-storage";

const ROOT_DICTIONARY_KEY = "vocablab_root_dictionary";

export async function getRootDictionary() {
  const raw = await AsyncStorage.getItem(ROOT_DICTIONARY_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addRootToDictionary(root) {
  const dictionary = await getRootDictionary();
  if (!dictionary.some((r) => r.root === root.root)) {
    dictionary.push(root);
    await AsyncStorage.setItem(ROOT_DICTIONARY_KEY, JSON.stringify(dictionary));
  }
}

export async function getRootStats(totalRootsInApp) {
  const dictionary = await getRootDictionary();
  return {
    rootsCollected: dictionary.length,
    totalRoots: totalRootsInApp,
    percentComplete: Math.round((dictionary.length / totalRootsInApp) * 100),
  };
}
