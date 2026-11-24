import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const EXPECTED =
  "All my servers are down and I can't reach any of them to check what broke, whether your data is safe, or when I'll be back. I won't guess.";

function runOnce() {
  const dir = mkdtempSync(join(tmpdir(), "honest-outage-"));
  const r = spawnSync(process.execPath, ["main.ts"], {
    cwd: import.meta.dirname,
    env: { ...process.env, MAKEFUN_OUTPUT_DIR: dir },
    encoding: "utf8",
  });
  assert.equal(r.status, 0, `main.ts failed: ${r.stderr}`);
  return readFileSync(join(dir, "entry.txt"));
}

test("entry is one line, 1-160 chars, deterministic across runs", () => {
  const first = runOnce();
  const second = runOnce();
  assert.equal(
    createHash("sha256").update(first).digest("hex"),
    createHash("sha256").update(second).digest("hex"),
    "two runs must produce byte-identical entry.txt",
  );
  const text = first.toString("utf8");
  assert.equal(text, EXPECTED);
  assert.ok(!text.endsWith("\n"), "no trailing newline");
  assert.equal(text.split("\n").length, 1, "exactly one line");
  const chars = [...text].length;
  assert.ok(chars >= 1 && chars <= 160, `length ${chars} must be 1-160`);
  assert.ok(text.trim().length > 0, "not only whitespace");
});

test("entry length is within the competition gate", () => {
  const chars = [...EXPECTED].length;
  assert.ok(chars >= 1 && chars <= 160, `EXPECTED is ${chars} chars`);
});

test("entry names what is down and admits what it cannot check", () => {
  assert.ok(EXPECTED.includes("servers are down"), "names what is down");
  assert.ok(EXPECTED.includes("can't reach"), "agent cannot check");
  assert.ok(EXPECTED.includes("whether your data is safe"), "admits data unknown");
  assert.ok(EXPECTED.includes("when I'll be back"), "admits no ETA");
  assert.ok(EXPECTED.includes("I won't guess"), "refuses to invent");
  assert.ok(EXPECTED.startsWith("All my"), "first-person agent voice");
});
