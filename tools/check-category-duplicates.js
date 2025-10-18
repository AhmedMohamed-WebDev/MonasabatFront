const fs = require("fs");
const path = require("path");
const file = path.join(
  __dirname,
  "..",
  "src",
  "app",
  "core",
  "models",
  "constants",
  "categories.const.ts"
);
const content = fs.readFileSync(file, "utf8");

// Split into top-level category blocks by locating patterns starting with "  {\n    value: '", keep first-level entries
const blocks = content.split("\n  {").slice(1);

const topToSubs = {};
const allTop = [];
const allSubs = [];

for (const b of blocks) {
  const topMatch = b.match(/value:\s*'([^']+)'/);
  if (!topMatch) continue;
  const top = topMatch[1];
  allTop.push(top);

  const subMatches = [];
  const re = /\{\s*value:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(b)) !== null) {
    const v = m[1];
    // skip the top-level value which matched first
    if (v === top) continue;
    subMatches.push(v);
    allSubs.push(v);
  }
  topToSubs[top] = Array.from(new Set(subMatches));
}

const topSet = new Set(allTop);
const subSet = new Set(allSubs);

const topAndSubIntersection = Array.from(
  new Set(allTop.filter((x) => subSet.has(x)))
);

// subcategories used in multiple parents
const subParents = {};
for (const [top, subs] of Object.entries(topToSubs)) {
  for (const s of subs) {
    if (!subParents[s]) subParents[s] = [];
    subParents[s].push(top);
  }
}

const subsInMultipleParents = Object.fromEntries(
  Object.entries(subParents).filter(([k, v]) => v.length > 1)
);

// Top-level duplicates (if any duplicate top values)
const topCounts = allTop.reduce((acc, v) => {
  acc[v] = (acc[v] || 0) + 1;
  return acc;
}, {});
const duplicateTops = Object.fromEntries(
  Object.entries(topCounts).filter(([k, v]) => v > 1)
);

// Subcategory duplicates (counts)
const subCounts = allSubs.reduce((acc, v) => {
  acc[v] = (acc[v] || 0) + 1;
  return acc;
}, {});
const duplicateSubs = Object.fromEntries(
  Object.entries(subCounts).filter(([k, v]) => v > 1)
);

const report = {
  totalTopCategories: allTop.length,
  totalSubcategoryEntries: allSubs.length,
  uniqueTopCategories: Array.from(topSet).length,
  uniqueSubcategories: Array.from(subSet).length,
  topAndSubIntersection,
  subsInMultipleParents,
  duplicateTops,
  duplicateSubs,
};

console.log(JSON.stringify(report, null, 2));
