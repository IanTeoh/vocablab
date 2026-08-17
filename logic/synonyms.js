import synonymGroups from "../data/synonymGroups.json";

export const REGISTER_LABELS = {
  slang: { label: "Slang", color: "#E14B3D", emoji: "🔴" },
  casual: { label: "Casual", color: "#6FA84A", emoji: "🟢" },
  neutral: { label: "Neutral", color: "#5B9BD5", emoji: "🔵" },
  formal: { label: "Formal", color: "#9265C4", emoji: "🟣" },
  literary: { label: "Literary", color: "#E8A94F", emoji: "🟠" },
};

export function searchSynonymGroups(queryText) {
  if (!queryText.trim()) return [];
  const q = queryText.trim().toLowerCase();

  return synonymGroups.filter((group) => {
    if (group.id.toLowerCase().includes(q)) return true;
    if (group.meaning.toLowerCase().includes(q)) return true;
    return group.words.some((w) => w.word.toLowerCase().includes(q));
  });
}

export function getAllSynonymGroups() {
  return synonymGroups;
}

// Used by the word detail view — finds the group (if any) this exact
// word belongs to, and returns its alternatives at other registers.
// Returns null if this word isn't in the dataset yet.
export function getSynonymsForWord(word) {
  const lower = word.toLowerCase();
  const group = synonymGroups.find((g) =>
    g.words.some((w) => w.word.toLowerCase() === lower),
  );
  if (!group) return null;

  return {
    meaning: group.meaning,
    alternatives: group.words.filter((w) => w.word.toLowerCase() !== lower),
  };
}
