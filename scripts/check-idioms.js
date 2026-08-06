// Validates data/idioms.json for the same issues check-words.js catches
// in the vocab bank: duplicate idioms, missing fields, and a quick
// summary. Run this after merging any new idiom batch.
//
// Run with: node scripts/check-idioms.js

const fs = require("fs");
const path = require("path");

const IDIOMS_PATH = path.join(__dirname, "..", "data", "idioms.json");
const REQUIRED_FIELDS = ["word", "definition", "example", "category", "icon"];

function loadIdioms() {
  const raw = fs.readFileSync(IDIOMS_PATH, "utf8");
  return JSON.parse(raw);
}

function checkIdioms(idioms) {
  const errors = [];
  const seen = new Map();

  idioms.forEach((entry, index) => {
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

    if (entry.word) {
      const key = entry.word.trim().toLowerCase();
      if (seen.has(key)) {
        errors.push(
          `Duplicate idiom: "${entry.word}" (also appears as "${seen.get(key)}")`,
        );
      } else {
        seen.set(key, entry.word);
      }
    }
  });

  return errors;
}

function printSummary(idioms) {
  const byCategory = {};
  for (const w of idioms) {
    byCategory[w.category] = (byCategory[w.category] || 0) + 1;
  }

  console.log(`\nTotal idioms: ${idioms.length}\n`);
  console.log("By category:");
  for (const [cat, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${cat.padEnd(28)} ${count}`);
  }
}

function main() {
  let idioms;
  try {
    idioms = loadIdioms();
  } catch (err) {
    console.error("Could not read or parse data/idioms.json:", err.message);
    process.exit(1);
  }

  const errors = checkIdioms(idioms);
  printSummary(idioms);

  if (errors.length > 0) {
    console.log(`\n${errors.length} issue(s) found:\n`);
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    console.log("");
    process.exit(1);
  }

  console.log("\n✅ No duplicates or missing fields found.\n");
}

main();
