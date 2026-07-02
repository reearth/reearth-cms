/**
 * Checks for case-insensitive duplicate keys in the i18n translation files.
 * Reads the TypeScript file as text and extracts quoted keys via regex.
 * Exit 1 if duplicates found, 0 otherwise.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const enPath = resolve(__dirname, "../src/i18n/translations/en.ts");

const source = readFileSync(enPath, "utf-8");

// Match all quoted object keys: "some key": or 'some key': (handles both ' and " delimiters)
const keyPattern = /^\s*(['"])((?:[^'"\\]|\\.)*)\1\s*:/gm;

const seen = new Map();
let hasDupes = false;

let match;
while ((match = keyPattern.exec(source)) !== null) {
  const key = match[2];
  const lower = key.toLowerCase();
  if (seen.has(lower)) {
    console.error(`[i18n] Case-insensitive duplicate: "${seen.get(lower)}" and "${key}"`);
    hasDupes = true;
  } else {
    seen.set(lower, key);
  }
}

if (hasDupes) {
  console.error("\nFix: consolidate duplicate keys and handle casing at render time.");
  process.exit(1);
} else {
  console.log("[i18n] No case-insensitive duplicate keys found.");
}
