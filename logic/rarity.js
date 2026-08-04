export const RARITY_STYLES = {
  common: { color: "#607d8b", label: "Common" },
  rare: { color: "#1e88e5", label: "Rare" },
  legendary: { color: "#f9a825", label: "Legendary" },
};

export function getRarityStyle(rarity) {
  return RARITY_STYLES[rarity] || RARITY_STYLES.common;
}
