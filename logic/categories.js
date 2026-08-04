export function groupByCategory(words) {
  const groups = {};
  for (const word of words) {
    const cat = word.category || "Uncategorized";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(word);
  }
  return groups;
}

export function getCategoryProgress(words, collectedWords) {
  const collectedSet = new Set(collectedWords.map((w) => w.word));
  const groups = groupByCategory(words);

  return Object.entries(groups).map(([category, categoryWords]) => {
    const caught = categoryWords.filter((w) => collectedSet.has(w.word)).length;
    return {
      category,
      words: categoryWords,
      caught,
      total: categoryWords.length,
      percent: Math.round((caught / categoryWords.length) * 100),
    };
  });
}
