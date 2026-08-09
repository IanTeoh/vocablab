import AsyncStorage from "@react-native-async-storage/async-storage";
import { addCoins } from "./coins";

const GARDEN_KEY = "vocablab_garden_plots";
const INVENTORY_KEY = "vocablab_garden_seed_inventory";
const LAST_SEEN_KEY = "vocablab_garden_last_seen";
const COMPANION_KEY = "vocablab_garden_companion";
const UNLOCKED_COMPANIONS_KEY = "vocablab_garden_unlocked_companions";

const GRID_SIZE = 6;
const WATER_COOLDOWN_MS = 60 * 60 * 1000;
const MAX_WATERINGS = 3;
const WATER_BONUS_MINUTES = 30;

// Five crop silhouettes total — quality over quantity, so each can
// get a real illustrated growth sequence instead of spreading effort
// across a dozen shallow types.
export const CROPS = {
  flower: { name: "Flower", family: "flower" }, // color + stats vary by tier below
  carrot: { name: "Carrot", family: "veggie", growHours: 3, coins: 8 },
  tomato: { name: "Tomato", family: "veggie", growHours: 3, coins: 8 },
  pumpkin: { name: "Pumpkin", family: "veggie", growHours: 4, coins: 10 },
  appleTree: { name: "Apple Tree", family: "tree", growHours: 5, coins: 12 },
};

export const FLOWER_TIERS = {
  common: {
    color: "#F8F5EC",
    accent: "#E8DFC8",
    growHours: 2,
    coins: 5,
    label: "White Flower",
  },
  rare: {
    color: "#F2A6C8",
    accent: "#D97CA8",
    growHours: 4,
    coins: 10,
    label: "Pink Flower",
  },
  epic: {
    color: "#B98CE0",
    accent: "#9265C4",
    growHours: 8,
    coins: 20,
    label: "Violet Flower",
  },
  legendary: {
    color: "#F2C94C",
    accent: "#D9A441",
    growHours: 16,
    coins: 40,
    label: "Golden Flower",
  },
};

export const COMPANIONS = [
  { id: "fox", icon: "🦊", name: "Fox", price: 0 },
  { id: "rabbit", icon: "🐰", name: "Rabbit", price: 0 },
  { id: "bird", icon: "🐦", name: "Bird", price: 15 },
  { id: "squirrel", icon: "🐿️", name: "Squirrel", price: 20 },
  { id: "hedgehog", icon: "🦔", name: "Hedgehog", price: 20 },
  { id: "bee", icon: "🐝", name: "Bee", price: 25 },
  { id: "owl", icon: "🦉", name: "Owl", price: 30 },
  { id: "cat", icon: "🐱", name: "Cat", price: 40 },
];

// Composite key so a common flower seed and a legendary flower seed
// are tracked as distinct inventory items.
export function seedKey(cropId, tier) {
  return tier ? `${cropId}_${tier}` : cropId;
}

export function getCropStats(cropId, tier) {
  if (cropId === "flower") {
    const t = FLOWER_TIERS[tier] || FLOWER_TIERS.common;
    return {
      name: t.label,
      family: "flower",
      growHours: t.growHours,
      coins: t.coins,
      color: t.color,
      accent: t.accent,
    };
  }
  return { ...CROPS[cropId], name: CROPS[cropId].name };
}

function rollFrom(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function rollSeedForCatch(sourceType, rarity) {
  if (sourceType === "word") {
    return { cropId: "flower", tier: rarity || "common" };
  }
  if (sourceType === "idiom") {
    return { cropId: rollFrom(["carrot", "tomato", "pumpkin"]), tier: null };
  }
  return { cropId: "appleTree", tier: null };
}

// --- Seed inventory ---

export async function getSeedInventory() {
  const raw = await AsyncStorage.getItem(INVENTORY_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function addSeedsToInventory(seeds) {
  const inv = await getSeedInventory();
  seeds.forEach(({ cropId, tier }) => {
    const key = seedKey(cropId, tier);
    inv[key] = (inv[key] || 0) + 1;
  });
  await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
  return inv;
}

export async function reconcileNewSeeds(
  collectedWords,
  collectedIdioms,
  collectedRoots,
) {
  const raw = await AsyncStorage.getItem(LAST_SEEN_KEY);
  const lastSeen = raw ? JSON.parse(raw) : { words: [], idioms: [], roots: [] };
  const seenWords = new Set(lastSeen.words);
  const seenIdioms = new Set(lastSeen.idioms);
  const seenRoots = new Set(lastSeen.roots);

  const newSeeds = [];
  collectedWords.forEach((w) => {
    if (!seenWords.has(w.word))
      newSeeds.push(rollSeedForCatch("word", w.rarity));
  });
  collectedIdioms.forEach((i) => {
    if (!seenIdioms.has(i.word)) newSeeds.push(rollSeedForCatch("idiom"));
  });
  collectedRoots.forEach((r) => {
    if (!seenRoots.has(r.root)) newSeeds.push(rollSeedForCatch("root"));
  });

  if (newSeeds.length > 0) await addSeedsToInventory(newSeeds);

  await AsyncStorage.setItem(
    LAST_SEEN_KEY,
    JSON.stringify({
      words: collectedWords.map((w) => w.word),
      idioms: collectedIdioms.map((i) => i.word),
      roots: collectedRoots.map((r) => r.root),
    }),
  );

  return newSeeds;
}

// --- Garden plots ---

export const GRID_SIZE_EXPORT = GRID_SIZE;

export async function getGardenPlots() {
  const raw = await AsyncStorage.getItem(GARDEN_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    const padded = new Array(GRID_SIZE).fill(null);
    parsed.forEach((p, i) => {
      if (i < GRID_SIZE) padded[i] = p;
    });
    return padded;
  }
  return new Array(GRID_SIZE).fill(null);
}

export async function plantSeed(plotIndex, cropId, tier) {
  const key = seedKey(cropId, tier);
  const inv = await getSeedInventory();
  if (!inv[key] || inv[key] <= 0) return null;

  const plots = await getGardenPlots();
  if (plots[plotIndex]) return plots;

  inv[key] -= 1;
  if (inv[key] <= 0) delete inv[key];
  await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));

  plots[plotIndex] = {
    cropId,
    tier,
    plantedAt: Date.now(),
    waterings: 0,
    lastWateredAt: 0,
  };
  await AsyncStorage.setItem(GARDEN_KEY, JSON.stringify(plots));
  return plots;
}

export function getPlotGrowth(plot) {
  if (!plot) return null;
  const stats = getCropStats(plot.cropId, plot.tier);
  const totalMs = stats.growHours * 60 * 60 * 1000;
  const waterBonusMs =
    Math.min(plot.waterings, MAX_WATERINGS) * WATER_BONUS_MINUTES * 60 * 1000;
  const elapsed = Date.now() - plot.plantedAt + waterBonusMs;
  const progress = Math.max(0, Math.min(1, elapsed / totalMs));

  // 4 illustrated stages: 0 seed, 1 sprout, 2 growing, 3 ready
  let stage = 0;
  if (progress >= 1) stage = 3;
  else if (progress >= 0.6) stage = 2;
  else if (progress >= 0.25) stage = 1;

  const canWater =
    plot.waterings < MAX_WATERINGS &&
    stage < 3 &&
    Date.now() - plot.lastWateredAt >= WATER_COOLDOWN_MS;

  return { stats, progress, stage, canWater };
}

export async function waterPlot(plotIndex) {
  const plots = await getGardenPlots();
  const plot = plots[plotIndex];
  if (!plot) return plots;
  const growth = getPlotGrowth(plot);
  if (!growth.canWater) return plots;

  plot.waterings += 1;
  plot.lastWateredAt = Date.now();
  await AsyncStorage.setItem(GARDEN_KEY, JSON.stringify(plots));
  return plots;
}

export async function harvestPlot(plotIndex) {
  const plots = await getGardenPlots();
  const plot = plots[plotIndex];
  if (!plot) return { plots, coinsEarned: 0 };

  const growth = getPlotGrowth(plot);
  if (growth.stage !== 3) return { plots, coinsEarned: 0 };

  const coinsEarned = growth.stats.coins;
  plots[plotIndex] = null;
  await AsyncStorage.setItem(GARDEN_KEY, JSON.stringify(plots));
  await addCoins(coinsEarned);
  await addToLogbook(seedKey(plot.cropId, plot.tier));
  return { plots, coinsEarned };
}

// --- Companions ---

export async function getSelectedCompanion() {
  const raw = await AsyncStorage.getItem(COMPANION_KEY);
  return raw || "fox";
}

export async function setSelectedCompanion(id) {
  await AsyncStorage.setItem(COMPANION_KEY, id);
}

export async function getUnlockedCompanionIds() {
  const raw = await AsyncStorage.getItem(UNLOCKED_COMPANIONS_KEY);
  const unlocked = raw ? JSON.parse(raw) : [];
  const free = COMPANIONS.filter((c) => c.price === 0).map((c) => c.id);
  return [...new Set([...free, ...unlocked])];
}

export async function unlockCompanion(id) {
  const raw = await AsyncStorage.getItem(UNLOCKED_COMPANIONS_KEY);
  const unlocked = raw ? JSON.parse(raw) : [];
  if (!unlocked.includes(id)) unlocked.push(id);
  await AsyncStorage.setItem(UNLOCKED_COMPANIONS_KEY, JSON.stringify(unlocked));
  return unlocked;
}

// --- Greenhouse logbook: a permanent record of every crop+tier ever
// harvested, independent of what's currently growing. ---

const LOGBOOK_KEY = "vocablab_greenhouse_logbook";

export async function getLogbook() {
  const raw = await AsyncStorage.getItem(LOGBOOK_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function addToLogbook(key) {
  const log = await getLogbook();
  if (!log.includes(key)) {
    log.push(key);
    await AsyncStorage.setItem(LOGBOOK_KEY, JSON.stringify(log));
  }
}

// Every possible logbook entry, for rendering the full collection
// grid with locked slots for anything not yet harvested.
export function getAllLogbookEntries() {
  const entries = [];
  Object.entries(FLOWER_TIERS).forEach(([tier, data]) => {
    entries.push({
      key: seedKey("flower", tier),
      cropId: "flower",
      tier,
      name: data.label,
    });
  });
  ["carrot", "tomato", "pumpkin", "appleTree"].forEach((cropId) => {
    entries.push({
      key: seedKey(cropId, null),
      cropId,
      tier: null,
      name: CROPS[cropId].name,
    });
  });
  return entries;
}

// --- Scenery decorations, purchased from the Truck, filled into
// fixed slots around the hub scene in purchase order. ---

export const DECORATIONS = [
  { id: "pine", name: "Pine Tree", price: 15, category: "tree" },
  { id: "oak", name: "Oak Tree", price: 20, category: "tree" },
  { id: "bush", name: "Flowering Bush", price: 10, category: "bush" },
  { id: "fence", name: "Fence Section", price: 8, category: "path" },
  { id: "lamp", name: "Garden Lamp", price: 12, category: "decor" },
  { id: "bench", name: "Wooden Bench", price: 18, category: "decor" },
];

const OWNED_DECORATIONS_KEY = "vocablab_garden_decorations";

export async function getOwnedDecorations() {
  const raw = await AsyncStorage.getItem(OWNED_DECORATIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function purchaseDecoration(id) {
  const dec = DECORATIONS.find((d) => d.id === id);
  if (!dec) return { success: false };
  const result = await spendCoins(dec.price);
  if (!result.success) return { success: false, coins: result.coins };
  const owned = await getOwnedDecorations();
  owned.push(id);
  await AsyncStorage.setItem(OWNED_DECORATIONS_KEY, JSON.stringify(owned));
  return { success: true, coins: result.coins, owned };
}
