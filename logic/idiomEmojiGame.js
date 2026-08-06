// Lightweight helpers for the Emoji Idioms mini-game. This game is
// intentionally "just for fun" — it does not touch the idiom
// dictionary, stats, or streaks in any way.

function normalize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\b(the|a|an)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Simple edit-distance check so small typos still count as correct.
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function checkIdiomGuess(guess, idiomWord) {
  const normGuess = normalize(guess);
  const normAnswer = normalize(idiomWord);
  if (!normGuess) return false;
  if (normGuess === normAnswer) return true;

  // Allow small typos on longer phrases (roughly one typo per ~8 chars).
  const allowedDistance = Math.max(1, Math.floor(normAnswer.length / 8));
  return levenshtein(normGuess, normAnswer) <= allowedDistance;
}

export function pickRandomIdiomForGame(idioms, exclude) {
  if (idioms.length === 0) return null;
  if (idioms.length === 1) return idioms[0];
  let candidate;
  do {
    candidate = idioms[Math.floor(Math.random() * idioms.length)];
  } while (candidate.word === exclude?.word);
  return candidate;
}
