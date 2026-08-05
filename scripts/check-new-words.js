// Checks a list of candidate words against the existing word bank
// (data/words.json) to catch duplicates and near-duplicates before
// you spend time drafting definitions for them.
//
// Usage:
//   node scripts/check-new-words.js scripts/candidate-words.txt

const fs = require("fs");
const path = require("path");

const WORDS_PATH = path.join(__dirname, "..", "data", "words.json");

function normalize(word) {
  return word.trim().toLowerCase();
}

// Very rough near-duplicate check: same first 5 letters (catches
// things like "Cognizant" vs "Cognizance", "Perspicacious" vs
// "Perspicuous"). Flags for a human to eyeball — doesn't auto-reject.
function sharesStem(a, b) {
  const stemLen = 5;
  if (a.length < stemLen || b.length < stemLen) return false;
  return a.slice(0, stemLen) === b.slice(0, stemLen);
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error(
      "Usage: node scripts/check-new-words.js <path-to-word-list.txt>",
    );
    process.exit(1);
  }

  const existing = JSON.parse(fs.readFileSync(WORDS_PATH, "utf8"));
  const existingNormalized = existing.map((w) => normalize(w.word));

  const candidates = fs
    .readFileSync(inputPath, "utf8")
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean);

  console.log(
    `Checking ${candidates.length} candidates against ${existing.length} existing words...\n`,
  );

  let exactHits = 0;
  let nearHits = 0;
  let clean = 0;

  for (const candidate of candidates) {
    const normalized = normalize(candidate);
    const exactMatch = existingNormalized.includes(normalized);

    if (exactMatch) {
      console.log(`✗ EXACT MATCH   ${candidate}`);
      exactHits++;
      continue;
    }

    const nearMatches = existing.filter((w) =>
      sharesStem(normalize(w.word), normalized),
    );
    if (nearMatches.length > 0) {
      console.log(
        `⚠ CHECK MANUALLY ${candidate}  (similar to: ${nearMatches.map((w) => w.word).join(", ")})`,
      );
      nearHits++;
      continue;
    }

    console.log(`✓ clean          ${candidate}`);
    clean++;
  }

  console.log(
    `\n${clean} clean, ${nearHits} to review, ${exactHits} exact duplicates.`,
  );
}

main();
