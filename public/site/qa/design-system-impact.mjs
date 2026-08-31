import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const siteRoot = path.resolve("public/site");
const registryPath = process.env.DESIGN_SYSTEM_REGISTRY_PATH
  ? path.resolve(process.env.DESIGN_SYSTEM_REGISTRY_PATH)
  : path.join(siteRoot, "docs/design-system/registry.json");
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
const projectIds = Object.keys(JSON.parse(read("content/portfolio-content.json")).projects);
const governedTokenOwners = new Map();
const discovery = new Map();

for (const [token, tokenContract] of Object.entries(graph?.tokenContracts ?? {})) {
  if (!tokenContract.primitive || !tokenContract.intent || !tokenContract.owner) failures.push(`${token}: malformed token contract`);
  if (!tokenSource.includes(`--${token}: var(--${tokenContract.primitive})`)) failures.push(`${token}: token contract does not resolve to --${tokenContract.primitive}`);
  if (!graph?.componentContracts?.[tokenContract.owner]) failures.push(`${token}: unknown component owner ${tokenContract.owner}`);
}

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
  if (new Set(contract.variants ?? []).size !== contract.variants?.length) failures.push(`${name}: duplicate registered variant`);
  for (const variant of contract.variants ?? []) {
    if (projectIds.includes(variant) || projectIds.includes(variant.toLowerCase().replaceAll(" ", "-"))) failures.push(`${name}: project identity may not be a structural variant: ${variant}`);
  }
  if (!Array.isArray(contract.consumerGroups) || !contract.consumerGroups.length) failures.push(`${name}: consumer groups missing`);
  for (const group of contract.consumerGroups ?? []) if (!graph.consumerGroups?.[group]) failures.push(`${name}: unknown consumer group ${group}`);
  if (!contract.variantConsumers || JSON.stringify(Object.keys(contract.variantConsumers).sort()) !== JSON.stringify([...contract.variants].sort())) failures.push(`${name}: every registered variant requires one variant-consumer mapping`);
  for (const [variant, groups] of Object.entries(contract.variantConsumers ?? {})) {
    if (!Array.isArray(groups) || !groups.length) failures.push(`${name}/${variant}: consumer mapping missing`);
    for (const group of groups ?? []) {
      if (!graph.consumerGroups?.[group]) failures.push(`${name}/${variant}: unknown consumer group ${group}`);
      if (!contract.consumerGroups.includes(group)) failures.push(`${name}/${variant}: consumer group ${group} is outside component scope`);
    }
  }
  if (!Array.isArray(contract.regressionProfiles) || !contract.regressionProfiles.length) failures.push(`${name}: regression profiles missing`);
  for (const profile of contract.regressionProfiles ?? []) if (!graph.regressionProfiles?.[profile]) failures.push(`${name}: unknown regression profile ${profile}`);
  if (!Array.isArray(contract.regressionContracts) || !contract.regressionContracts.length) failures.push(`${name}: regression contracts missing`);
  for (const regression of contract.regressionContracts ?? []) if (!fs.existsSync(path.resolve(regression))) failures.push(`${name}: regression contract does not exist: ${regression}`);
  for (const token of contract.componentIntentTokens ?? []) {
    if (!contract.tokenDependencies.includes(token)) failures.push(`${name}: component-intent token is not a dependency: ${token}`);
    if (governedTokenOwners.has(token)) failures.push(`${token}: duplicate component-intent ownership by ${governedTokenOwners.get(token)} and ${name}`);
    governedTokenOwners.set(token, name);
    if (graph.tokenContracts?.[token]?.owner !== name) failures.push(`${token}: token contract owner differs from ${name}`);
  }
  const discoveredFiles = new Set();
  for (const marker of contract.discoveryMarkers ?? []) {
    const matches = [...sourceCache.entries()].filter(([, source]) => source.includes(marker)).map(([file]) => file);
    matches.forEach((file) => discoveredFiles.add(file));
    if (!matches.length) failures.push(`${name}: runtime discovery marker not found: ${marker}`);
  }
  discovery.set(name, [...discoveredFiles].sort());
}

for (const [groupName, group] of Object.entries(graph?.consumerGroups ?? {})) {
  if (!group.surface || !Array.isArray(group.discoveryMarkers) || !group.discoveryMarkers.length) {
    failures.push("registry: every consumer group requires a surface and discovery markers");
    continue;
  }
  for (const marker of group.discoveryMarkers) {
    if (![...sourceCache.values()].some((source) => source.includes(marker))) failures.push(`${groupName}: consumer marker not found: ${marker}`);
  }
}

for (const [profileName, profile] of Object.entries(graph?.regressionProfiles ?? {})) {
  if (!Array.isArray(profile.viewports) || !profile.viewports.length || !Array.isArray(profile.checks) || !profile.checks.length) failures.push(`${profileName}: malformed regression profile`);
}

// Project identity may select content or media focal position, but may not own
// shared geometry. Registered component CSS is scanned for slug/id selectors;
// runtime identity branches using style/class mutations are also rejected.
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

function discoverChangedTokens(changedFiles) {
  const explicit = process.env.DESIGN_SYSTEM_CHANGED_TOKENS?.split(/[\s,]+/).filter(Boolean).map((token) => token.replace(/^--/, ""));
  if (explicit?.length) return explicit;
  if (!changedFiles.includes("public/site/assets/css/tokens.css")) return [];
  try {
    const base = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}...HEAD` : "HEAD^...HEAD";
    const diff = execFileSync("git", ["diff", "--unified=0", base, "--", "public/site/assets/css/tokens.css"], { encoding: "utf8" });
    return [...new Set([...diff.matchAll(/^[+-]\s*--([a-z0-9-]+)\s*:/gmi)].map((match) => match[1]))];
  } catch {
    return [];
  }
}

const changedFiles = discoverChangedFiles();
const changedTokens = discoverChangedTokens(changedFiles);
for (const token of changedTokens) if (!allCss.includes(`--${token}:`)) failures.push(`impact query references unknown token --${token}`);
const impacted = [];
for (const [name, contract] of Object.entries(graph?.componentContracts ?? {})) {
  const matchedTokens = changedTokens.filter((token) => contract.tokenDependencies.includes(token));
  const tokenChanged = matchedTokens.length > 0;
  const ownerChanged = changedFiles.some((file) => file.endsWith(contract.cssOwner) || contract.renderOwners?.some((owner) => file.endsWith(owner)));
  if (tokenChanged || ownerChanged) impacted.push({ component: name, changedTokens: matchedTokens, variants: Object.entries(contract.variantConsumers).map(([variant, consumerGroups]) => ({variant, consumerGroups})), discoveredInstances: discovery.get(name), regressionProfiles: contract.regressionProfiles, regressionContracts: contract.regressionContracts });
}

const golden = graph?.goldenConsumers;
if (!golden || JSON.stringify(golden.viewports) !== JSON.stringify([1419, 871, 430])) failures.push("golden consumers: canonical viewports must be 1419 / 871 / 430");
for (const item of golden?.projectCards ?? []) if (!graph.componentContracts.ProjectCard.variants.includes(item.variant)) failures.push(`golden consumers: unknown ProjectCard variant ${item.variant}`);
for (const component of [...(golden?.primaryProjectDetail?.covers ?? []), ...(golden?.experimentProjectDetail?.covers ?? [])]) if (!graph.componentContracts[component]) failures.push(`golden consumers: unknown component ${component}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Design System ownership and impact governance passed.");
for (const [name, contract] of Object.entries(graph.componentContracts)) {
  console.log(`${name} -> ${Object.entries(contract.variantConsumers).map(([variant, groups]) => `${variant} [${groups.join(" / ")}]`).join(" / ")} -> ${contract.regressionProfiles.join(" / ")}`);
}
if (changedFiles.length || changedTokens.length) console.log(`Impacted regression map: ${JSON.stringify(impacted)}`);
