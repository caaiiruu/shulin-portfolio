import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const siteRoot = path.resolve("public/site");
const registryPath = path.join(siteRoot, "docs/design-system/registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const failures = [];

const read = (relative) => fs.readFileSync(path.join(siteRoot, relative), "utf8");
const componentByName = new Map(registry.components.map((entry) => [entry.component, entry]));
const graph = registry.governanceGraph;

if (!graph || graph.schemaVersion !== 1) failures.push("registry: governanceGraph schemaVersion 1 is required");
if (graph?.consumerDiscoveryOwner !== "qa/design-system-impact.mjs") failures.push("registry: consumer discovery must be owned by qa/design-system-impact.mjs");

const tokenSource = read("assets/css/tokens.css");
const cssFiles = fs.readdirSync(path.join(siteRoot, "assets/css/components"))
  .filter((name) => name.endsWith(".css"))
  .map((name) => `assets/css/components/${name}`);
const runtimeFiles = ["assets/js/app.js", "assets/js/home.js"];
const sourceCache = new Map([...cssFiles, ...runtimeFiles].map((file) => [file, read(file)]));
const allCss = [tokenSource, ...cssFiles.map((file) => sourceCache.get(file))].join("\n");

for (const [name, contract] of Object.entries(graph?.componentContracts ?? {})) {
  const owner = componentByName.get(contract.registryComponent);
  if (!owner) {
    failures.push(`${name}: registry component ${contract.registryComponent} does not exist`);
    continue;
  }
  if (owner.cssOwner !== contract.cssOwner) failures.push(`${name}: CSS owner differs from registry component`);
  if (!Array.isArray(contract.tokenDependencies) || !contract.tokenDependencies.length) failures.push(`${name}: token dependencies missing`);
  for (const token of contract.tokenDependencies ?? []) {
    if (!allCss.includes(`--${token}:`)) failures.push(`${name}: undefined governed token --${token}`);
  }
  if (!Array.isArray(contract.variants) || !contract.variants.length) failures.push(`${name}: registered variants missing`);
  if (!Array.isArray(contract.consumerGroups) || !contract.consumerGroups.length) failures.push(`${name}: consumer groups missing`);
  if (!Array.isArray(contract.regressionContracts) || !contract.regressionContracts.length) failures.push(`${name}: regression contracts missing`);
  for (const marker of contract.discoveryMarkers ?? []) {
    const discovered = [...sourceCache.values()].some((source) => source.includes(marker));
    if (!discovered) failures.push(`${name}: runtime discovery marker not found: ${marker}`);
  }
}

for (const group of Object.values(graph?.consumerGroups ?? {})) {
  if (!group.surface || !Array.isArray(group.discoveryMarkers) || !group.discoveryMarkers.length) {
    failures.push("registry: every consumer group requires a surface and discovery markers");
    continue;
  }
  for (const marker of group.discoveryMarkers) {
    if (![...sourceCache.values()].some((source) => source.includes(marker))) failures.push(`${group.surface}: consumer marker not found: ${marker}`);
  }
}

// Project identity may select content or media focal position, but may not own
// shared geometry. Registered component CSS is scanned for slug/id selectors;
// runtime identity branches using style/class mutations are also rejected.
const projectIds = Object.keys(JSON.parse(read("content/portfolio-content.json")).projects);
const structuralProperties = "(?:gap|margin|padding|width|height|display|grid|flex|align|font-size|line-height|border-radius|position)";
for (const file of cssFiles) {
  const source = sourceCache.get(file);
  for (const id of projectIds) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const selectorBlock = new RegExp(`[^{}]*(?:#|data-project(?:-id)?=[\"']?)${escaped}[^{}]*\\{[^}]*${structuralProperties}\\s*:`, "i");
    if (selectorBlock.test(source)) failures.push(`${file}: project-specific structural geometry for ${id}`);
  }
}
for (const file of ["assets/js/app.js", "assets/js/home.js"]) {
  const source = sourceCache.get(file);
  for (const id of projectIds) {
    const identityBranch = new RegExp(`(?:projectKey|projectId|slug|key)\\s*===?\\s*[\"']${id}[\"'][\\s\\S]{0,240}(?:style\\.|classList\\.(?:add|toggle)|dataset\\.(?:variant|layout))`, "i");
    if (identityBranch.test(source)) failures.push(`${file}: project identity ${id} controls shared structural presentation`);
  }
}

function discoverChangedFiles() {
  const explicit = process.env.DESIGN_SYSTEM_CHANGED_FILES?.split(/\r?\n/).filter(Boolean);
  if (explicit?.length) return explicit;
  try {
    const base = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}...HEAD` : "HEAD^...HEAD";
    return execFileSync("git", ["diff", "--name-only", base], { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
  } catch {
    return [];
  }
}

const changedFiles = discoverChangedFiles();
const impacted = [];
for (const [name, contract] of Object.entries(graph?.componentContracts ?? {})) {
  const tokenChanged = changedFiles.includes("public/site/assets/css/tokens.css") && contract.tokenDependencies.length > 0;
  const ownerChanged = changedFiles.some((file) => file.endsWith(contract.cssOwner) || contract.renderOwners?.some((owner) => file.endsWith(owner)));
  if (tokenChanged || ownerChanged) impacted.push({ component: name, variants: contract.variants, consumerGroups: contract.consumerGroups, regressionContracts: contract.regressionContracts });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Design System ownership and impact governance passed.");
for (const [name, contract] of Object.entries(graph.componentContracts)) {
  console.log(`${name} -> ${contract.variants.join(" / ")} -> ${contract.consumerGroups.join(" / ")}`);
}
if (changedFiles.length) console.log(`Impacted regression map: ${JSON.stringify(impacted)}`);
