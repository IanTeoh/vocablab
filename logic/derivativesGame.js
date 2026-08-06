// Helpers for the "Root Derivatives" timed game — validating typed
// words against a root's known list of derivatives, and picking from
// roots the user has already caught in Root of the Day.

function normalize(str) {
  return str.toLowerCase().trim();
}

export function checkDerivative(guess, root) {
  const normGuess = normalize(guess);
  if (!normGuess) return false;
  return root.derivatives.some((d) => normalize(d) === normGuess);
}

export function pickRandomCaughtRoot(caughtRoots, exclude) {
  if (caughtRoots.length === 0) return null;
  if (caughtRoots.length === 1) return caughtRoots[0];
  let candidate;
  do {
    candidate = caughtRoots[Math.floor(Math.random() * caughtRoots.length)];
  } while (candidate.root === exclude?.root);
  return candidate;
}
