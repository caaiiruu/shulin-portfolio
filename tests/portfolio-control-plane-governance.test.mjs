import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const qaBranch = "qa/r146-r43-preview-2026-08-06";
const workflowPath = ".github/workflows/release-gate-r146-r43.yml";
const contentPath = "public/site/content/portfolio-content.json";
const manifestPath = "public/site/content/portfolio-asset-manifest.json";
const assetRoot = "public/site/assets/projects/";

const workflow = fs.readFileSync(workflowPath, "utf8");
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const builder = fs.readFileSync("scripts/build-production-assets.mjs", "utf8");
const assetGovernance = fs.readFileSync("public/site/qa/asset-governance.mjs", "utf8");
const browserQa = fs.readFileSync("tests/portfolio-browser-qa.mjs", "utf8");

function triggerBlock(name) {
  const match = workflow.match(new RegExp(`(?:^|\\n)  ${name}:\\n([\\s\\S]*?)(?=\\n  [A-Za-z_][A-Za-z0-9_-]*:|\\npermissions:)`));
  return match?.[1] || "";
}

function stepBlock(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = workflow.match(new RegExp(`      - name: ${escaped}\\n([\\s\\S]*?)(?=\\n      - name:|\\n      - uses:|$)`));
  return match?.[1] || "";
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function jsonAt(commit, file) {
  return JSON.parse(git(["show", `${commit}:${file}`]));
}

test("CI-01 canonical QA remains a pull-request target", () => {
  assert.match(triggerBlock("pull_request"), new RegExp(`^\\s*- ${qaBranch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m"));
});

test("CI-02 canonical QA remains a push validation target", () => {
  assert.match(triggerBlock("push"), new RegExp(`^\\s*- ${qaBranch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m"));
});

test("CI-03 pull-request Engineering QA checks out and records the exact PR head SHA", () => {
  const checkout = stepBlock("Clean checkout of exact validation commit");
  const record = stepBlock("Record exact validation commit");
  assert.match(checkout, /ref:\s*\$\{\{[^\n]*github\.event\.pull_request\.head\.sha/);
  assert.match(record, /expected_sha="\$\{\{[^\n]*github\.event\.pull_request\.head\.sha/);
  assert.match(record, /test "\$validated_sha" = "\$\(git rev-parse "\$expected_sha\^\{commit\}"\)"/);
});

test("CI-04 artifact evidence retention stays non-blocking while core engineering steps stay blocking", () => {
  const artifact = stepBlock("Upload exact-SHA engineering QA artifacts");
  assert.match(artifact, /continue-on-error:\s*true/);
  for (const name of [
    "Regenerate canonical production runtime",
    "Canonical validation and existing tests",
    "Canonical verified production build",
    "Install isolated Chromium browser runtime",
    "Start production-like static server",
    "Run R159 responsive runtime and interaction certification",
  ]) {
    assert.doesNotMatch(stepBlock(name), /continue-on-error:\s*true/, `${name} must remain blocking`);
  }
});

test("SSOT-01/02 contentVersion exists and Content/Asset Manifest identity stays aligned", () => {
  assert.equal(typeof content.contentVersion, "string");
  assert.ok(content.contentVersion.trim().length > 0);
  assert.equal(manifest.contentVersion, content.contentVersion);
});

test("SSOT-03 runtime and asset governance do not pin one historical content revision", () => {
  const historicalPin = /contentVersion\s*===?\s*["']20\d{2}-\d{2}-\d{2}-r[^"']+["']/;
  assert.doesNotMatch(builder, historicalPin);
  assert.doesNotMatch(assetGovernance, historicalPin);
});

test("active-asset ProjectCard QA derives expectations from current runtime asset state", () => {
  assert.match(browserQa, /assetStatus:frame\?\.dataset\.assetStatus/);
  assert.match(browserQa, /x\.assetStatus==="real-active"&&x\.naturalRatio/);
  assert.doesNotMatch(browserQa, /Placeholder ProjectCard semantic ratio failed/);
});

test("SSOT-05/06 PR commits keep public project assets and version revisions atomic", { skip: !process.env.GITHUB_BASE_REF }, () => {
  const remoteBase = `origin/${process.env.GITHUB_BASE_REF}`;
  const mergeBase = git(["merge-base", "HEAD", remoteBase]);
  const commits = git(["rev-list", "--reverse", `${mergeBase}..HEAD`]).split("\n").filter(Boolean);
  for (const commit of commits) {
    const parent = git(["rev-parse", `${commit}^`]);
    const changed = new Set(git(["diff-tree", "--no-commit-id", "--name-only", "-r", commit]).split("\n").filter(Boolean));
    const assetChanged = [...changed].some((file) => file.startsWith(assetRoot));
    if (assetChanged) assert.ok(changed.has(manifestPath), `${commit}: public project asset changes require Asset Manifest in the same commit`);

    if (changed.has(contentPath)) {
      const before = jsonAt(parent, contentPath);
      const after = jsonAt(commit, contentPath);
      if (before.contentVersion !== after.contentVersion) {
        assert.ok(changed.has(manifestPath), `${commit}: Content revision change requires Asset Manifest in the same commit`);
        const manifestAtCommit = jsonAt(commit, manifestPath);
        assert.equal(manifestAtCommit.contentVersion, after.contentVersion, `${commit}: Content and Asset Manifest revisions must match`);
      }
    }
  }
});
