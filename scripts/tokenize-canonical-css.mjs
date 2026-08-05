import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const root = path.resolve("public/site/assets/css");
const files = [
  "base.css",
  ...fs.readdirSync(path.join(root, "components")).filter((name) => name.endsWith(".css")).map((name) => `components/${name}`),
];
const dimensions = new Map();
const dimensionPattern = /(?<![\w.-])(-?(?:\d+\.\d+|\d+|\.\d+))(px|rem|em|vw|vh|vmin|vmax|ch|ms|s|deg)\b/g;
const dimensionReferencePattern = /var\(--dimension-([a-z0-9-]+)\)/g;

function tokenName(number, unit) {
  const normalized = number
    .replace(/^-/, "neg-")
    .replace(/^\./, "0-")
    .replace(".", "-");
  return `--dimension-${normalized}${unit}`;
}

function dimensionValueFromToken(encoded) {
  const match = encoded.match(/^(neg-)?(.+?)(px|rem|em|vw|vh|vmin|vmax|ch|ms|s|deg)$/);
  if (!match) return null;
  const [, negative, numeric, unit] = match;
  let number;
  // Legacy negative fractional token names use `neg--045em` for `-.045em`.
  // Keep every decimal digit: slicing two characters incorrectly turned
  // `-.045em` into `-.45em`, multiplying negative tracking by ten.
  if (/^-\d+$/.test(numeric)) number = `.${numeric.slice(1)}`;
  else if (/^-\d+$/.test(numeric)) number = numeric.slice(1);
  else number = numeric.replace("-", ".");
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(number)) return null;
  return `${negative ? "-" : ""}${number}${unit}`;
}

for (const relative of files) {
  const file = path.join(root, relative);
  const ast = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
  ast.walkDecls((decl) => {
    for (const match of decl.value.matchAll(dimensionReferencePattern)) {
      const value = dimensionValueFromToken(match[1]);
      if (value) dimensions.set(`--dimension-${match[1]}`, value);
    }
    dimensionPattern.lastIndex = 0;
    if (!dimensionPattern.test(decl.value)) return;
    dimensionPattern.lastIndex = 0;
    decl.value = decl.value.replace(dimensionPattern, (match, number, unit) => {
      if (Number(number) === 0) return "0";
      const token = tokenName(number, unit);
      dimensions.set(token, `${number}${unit}`);
      return `var(${token})`;
    });
  });
  fs.writeFileSync(file, ast.toString());
}

const tokenFile = path.join(root, "tokens.css");
let tokens = fs.readFileSync(tokenFile, "utf8").replace(/\n\/\* Generated dimension primitives[\s\S]*$/m, "").trimEnd();
const declarations = [...dimensions.entries()]
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([name, value]) => `  ${name}: ${value};`)
  .join("\n");
tokens += `\n\n/* Generated dimension primitives. Semantic and component tokens should consume these values. */\n:root {\n${declarations}\n}\n`;
fs.writeFileSync(tokenFile, tokens);
console.log(`Tokenized canonical CSS with ${dimensions.size} shared dimension primitives`);
