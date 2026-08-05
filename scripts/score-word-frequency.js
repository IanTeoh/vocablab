// Scores candidate words against the Datamuse API's real usage-frequency
// data (Google Books Ngrams, occurrences per million words) and sorts
// each into a draft rarity tier. This only sources WHICH tier a word
// likely belongs in — definitions and examples are still written by
// hand afterward, both for quality and to stay clear of reproducing
// any dictionary's copyrighted wording.
//
// Usage:
//   node scripts/score-word-frequency.js scripts/candidate-words.txt
//
// Input file: one candidate word per line.
// Output: prints a table, and writes scripts/scored-words.json with
// { word, frequency, suggestedRarity } for each word you can then
// hand off for drafting.

const fs = require("fs");
const path = require("path");

// Rough thresholds calibrated against 20 known-tier anchor words from
// the existing bank (occurrences per million, Google Books Ngrams).
//
// IMPORTANT: raw corpus frequency is a NOISY signal, not a clean
// classifier. It counts every sense of a word, so terms with a strong
// secondary meaning get skewed — e.g. "Autonomous" scores high because
// of "autonomous vehicles," and "Candid" scores lower than expected
// because of "Candid Camera." Treat the suggested tier as a sanity
// check to catch obvious misjudgments, not as the final answer —
// your own sense of how advanced a word feels to a general reader
// still matters more than this number.
const THRESHOLDS = {
  common: 6, // f >= 6    -> common
  rare: 1.2, // f >= 1.2  -> rare
  epic: 0.15, // f >= 0.15 -> epic
  // anything below epic threshold -> legendary
};

function suggestRarity(freq) {
  if (freq === null) return "unknown";
  if (freq >= THRESHOLDS.common) return "common";
  if (freq >= THRESHOLDS.rare) return "rare";
  if (freq >= THRESHOLDS.epic) return "epic";
  return "legendary";
}

async function getFrequency(word) {
  const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&qe=sp&md=f&max=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;

  const tags = data[0].tags || [];
  const freqTag = tags.find((t) => t.startsWith("f:"));
  if (!freqTag) return null;

  return parseFloat(freqTag.slice(2));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error(
      "Usage: node scripts/score-word-frequency.js <path-to-word-list.txt>",
    );
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8");
  const words = raw
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean);

  const results = [];

  console.log(`Scoring ${words.length} candidate words...\n`);
  console.log("word".padEnd(20) + "frequency".padEnd(14) + "suggested tier");
  console.log("-".repeat(50));

  for (const word of words) {
    const freq = await getFrequency(word);
    const rarity = suggestRarity(freq);
    results.push({ word, frequency: freq, suggestedRarity: rarity });

    console.log(
      word.padEnd(20) +
        (freq !== null ? freq.toFixed(3) : "n/a").padEnd(14) +
        rarity,
    );

    // Small delay to stay well within rate limits.
    await sleep(150);
  }

  const outputPath = path.join(path.dirname(inputPath), "scored-words.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\nSaved results to ${outputPath}`);
  console.log(
    "Words marked 'unknown' had no frequency data — check spelling or look them up manually.",
  );
}

main();
