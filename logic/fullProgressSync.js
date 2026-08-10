import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Every AsyncStorage key that represents real progress worth backing
// up. Keep this in sync with dictionary.js's resetAllData() list —
// whenever a new feature adds a storage key that should persist
// across devices, add it here too.
const PROGRESS_KEYS = [
  "vocablab_dictionary",
  "vocablab_completed_date",
  "vocablab_streak",
  "vocablab_last_open",
  "vocablab_lives",
  "vocablab_lives_date",
  "vocablab_adventure_sessions_completed",
  "vocablab_idiom_dictionary",
  "vocablab_idiom_completed_date",
  "vocablab_idiom_sessions_completed",
  "vocablab_root_dictionary",
  "vocablab_root_derivatives_high_score_v2",
  "vocablab_root_derivatives_scores",
  "vocablab_loanword_play_high_score",
  "vocablab_idiomoji_high_score",
  "vocablab_achievements_seen",
  "vocablab_longest_streak",
  "vocablab_garden_plots",
  "vocablab_garden_companion",
  "vocablab_garden_seed_inventory",
  "vocablab_garden_unlocked_companions",
  "vocablab_greenhouse_logbook",
  "vocablab_garden_decorations",
  "vocablab_coins",
  "vocablab_unscramble_high_score",
  "vocablab_context_quiz_high_score",
];
// Deliberately excluded: the "*_of_day" caches (regenerate naturally
// each day), vocablab_garden_last_seen (an internal bookkeeping
// checkpoint, not progress itself), and vocablab_ambient_sound (a
// device preference, not something to carry between devices).

export async function exportLocalProgress() {
  const pairs = await AsyncStorage.multiGet(PROGRESS_KEYS);
  const data = {};
  pairs.forEach(([key, value]) => {
    if (value !== null) data[key] = value;
  });
  return data;
}

export async function importLocalProgress(data) {
  const pairs = Object.entries(data);
  if (pairs.length === 0) return;
  await AsyncStorage.multiSet(pairs);
}

// This is stored completely separately from the public `users/{uid}`
// profile — it's private, full-detail data, never meant to be
// readable by friends or anyone else. See firestore.rules.
export async function pushProgressToCloud(uid) {
  try {
    const data = await exportLocalProgress();
    await setDoc(doc(db, "userProgress", uid), {
      data,
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (error) {
    console.warn("pushProgressToCloud failed:", error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}

export async function pullProgressFromCloud(uid) {
  try {
    const snapshot = await getDoc(doc(db, "userProgress", uid));
    if (!snapshot.exists()) return { success: true, found: false };
    const { data } = snapshot.data();
    await importLocalProgress(data);
    return { success: true, found: true };
  } catch (error) {
    console.warn("pullProgressFromCloud failed:", error);
    return { success: false, error: error?.message || "Unknown error" };
  }
}

export async function hasCloudProgress(uid) {
  try {
    const snapshot = await getDoc(doc(db, "userProgress", uid));
    return snapshot.exists();
  } catch (error) {
    console.warn("hasCloudProgress failed:", error);
    return false;
  }
}
