export function pickUncaughtRoot(allRoots, caughtRoots, exclude) {
  const caughtSet = new Set(caughtRoots.map((r) => r.root));
  const pool = allRoots.filter(
    (r) => !caughtSet.has(r.root) && r.root !== exclude?.root,
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
