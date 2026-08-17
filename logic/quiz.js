export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Picks 2 decoy definitions from other words, preferring the same
// rarity tier as the target word so decoys feel like a fair match
// for the difficulty of the question. Falls back to any other word
// if there aren't enough same-tier words to pull from.
function getDecoyPool(word, allWords) {
  const sameRarity = allWords.filter(
    (w) => w.rarity === word.rarity && w.word !== word.word,
  );
  if (sameRarity.length >= 2) return sameRarity;
  return allWords.filter((w) => w.word !== word.word);
}

export function buildQuizOptions(word, allWords) {
  const pool = getDecoyPool(word, allWords);
  const decoys = shuffle(pool)
    .slice(0, 3)
    .map((w) => w.definition);
  return shuffle([word.definition, ...decoys]);
}
