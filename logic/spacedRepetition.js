import AsyncStorage from "@react-native-async-storage/async-storage";

const BOXES_KEY = "vocablab_review_boxes";

// Classic 5-box Leitner system. Box number is the mastery level —
// get a review right, move up a box (further out next time); get it
// wrong, straight back to box 1.
const INTERVAL_DAYS = { 1: 0, 2: 2, 3: 4, 4: 9, 5: 20 };
export const MAX_BOX = 5;

function daysFromNow(days) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

async function getBoxes() {
  const raw = await AsyncStorage.getItem(BOXES_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveBoxes(boxes) {
  await AsyncStorage.setItem(BOXES_KEY, JSON.stringify(boxes));
}

// Called once, the moment a word is first caught — starts it in
// box 1, due immediately, so it shows up in the very next review.
export async function initializeReviewEntry(word) {
  const boxes = await getBoxes();
  if (boxes[word]) return;
  boxes[word] = { box: 1, nextReviewDate: Date.now(), lastReviewedDate: null };
  await saveBoxes(boxes);
}

export async function recordReviewResult(word, correct) {
  const boxes = await getBoxes();
  const entry = boxes[word] || { box: 1, nextReviewDate: Date.now() };

  const movedUp = correct && entry.box < MAX_BOX;
  entry.box = correct ? Math.min(MAX_BOX, entry.box + 1) : 1;
  entry.nextReviewDate = daysFromNow(INTERVAL_DAYS[entry.box]);
  entry.lastReviewedDate = Date.now();

  boxes[word] = entry;
  await saveBoxes(boxes);
  return { box: entry.box, movedUp };
}

export async function getBoxForWord(word) {
  const boxes = await getBoxes();
  return boxes[word]?.box || 1;
}

// Words due for review right now, out of everything caught so far.
// Anything never tracked (shouldn't normally happen, but defensive)
// counts as due.
export async function getDueWords(caughtWords) {
  const boxes = await getBoxes();
  const now = Date.now();
  return caughtWords.filter((w) => {
    const entry = boxes[w.word];
    if (!entry) return true;
    return entry.nextReviewDate <= now;
  });
}

export async function getDueCount(caughtWords) {
  const due = await getDueWords(caughtWords);
  return due.length;
}
