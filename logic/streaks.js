import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "vocablab_streak";
const LAST_OPEN_KEY = "vocablab_last_open";

function getTodayDateString(date = new Date()) {
  // YYYY-MM-DD in local time, avoids timezone shift bugs from toISOString()
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayDateString(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayDateString(yesterday);
}

export async function updateStreak() {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const lastOpen = await AsyncStorage.getItem(LAST_OPEN_KEY);
  let streak = parseInt((await AsyncStorage.getItem(STREAK_KEY)) || "0", 10);

  if (lastOpen === today) {
    // already opened today, streak unchanged
    return streak;
  }

  if (lastOpen === yesterday) {
    // continued the streak
    streak += 1;
  } else {
    // missed a day (or first ever open), streak resets to 1
    streak = 1;
  }

  await AsyncStorage.setItem(LAST_OPEN_KEY, today);
  await AsyncStorage.setItem(STREAK_KEY, String(streak));

  return streak;
}
