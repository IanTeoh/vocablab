import AsyncStorage from "@react-native-async-storage/async-storage";

const HAPTICS_KEY = "vocablab_pref_haptics";
const SOUND_KEY = "vocablab_pref_sound_effects";
const NOTIFICATIONS_KEY = "vocablab_pref_daily_reminder";
const SHARE_STATS_KEY = "vocablab_pref_share_stats";

async function getBool(key, defaultValue) {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return defaultValue;
  return raw === "true";
}
async function setBool(key, value) {
  await AsyncStorage.setItem(key, String(value));
}

export const getHapticsEnabled = () => getBool(HAPTICS_KEY, true);
export const setHapticsEnabled = (v) => setBool(HAPTICS_KEY, v);

export const getSoundEffectsEnabled = () => getBool(SOUND_KEY, true);
export const setSoundEffectsEnabled = (v) => setBool(SOUND_KEY, v);

export const getDailyReminderEnabled = () => getBool(NOTIFICATIONS_KEY, false);
export const setDailyReminderEnabled = (v) => setBool(NOTIFICATIONS_KEY, v);

// This one has a real, immediate effect: profileSync.js checks it
// before syncing stats, so turning it off actually stops your stats
// from being shared, not just a cosmetic switch.
export const getShareStatsEnabled = () => getBool(SHARE_STATS_KEY, true);
export const setShareStatsEnabled = (v) => setBool(SHARE_STATS_KEY, v);
