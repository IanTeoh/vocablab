// Builds multiple-choice options for "what does this root mean, and
// where does it come from" — pool-based decoys pulled from other
// roots' meaning+origin, same pattern as the vocab/idiom quizzes.

export function buildRootQuizOptions(root, allRoots) {
  const correct = `${root.meaning} (${root.origin})`;
  const decoyPool = allRoots
    .filter((r) => r.root !== root.root)
    .map((r) => `${r.meaning} (${r.origin})`)
    .filter((option) => option !== correct);

  const shuffledDecoys = [...new Set(decoyPool)].sort(
    () => Math.random() - 0.5,
  );
  const decoys = shuffledDecoys.slice(0, 2);

  return [correct, ...decoys].sort(() => Math.random() - 0.5);
}
