export function pickWordForUnscramble(words, exclude) {
  const pool = words.filter((w) => w.word.length >= 6 && w.word.length <= 8);
  if (pool.length === 0) return null;
  let candidate;
  do {
    candidate = pool[Math.floor(Math.random() * pool.length)];
  } while (pool.length > 1 && candidate.word === exclude?.word);
  return candidate;
}

export function scrambleWord(word) {
  const letters = word.toUpperCase().split("");
  let scrambled;
  do {
    scrambled = [...letters].sort(() => Math.random() - 0.5);
  } while (scrambled.join("") === letters.join("") && letters.length > 1);
  return scrambled;
}
