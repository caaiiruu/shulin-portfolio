import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { deriveRuntimeVisualSlots, validateRuntimeVisualAssets } from "../scripts/visual-asset-governance.mjs";

const manifest = JSON.parse(fs.readFileSync("public/site/content/portfolio-asset-manifest.json", "utf8"));
const content = JSON.parse(fs.readFileSync("public/site/content/portfolio-content.json", "utf8"));
const app = fs.readFileSync("public/site/assets/js/app.js", "utf8");
const items = manifest.items;
const slots = [];
function derive(value, projectId, location = []) {
  if (Array.isArray(value)) return value.forEach((entry, index) => derive(entry, projectId, [...location, index]));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const next = [...location, key];
    if (["assetId","publicAssetId","beforeAssetId","shippedAssetId"].includes(key) && typeof child === "string") slots.push({ projectId, slotId: next.join("."), assetId: child });
    else if (key !== "sourceArchives") derive(child, projectId, next);
  }
}
for (const [projectId, project] of Object.entries(content.projects)) derive(project, projectId);
const resolve = (assetId) => {
  const record = items[assetId];
  if (!record) throw new Error("unknown runtime asset");
  if (record.assetStatus === "production" && record.implementationStatus === "real-active") return { src: record.publicPath, placeholder: false };
  const fallback = items[record.placeholderFallbackAssetId];
  if (record.assetStatus === "awaiting-user-asset" && fallback?.publicPath) return { src: fallback.publicPath, placeholder: true };
  throw new Error("no real file or placeholder");
};

test("real production asset wins over placeholder metadata", () => {
  const fixture = { assetStatus: "production", implementationStatus: "real-active", publicPath: "/site/real.png", placeholderFallbackAssetId: "project-visual-placeholder-wide-v1" };
  assert.equal(fixture.assetStatus === "production" ? fixture.publicPath : items[fixture.placeholderFallbackAssetId].publicPath, "/site/real.png");
});

test("missing real runtime assets resolve to shared placeholders", () => {
  const slot = slots.find(slot=>items[slot.assetId]?.assetStatus==="awaiting-user-asset");
  assert.equal(resolve(slot.assetId).placeholder, true);
});

test("historical assets are absent from the public runtime manifest", () => {
  assert.equal(Object.values(items).filter((entry) => /historical|hidden-from-runtime/i.test(JSON.stringify(entry))).length, 0);
});

test("video placeholders are inert images, not playable media", () => {
  const video = slots.map((slot) => items[slot.assetId]).find((entry) => entry.type === "video");
  assert.equal(video.placeholderFallbackAssetId, "project-video-placeholder-wide-v1");
  assert.match(app, /if\(resolved\)\{\s*const image=doc\.createElement\('img'\)/);
});

test("public missing assets without fallback fail resolution", () => {
  assert.throws(() => resolve("not-registered"), /unknown runtime asset/);
});

test("legacy auction runtime ownership uses canonical Taishin identity", () => {
  assert.equal(Object.values(items).filter((entry) => entry.projectId === "online-auction-payment-platform").length, 0);
  assert.ok(slots.some((slot) => slot.projectId === "taishin-p2p-marketplace-platform"));
});

test("all 13 projects own unique visual slots with no broken src assignment", () => {
  assert.equal(Object.keys(content.projects).length, 13);
  assert.ok(slots.length > 0);
  assert.equal(new Set(slots.map((slot) => `${slot.projectId}/${slot.slotId}`)).size, slots.length);
  assert.doesNotMatch(app, /\.src\s*=\s*(?:''|null|undefined)/);
});

test("Chinese placeholder label has no English fallback", () => {
  assert.match(app, /專案視覺素材待補/);
});

test("structural governance accepts legitimate canonical inventory growth", () => {
  const derived = deriveRuntimeVisualSlots(content);
  const result = validateRuntimeVisualAssets({
    slots: derived,
    assetManifest: manifest,
    publicAssetExists: () => true,
  });
  assert.equal(result.slotCount, derived.length);
  assert.equal(result.uniqueAssetCount, new Set(derived.map((slot) => slot.assetId)).size);
});

test("structural governance rejects unknown and malformed runtime references", () => {
  assert.throws(
    () => validateRuntimeVisualAssets({
      slots: [{ projectId: "dbs", slotId: "decisionEvidenceMap.0", assetId: "missing-asset" }],
      assetManifest: manifest,
    }),
    /unknown asset/
  );
  assert.throws(
    () => validateRuntimeVisualAssets({
      slots: [{ projectId: "dbs", slotId: "", assetId: "dbs-decision-01-eod-operating-model-01" }],
      assetManifest: manifest,
    }),
    /projectId, slotId and assetId/
  );
});

test("structural governance rejects unsafe fallbacks and public paths", () => {
  const unsafeFallbackManifest = {
    items: {
      pending: { id: "pending", assetStatus: "awaiting-user-asset", publicBuild: true, placeholderFallbackAssetId: null },
    },
  };
  assert.throws(
    () => validateRuntimeVisualAssets({
      slots: [{ projectId: "dbs", slotId: "evidence.0", assetId: "pending" }],
      assetManifest: unsafeFallbackManifest,
    }),
    /no approved fallback/
  );

  const outsidePathManifest = {
    items: {
      unsafe: { id: "unsafe", assetStatus: "production", publicBuild: true, publicPath: "https://private.example/asset.jpg" },
    },
  };
  assert.throws(
    () => validateRuntimeVisualAssets({
      slots: [{ projectId: "dbs", slotId: "evidence.0", assetId: "unsafe" }],
      assetManifest: outsidePathManifest,
    }),
    /allowed \/site\/ public path/
  );
});

test("structural governance rejects dangling files and duplicate active mappings", () => {
  const dangling = {
    items: {
      asset: { id: "asset", assetStatus: "production", publicBuild: true, publicPath: "/site/missing.jpg" },
    },
  };
  assert.throws(
    () => validateRuntimeVisualAssets({
      slots: [{ projectId: "dbs", slotId: "evidence.0", assetId: "asset" }],
      assetManifest: dangling,
      publicAssetExists: () => false,
    }),
    /file is missing/
  );

  const duplicated = {
    items: {
      first: { id: "first", assetStatus: "production", publicBuild: true, publicPath: "/site/shared.jpg" },
      second: { id: "second", assetStatus: "production", publicBuild: true, publicPath: "/site/shared.jpg" },
    },
  };
  assert.throws(
    () => validateRuntimeVisualAssets({
      slots: [
        { projectId: "dbs", slotId: "evidence.0", assetId: "first" },
        { projectId: "dbs", slotId: "evidence.1", assetId: "second" },
      ],
      assetManifest: duplicated,
    }),
    /Duplicate active semantic asset path/
  );
});
