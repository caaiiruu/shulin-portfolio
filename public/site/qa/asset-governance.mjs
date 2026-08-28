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

fail(typeof content.contentVersion === "string" && content.contentVersion.trim().length > 0, "Content contentVersion must exist and be non-empty");
fail(projectIds.length === 13, "Canonical project roster changed");
fail(manifest.packageVersion === "r45" && manifest.contentVersion === content.contentVersion, "Manifest must preserve package contract and match the active Content contentVersion");
const lockedReusableImages = {
  "voucher-offer-reusable-system-shared-rules-01.jpg": "ea25dc84274b4b9575911e273ef8ed7f0a80e0223dcd2001b5dbd3ef6db0b333",
  "voucher-offer-reusable-system-shared-states-01.jpg": "d694f400aad6539c5eec44863f3dfc27510b66efacd6bbe8cd9f2bb6d9c9ef8f",
  "voucher-offer-reusable-system-reusable-patterns-01.jpg": "1e8d55df890a00bacf24d5a199fb52f7835ebd8bd63eebbf3be10fafc3abccf2",
  "voucher-offer-reusable-system-component-foundation-01.jpg": "ca695ea9d4562b126c7478180f049036c5fce228298bac378010e03e6497deef",
};
for (const [filename, expected] of Object.entries(lockedReusableImages)) {
  const canonical = path.join(siteRoot, "assets/projects/voucher", filename);
  fail(fs.existsSync(canonical), `Locked reusable-system image missing: ${filename}`);
  if (fs.existsSync(canonical)) fail(createHash("sha256").update(fs.readFileSync(canonical)).digest("hex") === expected, `Locked reusable-system image hash changed: ${filename}`);
}
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
    } else if (key === "assetIds" && value.presentation === "editorial-pair" && Array.isArray(child)) {
      child.forEach((assetId, index) => {
        if (typeof assetId === "string") slots.push({ projectId, slotId: [...next, index].join("."), assetId });
      });
    } else if (key !== "sourceArchives") deriveSlots(child, projectId, next);
  }
}
for (const [projectId, project] of Object.entries(content.projects || {})) deriveSlots(project, projectId);
fail(itemEntries.length === new Set(slots.map((slot) => slot.assetId)).size + placeholderIds.length, "Manifest contains non-runtime records");
fail(slots.length > 0, "Runtime visual slots must not be empty");
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
