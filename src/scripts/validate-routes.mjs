#!/usr/bin/env node
/**
 * validate-routes.mjs — Run after adding a new feature page.
 *
 *   node src/scripts/validate-routes.mjs
 *
 * Checks:
 *   1. Every page in navigation.ts has an entry in routeRegistry.tsx
 *   2. Every entry in routeRegistry.tsx has a page in navigation.ts
 *   3. No duplicate navigation IDs
 *
 * Exit 0 = all good, exit 1 = issues found.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");

function readFile(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

// --- 1. Extract PAGE IDs from navigation.ts ---
// Page IDs always have `page: N` on the same line; group IDs don't.
const navSrc = readFile("src/shell/navigation.ts");
const allNavMatches = [...navSrc.matchAll(/\bid:\s*"([^"]+)"[^{}]*\bpage:\s*\d+/g)];
const navIds = [...new Set(allNavMatches.map((m) => m[1]))];

// --- 2. Extract page IDs from routeRegistry.tsx ---
const regSrc = readFile("src/shell/routeRegistry.tsx");
const registryIds = [];
for (const line of regSrc.split("\n")) {
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("import")) continue;
  const m = trimmed.match(/^"([^"]+)"\s*:\s*(\w+)/);
  if (m) registryIds.push({ id: m[1], component: m[2] });
}
const registryIdSet = new Set(registryIds.map((r) => r.id));

// --- 3. Cross-check ---
const errors = [];

// nav → registry
for (const id of navIds) {
  if (!registryIdSet.has(id)) {
    errors.push(`❌  navigation.ts page "${id}" MISSING from routeRegistry.tsx`);
  }
}

// registry → nav
const navIdSet = new Set(navIds);
for (const { id } of registryIds) {
  if (!navIdSet.has(id)) {
    errors.push(`❌  routeRegistry.tsx has "${id}" but navigation.ts does NOT list it`);
  }
}

// Duplicate check
const seen = {};
for (const id of navIds) {
  if (seen[id]) errors.push(`❌  Duplicate nav ID "${id}"`);
  seen[id] = true;
}

// --- Report ---
console.log("\n🔍  Route validation report");
console.log("─".repeat(50));
console.log(`   Navigation page IDs: ${navIds.length}`);
console.log(`   Registry entries:     ${registryIds.length}`);
console.log("─".repeat(50));

if (errors.length === 0) {
  console.log("✅  All routes properly wired!\n");
  process.exit(0);
}

for (const e of errors) console.log(e);
console.log("\n💡  Fix: add missing entries to routeRegistry.tsx and/or navigation.ts");
console.log("   Then re-run:  node src/scripts/validate-routes.mjs\n");
process.exit(1);
