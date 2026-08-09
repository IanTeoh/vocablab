// Blanks out the target word within its own example sentence, so the
// quiz tests whether someone can use a word in context rather than
// just recognize its definition.
export function blankSentence(example, word) {
  const regex = new RegExp(`\\b${word}\\b`, "i");
  if (!regex.test(example)) return example; // safety fallback
  return example.replace(regex, "_____");
}

export function buildContextOptions(word, allWords) {
  const decoyPool = allWords
    .filter((w) => w.word !== word.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((w) => w.word);
  return [word.word, ...decoyPool].sort(() => Math.random() - 0.5);
}

export function pickRandomWord(words, exclude) {
  if (words.length === 0) return null;
  if (words.length === 1) return words[0];
  let candidate;
  do {
    candidate = words[Math.floor(Math.random() * words.length)];
  } while (candidate.word === exclude?.word);
  return candidate;
}
