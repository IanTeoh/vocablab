// Validates data/words.json for common data-entry mistakes before
// you add a new batch: duplicate words, missing fields, invalid
// rarity values, and reports the current tier/category breakdown
// so you can see the distribution at a glance.
//
// Run with: node scripts/check-words.js

const fs = require("fs");
const path = require("path");

const WORDS_PATH = path.join(__dirname, "..", "data", "words.json");
const VALID_RARITIES = ["common", "rare", "epic", "legendary"];
const REQUIRED_FIELDS = ["word", "definition", "example", "rarity", "category"];

function loadWords() {
  const raw = fs.readFileSync(WORDS_PATH, "utf8");
  return JSON.parse(raw);
}

function checkWords(words) {
  const errors = [];
  const seen = new Map();

  words.forEach((entry, index) => {
    const label = entry.word ? `"${entry.word}"` : `entry #${index + 1}`;

    for (const field of REQUIRED_FIELDS) {
      if (
        !entry[field] ||
        typeof entry[field] !== "string" ||
        !entry[field].trim()
      ) {
        errors.push(`${label}: missing or empty "${field}"`);
      }
    }

    if (entry.rarity && !VALID_RARITIES.includes(entry.rarity)) {
      errors.push(
        `${label}: invalid rarity "${entry.rarity}" (must be one of ${VALID_RARITIES.join(", ")})`,
      );
    }

    if (entry.word) {
      const key = entry.word.trim().toLowerCase();
      if (seen.has(key)) {
        errors.push(
          `Duplicate word: "${entry.word}" (also appears as "${seen.get(key)}")`,
        );
      } else {
        seen.set(key, entry.word);
      }
    }
  });

  return errors;
}

function printSummary(words) {
  const byRarity = {};
  const byCategory = {};

  for (const w of words) {
    byRarity[w.rarity] = (byRarity[w.rarity] || 0) + 1;
    byCategory[w.category] = (byCategory[w.category] || 0) + 1;
  }

  console.log(`\nTotal words: ${words.length}\n`);

  console.log("By rarity:");
  for (const tier of VALID_RARITIES) {
    console.log(`  ${tier.padEnd(10)} ${byRarity[tier] || 0}`);
  }

  console.log("\nBy category:");
  for (const [cat, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${cat.padEnd(28)} ${count}`);
  }
}

function main() {
  let words;
  try {
    words = loadWords();
  } catch (err) {
    console.error("Could not read or parse data/words.json:", err.message);
    process.exit(1);
  }

  const errors = checkWords(words);
  printSummary(words);

  if (errors.length > 0) {
    console.log(`\n${errors.length} issue(s) found:\n`);
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    console.log("");
    process.exit(1);
  }

  console.log("\n✅ No duplicates or missing fields found.\n");
}

main();
