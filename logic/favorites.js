import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "vocablab_favorite_words";

export async function getFavoriteWords() {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function isFavorite(word) {
  const favorites = await getFavoriteWords();
  return favorites.includes(word);
}

export async function toggleFavorite(word) {
  const favorites = await getFavoriteWords();
  const index = favorites.indexOf(word);
  if (index === -1) {
    favorites.push(word);
  } else {
    favorites.splice(index, 1);
  }
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
}
