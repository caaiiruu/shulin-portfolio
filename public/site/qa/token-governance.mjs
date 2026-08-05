import fs from "node:fs";
import path from "node:path";

const root = path.resolve("public/site/assets/css");
const files = ["base.css", ...fs.readdirSync(path.join(root, "components")).filter((name) => name.endsWith(".css")).map((name) => `components/${name}`)];
const failures = [];
const rawDimension = /(?<![-\w])(?:\d+\.\d+|\d+|\.\d+)(?:px|rem|em|vw|vh|vmin|vmax|ch|ms|s|deg)\b/;
const mediaDimension = /@media\s*\([^)]*(?:min|max)-(?:width|height)\s*:\s*\d+px[^)]*\)/g;

for (const relative of files) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  const declarationsOnly = source.replace(mediaDimension, "@media(verified-breakpoint)").replace(/\/\*[\s\S]*?\*\//g, "");
  const raw = declarationsOnly.match(rawDimension);
  if (raw) failures.push(`${relative}: raw dimension ${raw[0]} must be a token`);
}
const tokens = fs.readFileSync(path.join(root, "tokens.css"), "utf8");
const canonical = [tokens, ...files.map((relative) => fs.readFileSync(path.join(root, relative), "utf8"))].join("\n");
if (/--portfolio-warm-|#f4f0e9|#b6a996/i.test(canonical)) {
  failures.push("Warm-beige portfolio primitives are forbidden in canonical production styles.");
}
const definitions = new Set([...canonical.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g)].map((match) => match[1]));
const references = new Set([...canonical.matchAll(/var\(--([a-zA-Z0-9_-]+)/g)].map((match) => match[1]));
for (const reference of [...references].sort()) {
  if (!definitions.has(reference)) failures.push(`Undefined token reference: --${reference}`);
}
for (const layer of ["Primitive scale", "Semantic layer", "Generated dimension primitives"]) {
  if (!tokens.includes(layer)) failures.push(`tokens.css: ${layer} missing`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Canonical token governance passed.");
