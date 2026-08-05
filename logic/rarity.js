export const RARITY_STYLES = {
  common: { color: "#7FA98A", label: "Common" },
  rare: { color: "#2D4A3E", label: "Rare" },
  epic: { color: "#7B4B94", label: "Epic" },
  legendary: { color: "#D9A441", label: "Legendary" },
};

export function getRarityStyle(rarity) {
  return RARITY_STYLES[rarity] || RARITY_STYLES.common;
}
