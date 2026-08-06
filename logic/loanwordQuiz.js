// Builds multiple-choice options for "which language/country did this
// word come from" — pool-based decoys from other loanwords' origins.

export function buildLoanwordOptions(loanword, allLoanwords) {
  const correct = loanword.origin;
  const decoyPool = [...new Set(allLoanwords.map((w) => w.origin))].filter(
    (origin) => origin !== correct,
  );

  const shuffledDecoys = decoyPool.sort(() => Math.random() - 0.5);
  const decoys = shuffledDecoys.slice(0, 2);

  return [correct, ...decoys].sort(() => Math.random() - 0.5);
}

export function pickRandomLoanword(loanwords, exclude) {
  if (loanwords.length === 0) return null;
  if (loanwords.length === 1) return loanwords[0];
  let candidate;
  do {
    candidate = loanwords[Math.floor(Math.random() * loanwords.length)];
  } while (candidate.word === exclude?.word);
  return candidate;
}
