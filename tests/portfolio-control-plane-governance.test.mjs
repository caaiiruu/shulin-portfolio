import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const qaBranch = "qa/r146-r43-preview-2026-08-06";
const workflowPath = ".github/workflows/release-gate-r146-r43.yml";
const registryPath = "docs/portfolio-skill/registry.json";
const contentPath = "public/site/content/portfolio-content.json";
const manifestPath = "public/site/content/portfolio-asset-manifest.json";
const assetRoot = "public/site/assets/projects/";
const gitTextHeadroomBytes = 1024 * 1024;

const workflow = fs.readFileSync(workflowPath, "utf8");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const builder = fs.readFileSync("scripts/build-production-assets.mjs", "utf8");
const assetGovernance = fs.readFileSync("public/site/qa/asset-governance.mjs", "utf8");
const browserQa = fs.readFileSync("tests/portfolio-browser-qa.mjs", "utf8");
const ssotAtomicityEnforcedFrom = registry.ssotGovernance?.ssotAtomicityEnforcedFrom;

function triggerBlock(name) {
  const match = workflow.match(new RegExp(`(?:^|\\n)  ${name}:\\n([\\s\\S]*?)(?=\\n  [A-Za-z_][A-Za-z0-9_-]*:|\\npermissions:)`));
  return match?.[1] || "";
}

function stepBlock(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = workflow.match(new RegExp(`      - name: ${escaped}\\n([\\s\\S]*?)(?=\\n      - name:|\\n      - uses:|$)`));
  return match?.[1] || "";
}

function git(args, options = {}) {
  return execFileSync("git", args, { encoding: "utf8", ...options }).trim();
}

function gitIsAncestor(ancestor, descendant, cwd = process.cwd()) {
  const result = spawnSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], { cwd });
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new Error(`Unable to compare Git ancestry: ${ancestor} -> ${descendant}`);
}

function gitBlobSize(spec, cwd = process.cwd()) {
  const value = Number(git(["cat-file", "-s", spec], { cwd }));
  assert.ok(Number.isSafeInteger(value) && value >= 0, `Invalid Git blob size for ${spec}: ${value}`);
  return value;
}

function gitTextObject(spec, cwd = process.cwd()) {
  const blobSize = gitBlobSize(spec, cwd);
  return execFileSync("git", ["show", spec], {
    cwd,
    encoding: "utf8",
    maxBuffer: blobSize + gitTextHeadroomBytes,
  });
}

function textAt(commit, file, cwd = process.cwd()) {
  return gitTextObject(`${commit}:${file}`, cwd);
}

function jsonAt(commit, file, cwd = process.cwd()) {
  return JSON.parse(textAt(commit, file, cwd));
}

function changedFiles(commit, cwd = process.cwd()) {
  return new Set(git(["diff-tree", "--no-commit-id", "--name-only", "-r", commit], { cwd }).split("\n").filter(Boolean));
}

function validateAtomicCommit(commit, cwd = process.cwd()) {
  const parent = git(["rev-parse", `${commit}^`], { cwd });
  const changed = changedFiles(commit, cwd);
  const assetChanged = [...changed].some((file) => file.startsWith(assetRoot));
  if (assetChanged) assert.ok(changed.has(manifestPath), `${commit}: public project asset changes require Asset Manifest in the same commit`);

  if (changed.has(contentPath)) {
    const before = jsonAt(parent, contentPath, cwd);
    const after = jsonAt(commit, contentPath, cwd);
    if (before.contentVersion !== after.contentVersion) {
      assert.ok(changed.has(manifestPath), `${commit}: Content revision change requires Asset Manifest in the same commit`);
      const manifestAtCommit = jsonAt(commit, manifestPath, cwd);
      assert.equal(manifestAtCommit.contentVersion, after.contentVersion, `${commit}: Content and Asset Manifest revisions must match`);
    }
  }
}

function governedCommits({ head, comparisonBase, activationCommit, cwd = process.cwd() }) {
  assert.match(activationCommit || "", /^[0-9a-f]{40}$/i, "SSOT atomicity activation boundary must be a full Git commit SHA");
  git(["cat-file", "-e", `${activationCommit}^{commit}`], { cwd });
  const mergeBase = git(["merge-base", head, comparisonBase], { cwd });
  const commits = git(["rev-list", "--reverse", `${mergeBase}..${head}`], { cwd }).split("\n").filter(Boolean);
  const headIncludesActivation = gitIsAncestor(activationCommit, head, cwd);
  const comparisonIncludesActivation = gitIsAncestor(activationCommit, comparisonBase, cwd);

  assert.ok(
    headIncludesActivation || comparisonIncludesActivation,
    "SSOT atomicity activation boundary must be reachable from the current governed history",
  );

  if (!headIncludesActivation) return commits;
  return commits.filter((commit) => gitIsAncestor(activationCommit, commit, cwd));
}

function currentComparisonBase() {
  if (process.env.GITHUB_BASE_REF) return `origin/${process.env.GITHUB_BASE_REF}`;
  if (!process.env.GITHUB_EVENT_PATH || !fs.existsSync(process.env.GITHUB_EVENT_PATH)) return null;
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  if (typeof event.before === "string" && /^[0-9a-f]{40}$/i.test(event.before) && !/^0+$/.test(event.before)) return event.before;
  return null;
}

function createAtomicityFixture() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-ssot-boundary-"));
  git(["init"], { cwd });
  git(["config", "user.email", "qa@example.test"], { cwd });
  git(["config", "user.name", "Portfolio QA"], { cwd });
  fs.mkdirSync(path.join(cwd, path.dirname(contentPath)), { recursive: true });
  fs.mkdirSync(path.join(cwd, assetRoot), { recursive: true });
  const writeVersion = (contentVersion, manifestVersion = contentVersion) => {
    fs.writeFileSync(path.join(cwd, contentPath), `${JSON.stringify({ contentVersion }, null, 2)}\n`);
    fs.writeFileSync(path.join(cwd, manifestPath), `${JSON.stringify({ contentVersion: manifestVersion }, null, 2)}\n`);
  };
  const commitAll = (message) => {
    git(["add", "."], { cwd });
    git(["commit", "-m", message], { cwd });
    return git(["rev-parse", "HEAD"], { cwd });
  };

  writeVersion("legacy-0");
  const root = commitAll("root");
  fs.writeFileSync(path.join(cwd, contentPath), `${JSON.stringify({ contentVersion: "legacy-1" }, null, 2)}\n`);
  const legacyViolation = commitAll("legacy content-only revision");
  git(["commit", "--allow-empty", "-m", "activate atomicity governance"], { cwd });
  const activation = git(["rev-parse", "HEAD"], { cwd });

  fs.writeFileSync(path.join(cwd, contentPath), `${JSON.stringify({ contentVersion: "invalid-2" }, null, 2)}\n`);
  const invalid = commitAll("post-activation invalid content-only revision");

  git(["checkout", "-b", "valid", activation], { cwd });
  writeVersion("valid-2");
  const valid = commitAll("post-activation valid atomic revision");

  return { cwd, root, legacyViolation, activation, invalid, valid };
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

test("historical Git blob reader handles output beyond Node's default subprocess buffer", () => {
  const payload = "x".repeat(1024 * 1024 + 128 * 1024);
  const blob = execFileSync("git", ["hash-object", "-w", "--stdin"], {
    input: payload,
    encoding: "utf8",
  }).trim();
  assert.equal(gitBlobSize(blob), Buffer.byteLength(payload, "utf8"));
  assert.equal(gitTextObject(blob), payload);
});

test("SSOT atomicity boundary excludes legacy violations but keeps post-activation commits governed", () => {
  const fixture = createAtomicityFixture();
  try {
    const commits = governedCommits({
      head: fixture.valid,
      comparisonBase: fixture.root,
      activationCommit: fixture.activation,
      cwd: fixture.cwd,
    });
    assert.ok(!commits.includes(fixture.legacyViolation));
    assert.ok(commits.includes(fixture.activation));
    assert.ok(commits.includes(fixture.valid));
  } finally {
    fs.rmSync(fixture.cwd, { recursive: true, force: true });
  }
});

test("SSOT atomicity boundary rejects a post-activation Content revision without Manifest alignment", () => {
  const fixture = createAtomicityFixture();
  try {
    assert.throws(
      () => validateAtomicCommit(fixture.invalid, fixture.cwd),
      /Content revision change requires Asset Manifest in the same commit/,
    );
  } finally {
    fs.rmSync(fixture.cwd, { recursive: true, force: true });
  }
});

test("SSOT atomicity boundary accepts a post-activation aligned Content and Manifest revision", () => {
  const fixture = createAtomicityFixture();
  try {
    assert.doesNotThrow(() => validateAtomicCommit(fixture.valid, fixture.cwd));
  } finally {
    fs.rmSync(fixture.cwd, { recursive: true, force: true });
  }
});

const comparisonBase = currentComparisonBase();
test("SSOT-05/06 governed commits keep public project assets and version revisions atomic", { skip: !comparisonBase }, () => {
  const commits = governedCommits({
    head: "HEAD",
    comparisonBase,
    activationCommit: ssotAtomicityEnforcedFrom,
  });
  for (const commit of commits) validateAtomicCommit(commit);
});
