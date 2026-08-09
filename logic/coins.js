import AsyncStorage from "@react-native-async-storage/async-storage";

const COINS_KEY = "vocablab_coins";

export async function getCoins() {
  const raw = await AsyncStorage.getItem(COINS_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

export async function addCoins(amount) {
  const current = await getCoins();
  const updated = current + amount;
  await AsyncStorage.setItem(COINS_KEY, String(updated));
  return updated;
}

export async function spendCoins(amount) {
  const current = await getCoins();
  if (current < amount) return { success: false, coins: current };
  const updated = current - amount;
  await AsyncStorage.setItem(COINS_KEY, String(updated));
  return { success: true, coins: updated };
}
