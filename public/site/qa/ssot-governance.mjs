import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const root = path.resolve("public/site");
const failures = [];
const manifest = JSON.parse(fs.readFileSync(path.join(root, "docs/design-system/ssot-manifest.json"), "utf8"));
const owners = manifest.owners;
const contentDirectory = path.join(root, "content");
const content = JSON.parse(fs.readFileSync(path.join(contentDirectory, "portfolio-content.json"), "utf8"));
const serializedContent = JSON.stringify(content);
const projectIds = Object.keys(content.projects || {});
const projectIdSet = new Set(projectIds);
const allowedProjectTypes = new Set([
  "Internal System",
  "Incentive System",
  "Transaction System",
  "Marketplace Platform",
  "0→1 Product",
]);
for (const [id, project] of Object.entries(content.projects || {})) {
  const canonicalType = project.infoGrid?.type?.value;
  if (!allowedProjectTypes.has(canonicalType)) failures.push(`project type: ${id} must use one approved Type`);
  const audiences = [project.infoGrid?.audience, project.publicContent?.hero?.infoGrid?.audience];
  for (const audience of audiences) {
    if (!audience || typeof audience !== "object" || Array.isArray(audience) || !audience.en || !audience.zh) continue;
    if (!/Primary:[^\n]+\nSecondary:/.test(audience.en) || !/主要：[^\n]+\n次要：/.test(audience.zh)) {
      failures.push(`project audience: ${id} must render primary and secondary on separate semantic lines`);
    }
  }
}
const workFilters = content.workIndex?.workFilters || [];
const workFilterIds = workFilters.map((filter) => filter.id);
if (!workFilters.length || workFilterIds[0] !== "all" || new Set(workFilterIds).size !== workFilterIds.length) {
  failures.push("work filters: registry must start with one unique all filter");
}
for (const filter of workFilters) {
  if (!filter.label?.en || !filter.label?.zh || !Array.isArray(filter.projectIds) || filter.projectIds.length === 0) {
    failures.push(`work filters: ${filter.id || "unknown"} must have bilingual labels and at least one project`);
    continue;
  }
  if (new Set(filter.projectIds).size !== filter.projectIds.length) failures.push(`work filters: ${filter.id} contains duplicate project IDs`);
  for (const id of filter.projectIds) if (!projectIdSet.has(id)) failures.push(`work filters: ${filter.id} references missing project ${id}`);
}
const allFilter = workFilters.find((filter) => filter.id === "all");
if (!allFilter || allFilter.projectIds.length !== projectIds.length || projectIds.some((id) => !allFilter.projectIds.includes(id))) {
  failures.push("work filters: all must contain every canonical project exactly once");
}
for (const id of projectIds) {
  if (!workFilters.some((filter) => filter.id !== "all" && filter.projectIds.includes(id))) failures.push(`work filters: ${id} has no concrete category`);
}
if (/觸發條件s|日終\s+monitoring|例外\s+handling|證據\s+needs/i.test(serializedContent)) {
  failures.push("localization: malformed mixed-language DBS decision copy must not return");
}
const runtimeOwner = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
for (const contract of [
  "normalizePublicCopy",
  ".replace(/我的角色/g,'擔任角色')",
  ".replace(/我的決策/g,'決策內容')",
  "[/\\bmonitoring\\b/gi,'監控']",
  "[/\\bhandling\\b/gi,'處理']",
]) {
  if (!runtimeOwner.includes(contract)) failures.push(`localization: runtime copy-normalization contract missing: ${contract}`);
}

for (const [role, relative] of Object.entries(owners)) {
  const resolved = path.resolve(root, relative);
  if (!fs.existsSync(resolved)) failures.push(`${role}: declared SSOT owner is missing: ${relative}`);
}

const registryFiles = fs.readdirSync(path.join(root, "docs/design-system"))
  .filter((name) => /registry.*\.json$/i.test(name));
if (registryFiles.length !== 1 || registryFiles[0] !== "registry.json") {
  failures.push(`registry: expected only registry.json, found ${registryFiles.join(", ") || "none"}`);
}

const activeStyleFiles = [
  ...fs.readdirSync(path.join(root, "assets/css")).filter((name) => name.endsWith(".css") && !name.startsWith("production.")),
  ...fs.readdirSync(path.join(root, "assets/css/components")).filter((name) => name.endsWith(".css")),
];
for (const name of activeStyleFiles) {
  if (/v\d+/i.test(name)) failures.push(`styles: versioned active source is forbidden: ${name}`);
}
if (activeStyleFiles.filter((name) => name === "tokens.css").length !== 1) {
  failures.push("tokens: assets/css/tokens.css must be the only active token stylesheet");
}

const structuredContentFiles = fs.readdirSync(contentDirectory)
  .filter((name) => name.endsWith(".json"));
const expectedStructuredOwners = ["portfolio-asset-manifest.json", "portfolio-content.json"];
if (structuredContentFiles.length !== expectedStructuredOwners.length || expectedStructuredOwners.some((name) => !structuredContentFiles.includes(name))) {
  failures.push(`content: expected the Content and Asset Manifest owners, found ${structuredContentFiles.join(", ") || "none"}`);
}
if (structuredContentFiles.some((name) => /(?:v\d+|new|final|latest|fixed)/i.test(name))) {
  failures.push("content: versioned or status-named production content files are forbidden");
}

const approvedZhCardTerms = [
  "NTUC FairPrice",
  "Booking.com",
  "UX Designer",
  "Voucher Center",
  "Voucher",
  "Game Center",
  "DBS",
  "CTBC Bank",
  "Bandzo",
  "FairPrice",
  "Kopitiam",
  "SEC",
  "Flash",
  "AML",
  "KYC",
  "PDP",
  "GMV",
  "PDF",
  "CRM",
  "CCU",
  "RM",
  "LinkPoints",
  "App-to-POS",
  "App",
  "POS",
];
const removeApprovedZhCardTerms = (value) => approvedZhCardTerms.reduce(
  (text, term) => text.replaceAll(term, ""),
  String(value || ""),
);
for (const [projectId, project] of Object.entries(content.projects || {})) {
  const zhCardFields = {
    title: project.title?.zh,
    summary: project.atAGlance?.zh,
  };
  const problemTypes = project.problemTypes?.zh;
  for (const [field, value] of Object.entries(zhCardFields)) {
    if (!value) {
      failures.push(`localization: missing projects.${projectId}.${field}.zh`);
      continue;
    }
    const nonAllowlisted = removeApprovedZhCardTerms(value).match(/[A-Za-z]{2,}(?:[- ][A-Za-z]{2,})*/g) || [];
    if (nonAllowlisted.length) {
      failures.push(`localization: non-allowlisted English in projects.${projectId}.${field}.zh: ${nonAllowlisted.join(", ")}`);
    }
  }
  if (!Array.isArray(problemTypes) || problemTypes.length === 0) {
    failures.push(`localization: missing projects.${projectId}.problemTypes_zh`);
  } else {
    problemTypes.forEach((value, index) => {
      const nonAllowlisted = removeApprovedZhCardTerms(value).match(/[A-Za-z]{2,}(?:[- ][A-Za-z]{2,})*/g) || [];
      if (nonAllowlisted.length) {
        failures.push(`localization: non-allowlisted English in projects.${projectId}.problemTypes_zh.${index}: ${nonAllowlisted.join(", ")}`);
      }
    });
  }
  const firstScreenFields = {
    scope: project.infoGrid?.scope?.zh,
    audience: [
      project.infoGrid?.audience?.primary?.zh,
      ...(project.infoGrid?.audience?.secondary?.zh || []),
    ].filter(Boolean).join(" "),
    whyItMattered: project.whyItMattered?.zh,
    businessImpact: project.businessImpact?.zh,
  };
  for (const [field, value] of Object.entries(firstScreenFields)) {
    if (!value) {
      failures.push(`localization: missing projects.${projectId}.${field}.zh`);
      continue;
    }
    const nonAllowlisted = removeApprovedZhCardTerms(value).match(/[A-Za-z]{2,}(?:[- ][A-Za-z]{2,})*/g) || [];
    if (nonAllowlisted.length) {
      failures.push(`localization: non-allowlisted English in projects.${projectId}.${field}.zh: ${nonAllowlisted.join(", ")}`);
    }
  }
}

const qaFiles = fs.readdirSync(path.join(root, "qa"));
if (qaFiles.some((name) => /^token-governance-v\d+\.mjs$/i.test(name))) {
  failures.push("governance: versioned token-governance scripts are forbidden");
}

const stalePublicFiles = fs.readdirSync(root).filter((name) => /^v\d+.*\.(?:md|html|css|js)$/i.test(name));
if (stalePublicFiles.length) failures.push(`history: release files must live in Git, found ${stalePublicFiles.join(", ")}`);

const designDocs = path.join(root, "docs/design-system");
const docFiles = [];
for (const directory of [designDocs, path.join(designDocs, "components"), path.join(designDocs, "tokens")]) {
  for (const name of fs.readdirSync(directory)) {
    const resolved = path.join(directory, name);
    if (fs.statSync(resolved).isFile()) docFiles.push(resolved);
  }
}
for (const file of docFiles) {
  const content = fs.readFileSync(file, "utf8");
  if (/(?:tokens|system|components|foundation|portfolio)-v\d+\.(?:css|js)/i.test(content)) {
    failures.push(`documentation: obsolete release owner in ${path.relative(root, file)}`);
  }
}

const builder = fs.readFileSync(path.resolve("scripts/build-production-assets.mjs"), "utf8");
for (const owner of [owners.tokens, owners.globalLayout, owners.componentRegistry, owners.content, owners.assetManifest, owners.runtime]) {
  if (!builder.includes(owner)) failures.push(`builder: canonical owner is not wired into production: ${owner}`);
}
if (builder.includes("registry.current.json")) failures.push("builder: obsolete registry.current.json reference found");

const baseCss = fs.readFileSync(path.join(root, owners.globalLayout), "utf8");
const legacyMarkers = (baseCss.match(/\/\* source:.*v\d+/gi) || []).length;
const versionedProperties = new Set([...baseCss.matchAll(/--v\d+[\w-]*/g)].map((match) => match[0])).size;
const selectorContexts = new Map();
postcss.parse(baseCss).walkRules((rule) => {
  if (rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name)) return;
  const context = [];
  for (let parent = rule.parent; parent && parent.type !== "root"; parent = parent.parent) {
    if (parent.type === "atrule") context.unshift(`@${parent.name} ${parent.params}`);
  }
  for (const selector of rule.selectors) {
    const key = `${context.join("|")}::${selector.replace(/\s+/g, " ").trim()}`;
    selectorContexts.set(key, (selectorContexts.get(key) || 0) + 1);
  }
});
const duplicateSelectors = [...selectorContexts.values()].filter((count) => count > 1).length;
const debt = manifest.zeroDebtGate;
if (legacyMarkers !== debt.baseCssVersionedSourceMarkers) failures.push(`base.css: versioned source-marker debt must be zero (found ${legacyMarkers})`);
if (versionedProperties !== debt.baseCssVersionedCustomProperties) failures.push(`base.css: release-named token debt must be zero (found ${versionedProperties})`);
if (duplicateSelectors !== debt.baseCssSameContextDuplicateSelectors) failures.push(`base.css: duplicate selector-owner debt must be zero (found ${duplicateSelectors})`);

for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  if (/\bdata-(?:en|zh)(?:-html)?=/.test(html)) failures.push(`${page}: bilingual literals are forbidden; use an SSOT copy key`);
  if (/\baria-label=/.test(html)) failures.push(`${page}: literal aria-label is forbidden; use an SSOT aria key`);
  const staticCopy = content.localizationRegistry?.staticPageCopy || {};
  for (const match of html.matchAll(/\bdata-(?:copy|copy-html|aria)-key="([^"]+)"/g)) {
    const value = staticCopy[match[1]];
    if (!value?.en || !value?.zh) failures.push(`${page}: unresolved bilingual SSOT copy key ${match[1]}`);
  }
  const styles = [...html.matchAll(/<link\b[^>]+href="([^"]+\.css)"/g)].map((match) => match[1]);
  if (styles.length !== 1 || !/\/production\.[a-f0-9]{16}\.css$/.test(styles[0])) {
    failures.push(`${page}: must load exactly one generated production stylesheet`);
  }

  const approvedStaticZhTerms = [
    "NTUC FairPrice", "FairPrice Group", "Booking.com", "DBS", "AJA Creative",
    "Bandzo", "LinkedIn", "Spotify", "Sketch", "AI", "App", "POS", "NPS",
    "CRM", "CCU", "KYC", "QR", "CV", "0→1",
  ];
  const stripApprovedStaticZhTerms = (value) => approvedStaticZhTerms.reduce(
    (text, term) => text.replaceAll(term, ""),
    String(value || ""),
  );
  for (const match of html.matchAll(/\bdata-zh(?:-html)?="([^"]*)"/g)) {
    const visibleChineseCopy = match[1]
      .replaceAll("&amp;", "&")
      .replace(/&lt;\/?(?:br|em)&gt;/g, "");
    const nonAllowlisted = stripApprovedStaticZhTerms(visibleChineseCopy).match(/[A-Za-z]{2,}(?:[- ][A-Za-z]{2,})*/g) || [];
    if (nonAllowlisted.length) failures.push(`${page}: non-allowlisted English in static Chinese copy: ${visibleChineseCopy}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Canonical SSOT governance passed.");
await import("./asset-governance.mjs");
