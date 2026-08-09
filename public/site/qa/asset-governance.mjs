import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const siteRoot = path.resolve("public/site");
const contentBytes = fs.readFileSync(path.join(siteRoot, "content/portfolio-content.json"));
const content = JSON.parse(contentBytes);
const manifest = JSON.parse(fs.readFileSync(path.join(siteRoot, "content/portfolio-asset-manifest.json"), "utf8"));
const items = manifest.items || {};
const itemEntries = Object.entries(items);
const projectIds = Object.keys(content.projects || {});
const failures = [];
const fail = (condition, message) => { if (!condition) failures.push(message); };
const forbidden = /historical-source|hidden-from-runtime|do-not-publish|doNotPublish|sourceArchives?|source archive|handoffPath|sourceFilename|(?:file:\/\/|workspace|mnt\/data)/i;
const placeholderIds = [
  "project-visual-placeholder-wide-v1",
  "project-visual-placeholder-portrait-v1",
  "project-visual-placeholder-square-v1",
  "project-video-placeholder-wide-v1",
];

const contentSha = createHash("sha256").update(contentBytes).digest("hex");
fail(contentSha === "696e19f3f7cab1ac6ee77c5cec50ccaf4469bf59f0bf1f9bca7fe841b30b1a00", `Content r148 SHA changed: ${contentSha}`);
fail(content.contentVersion === "2026-08-09-r148" && projectIds.length === 13, "Content r148 roster changed");
fail(manifest.packageVersion === "r43" && manifest.contentVersion === content.contentVersion, "Manifest must be r43 aligned to r148");
fail(!forbidden.test(JSON.stringify(manifest)), "Public Manifest contains historical or local-only metadata");
fail(itemEntries.length === new Set(itemEntries.map(([id]) => id)).size, "Duplicate asset IDs");
const slots = [];
function deriveSlots(value, projectId, location = []) {
  if (Array.isArray(value)) return value.forEach((entry, index) => deriveSlots(entry, projectId, [...location, index]));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const next = [...location, key];
    if (["assetId","publicAssetId","beforeAssetId","shippedAssetId"].includes(key) && typeof child === "string") {
      slots.push({ projectId, slotId: next.join("."), assetId: child });
    } else if (key !== "sourceArchives") deriveSlots(child, projectId, next);
  }
}
for (const [projectId, project] of Object.entries(content.projects || {})) deriveSlots(project, projectId);
fail(itemEntries.length === new Set(slots.map((slot) => slot.assetId)).size + placeholderIds.length, "Manifest contains non-runtime records");
fail(slots.length === 37, "Runtime slot count must be 37");
fail(projectIds.every((id) => slots.some((slot) => slot.projectId === id)), "Every canonical project needs a visual slot");

const slotKeys = new Set();
for (const slot of slots) {
  const key = `${slot.projectId}/${slot.slotId}`;
  fail(!slotKeys.has(key), `Duplicate slot ${key}`);
  slotKeys.add(key);
  fail(slot.projectId !== "online-auction-payment-platform", `Legacy runtime owner: ${key}`);
  const record = items[slot.assetId];
  fail(Boolean(record), `Missing asset record ${slot.assetId}`);
  if (!record) continue;
  const production=record.assetStatus === "production" && record.implementationStatus === "real-active";
  const placeholder=record.assetStatus === "awaiting-user-asset" && record.implementationStatus === "placeholder-active";
  fail(record.publicBuild === true && (production || placeholder), `Runtime record is not publishable: ${slot.assetId}`);
  if(production){
    fail(record.replacementRequired === false, `Production record must not request replacement: ${slot.assetId}`);
    fail(Boolean(record.publicPath) && fs.existsSync(path.join(siteRoot, record.publicPath.replace(/^\/site\//, ""))), `Production file missing: ${slot.assetId}`);
  }else{
    const fallback = items[record.placeholderFallbackAssetId];
    fail(Boolean(fallback?.publicPath), `Placeholder missing: ${slot.assetId}`);
    if (fallback?.publicPath) fail(fs.existsSync(path.join(siteRoot, fallback.publicPath.replace(/^\/site\//, ""))), `Placeholder file missing: ${fallback.publicPath}`);
  }
}

for (const [id, record] of itemEntries) {
  fail(record.publicBuild === true, `Public runtime record is disabled: ${id}`);
  fail(record.projectId !== "online-auction-payment-platform", `Legacy public runtime owner: ${id}`);
  for (const field of [record.productionUrl, record.publicPath]) {
    if (field) fail(field.startsWith("/site/") && !forbidden.test(field), `Unsafe or non-public path: ${id}`);
  }
}

for (const id of placeholderIds) {
  const record = items[id];
  fail(record?.assetStatus === "placeholder" && record?.publicBuild === true, `Shared placeholder record missing: ${id}`);
  if (record?.publicPath) {
    const svg = fs.readFileSync(path.join(siteRoot, record.publicPath.replace(/^\/site\//, "")), "utf8");
    fail(/^<svg\b/.test(svg) && /<\/svg>\s*$/.test(svg), `Invalid SVG: ${id}`);
    fail(!/(?:<script|on\w+\s*=|href\s*=\s*["'](?:https?:|data:))/i.test(svg), `Unsafe SVG: ${id}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Asset governance passed: ${projectIds.length} projects, ${slots.length} derived slots, ${itemEntries.length} public records.`);
