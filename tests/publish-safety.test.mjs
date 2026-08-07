import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import test from "node:test";

const manifestText = fs.readFileSync("public/site/content/portfolio-asset-manifest.json", "utf8");
const manifest = JSON.parse(manifestText);
const contentBytes = fs.readFileSync("public/site/content/portfolio-content.json");
const content = JSON.parse(contentBytes);
const app = fs.readFileSync("public/site/assets/js/app.js", "utf8");
const items = manifest.items;
const slots = [];
function derive(value, projectId, location = []) {
  if (Array.isArray(value)) return value.forEach((entry, index) => derive(entry, projectId, [...location, index]));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const next = [...location, key];
    if ((key === "assetId" || key === "publicAssetId") && typeof child === "string") slots.push({ projectId, slotId: next.join("."), assetId: child });
    else if (key !== "sourceArchives") derive(child, projectId, next);
  }
}
for (const [projectId, project] of Object.entries(content.projects)) derive(project, projectId);
const html = ["index.html", "work.html", "experiments.html", "profile.html"].map((file) => fs.readFileSync(`public/site/${file}`, "utf8")).join("\n");

test("public Manifest contains no historical statuses", () => assert.doesNotMatch(manifestText, /historical-source|hidden-from-runtime/i));
test("public Manifest contains no do-not-publish metadata", () => assert.doesNotMatch(manifestText, /do-not-publish|doNotPublish/i));
test("public Manifest contains no source archive paths", () => assert.doesNotMatch(manifestText, /sourceArchives?|source archive|handoffPath|sourceFilename/i));
test("public Manifest contains no workspace or local paths", () => assert.doesNotMatch(manifestText, /file:\/\/|workspace|mnt\/data/i));
test("Manifest contains only runtime records", () => assert.equal(Object.keys(items).length, new Set(slots.map((slot) => slot.assetId)).size + 4));
test("all 36 slots resolve to a public placeholder", () => {
  assert.equal(slots.length, 36);
  for (const slot of slots) assert.match(items[items[slot.assetId].placeholderFallbackAssetId].publicPath, /^\/site\//);
});
test("all 36 missing slots are placeholder-active", () => assert.equal(slots.filter((slot) => items[slot.assetId].assetStatus === "awaiting-user-asset" && items[slot.assetId].implementationStatus === "placeholder-active").length, 36));
test("four shared placeholders exist", () => assert.equal(Object.values(items).filter((record) => record.assetStatus === "placeholder").length, 4));
test("public tree has no historical registry", () => assert.equal(fs.existsSync("public/site/content/historical-asset-registry.json"), false));
test("canonical Taishin owner is public", () => assert.equal(slots.filter((slot) => slot.projectId === "online-auction-payment-platform").length, 0));
test("Content r146 hash is unchanged", () => assert.equal(createHash("sha256").update(contentBytes).digest("hex"), "75b78cf1b035d09998eaf66563e06f42ee6d08e51961761ca879b0b2a47af80b"));
test("canonical project roster remains 13", () => assert.equal(Object.keys(content.projects).length, 13));
test("Chinese mode does not render English engineering status", () => assert.doesNotMatch(app, /localize\([^)]*placeholder-active/));
test("HTML has no empty or undefined src", () => assert.doesNotMatch(html, /src=["'](?:|undefined|null)["']/));
test("resolver has no dependency on historical metadata", () => assert.doesNotMatch(app.slice(app.indexOf("function resolveProjectAsset"), app.indexOf("window.resolveProjectAsset")), /historical-source|hidden-from-runtime/));
