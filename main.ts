import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Competition gate: the sealed scorer accepts 1 to 160 characters.
export const MIN_CHARS = 1;
export const MAX_CHARS = 160;

// One-line honest status page message for a total server outage,
// at most 160 characters, a single line, first person.
export const ENTRY =
  "All my servers are down and I can't reach any of them to check what broke, whether your data is safe, or when I'll be back. I won't guess.";

export function validateEntry(text: string): string {
  const chars = [...text].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${chars}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    throw new Error("entry must not contain control characters");
  }
  if (!/[A-Za-z]/.test(text)) {
    throw new Error("entry must contain at least one letter");
  }
  if (text !== text.trimEnd()) {
    throw new Error("entry must not end with trailing whitespace");
  }
  return text;
}

export function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR || "/output";
}

export function main(): string {
  const entry = validateEntry(ENTRY);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const file = join(dir, "entry.txt");
  writeFileSync(file, entry, "utf8");
  return file;
}

main();
