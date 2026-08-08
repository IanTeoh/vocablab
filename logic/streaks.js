import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "vocablab_streak";
const LAST_COMPLETED_KEY = "vocablab_last_open";
const LONGEST_STREAK_KEY = "vocablab_longest_streak";

function getDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateString(d);
}

// Read-only — just returns the currently stored streak with no side
// effects. Safe to call on every screen focus purely for display.
export async function getCurrentStreak() {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  return raw ? parseInt(raw, 10) : 0;
}

// Read-only — whether today specifically has already been credited.
export async function hasCompletedToday() {
  const today = getDateString();
  const lastCompleted = await AsyncStorage.getItem(LAST_COMPLETED_KEY);
  return lastCompleted === today;
}

// Call this ONLY at the moment the user actually completes today's
// Word of Day (a fresh correct answer, or acknowledging an
// already-known word). Advances the streak if yesterday was the last
// completed day, resets to 1 if the streak was broken, and is safe to
// call more than once on the same day without double-counting.
export async function completeStreakForToday() {
  const today = getDateString();
  const yesterday = getYesterdayDateString();

  const lastCompleted = await AsyncStorage.getItem(LAST_COMPLETED_KEY);
  const currentStreak = await getCurrentStreak();

  let newStreak;
  if (lastCompleted === today) {
    newStreak = currentStreak || 1;
  } else if (lastCompleted === yesterday) {
    newStreak = currentStreak + 1;
  } else {
    newStreak = 1;
  }

  await AsyncStorage.setItem(STREAK_KEY, String(newStreak));
  await AsyncStorage.setItem(LAST_COMPLETED_KEY, today);

  const longest = await getLongestStreak();
  if (newStreak > longest) {
    await AsyncStorage.setItem(LONGEST_STREAK_KEY, String(newStreak));
  }

  return newStreak;
}

// Read-only — the highest streak ever reached, which persists even
// after the current streak resets. Used for achievements.
export async function getLongestStreak() {
  const raw = await AsyncStorage.getItem(LONGEST_STREAK_KEY);
  return raw ? parseInt(raw, 10) : 0;
}
