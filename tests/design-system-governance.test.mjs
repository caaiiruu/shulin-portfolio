import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const registry = JSON.parse(fs.readFileSync("public/site/docs/design-system/registry.json", "utf8"));
const tokens = fs.readFileSync("public/site/assets/css/tokens.css", "utf8");
const projectCard = fs.readFileSync("public/site/assets/css/components/project-card.css", "utf8");
const overview = fs.readFileSync("public/site/assets/css/components/project-detail-overview.css", "utf8");
const navigator = fs.readFileSync("public/site/assets/css/components/domain-selector.css", "utf8");
const app = fs.readFileSync("public/site/assets/js/app.js", "utf8");

test("registry maps canonical components through variants to discoverable consumers and regressions", () => {
  const graph = registry.governanceGraph;
  assert.equal(graph.consumerDiscoveryOwner, "qa/design-system-impact.mjs");
  for (const name of ["ProjectCard", "ProjectDetailOverview", "InfoGrid", "Decision", "OutcomeMetric", "FloatingNavigator"]) {
    const contract = graph.componentContracts[name];
    assert.ok(contract.cssOwner);
    assert.ok(contract.variants.length);
    assert.deepEqual(Object.keys(contract.variantConsumers).sort(), [...contract.variants].sort());
    assert.ok(contract.consumerGroups.length);
    assert.ok(contract.regressionProfiles.length);
    assert.ok(contract.regressionContracts.length);
  }
});

test("component-intent tokens have one registered owner and a primitive trace", () => {
  const graph = registry.governanceGraph;
  const ownership = new Map();
  for (const [name, contract] of Object.entries(graph.componentContracts)) {
    for (const token of contract.componentIntentTokens) {
      assert.equal(ownership.has(token), false, `${token} has duplicate ownership`);
      ownership.set(token, name);
      assert.equal(graph.tokenContracts[token].owner, name);
      assert.match(tokens, new RegExp(`--${token}: var\\(--${graph.tokenContracts[token].primitive}\\)`));
    }
  }
});

test("consumer, regression, and golden references resolve to registered contracts", () => {
  const graph = registry.governanceGraph;
  for (const contract of Object.values(graph.componentContracts)) {
    contract.consumerGroups.forEach((name) => assert.ok(graph.consumerGroups[name], `unknown consumer ${name}`));
    Object.values(contract.variantConsumers).flat().forEach((name) => assert.ok(graph.consumerGroups[name], `unknown variant consumer ${name}`));
    contract.regressionProfiles.forEach((name) => assert.ok(graph.regressionProfiles[name], `unknown regression ${name}`));
    contract.regressionContracts.forEach((file) => assert.equal(fs.existsSync(file), true, `missing regression ${file}`));
  }
  graph.goldenConsumers.projectCards.forEach(({variant}) => assert.ok(graph.componentContracts.ProjectCard.variants.includes(variant)));
  assert.deepEqual(graph.componentContracts.Decision.optionalContentBlocks, ["CONSTRAINT MANAGED", "TRADE-OFF ACCEPTED", "WHAT THIS REQUIRED"]);
});

test("impact validation rejects broken graph references and duplicate intent ownership", () => {
  const cases = [
    ["unknown consumer group", graph => { graph.componentContracts.ProjectCard.variantConsumers.Primary = ["missingSurface"]; }],
    ["unknown regression profile", graph => { graph.componentContracts.ProjectCard.regressionProfiles = ["missingProfile"]; }],
    ["missing regression contract", graph => { graph.componentContracts.ProjectCard.regressionContracts = ["tests/missing-regression.mjs"]; }],
    ["duplicate component-intent ownership", graph => {
      graph.componentContracts.InfoGrid.componentIntentTokens.push("project-card-body-gap");
      graph.componentContracts.InfoGrid.tokenDependencies.push("project-card-body-gap");
      graph.tokenContracts["project-card-body-gap"].owner = "InfoGrid";
    }],
    ["unknown ProjectCard variant", graph => { graph.goldenConsumers.projectCards[0].variant = "Project slug"; }]
  ];
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "design-system-impact-"));
  try {
    for (const [label, mutate] of cases) {
      const copy = structuredClone(registry);
      mutate(copy.governanceGraph);
      const registryPath = path.join(directory, `${label.replaceAll(" ", "-")}.json`);
      fs.writeFileSync(registryPath, JSON.stringify(copy));
      const result = spawnSync(process.execPath, ["public/site/qa/design-system-impact.mjs"], {
        cwd: process.cwd(),
        env: {...process.env, DESIGN_SYSTEM_REGISTRY_PATH: registryPath},
        encoding: "utf8"
      });
      assert.notEqual(result.status, 0, `${label} should fail governance validation`);
    }
  } finally {
    fs.rmSync(directory, {recursive: true, force: true});
  }
});

test("stable Human-approved geometry uses component-intent tokens without changing values", () => {
  for (const token of ["project-card-body-gap", "project-card-cta-gap", "info-grid-cell-gap", "decision-card-gap", "decision-card-padding-block", "outcome-metric-gap", "floating-nav-shell-inset", "floating-nav-rail-gap"]) {
    assert.match(tokens, new RegExp(`--${token}:`));
  }
  assert.match(projectCard, /margin-top:var\(--project-card-body-gap\)/);
  assert.match(projectCard, /padding-top:var\(--project-card-cta-gap\)/);
  assert.match(overview, /gap:var\(--info-grid-cell-gap\)/);
  assert.match(overview, /gap:var\(--decision-card-gap\)/);
  assert.match(overview, /row-gap:var\(--outcome-metric-gap\)/);
  assert.match(navigator, /bottom:calc\(var\(--floating-nav-shell-inset\)/);
});

test("golden consumers cover every registered structural variant at approved viewports", () => {
  const golden = registry.governanceGraph.goldenConsumers;
  assert.deepEqual(golden.viewports, [1419, 871, 430]);
  assert.equal(golden.primaryProjectDetail.projectId, "payment");
  assert.ok(golden.projectCards.some((item) => item.variant === "Primary"));
  assert.ok(golden.projectCards.some((item) => item.variant === "Experiment"));
  assert.ok(golden.projectCards.some((item) => item.variant === "Related"));
});

test("recruiter-first overview governs decision-filter order and lead visual media", () => {
  const contract = registry.governanceGraph.componentContracts.ProjectDetailOverview;
  assert.deepEqual(contract.compositionOrder, ["Project context / title", "At a Glance + Info Grid", "Lead Project Visual when approved real media exists", "Complexity / remaining case content"]);
  assert.deepEqual(contract.mediaVariants["Lead Project Visual"], {
    aspectRatio: "16:9",
    fit: "contain",
    placeholderPolicy: "pending or placeholder media does not render in recruiter-facing Primary details",
    consumerGroups: ["primaryDetails"]
  });
  assert.match(overview, /quick-view-v51--project\{grid-template-columns:minmax\(0,7fr\) minmax\(var\(--dimension-280px\),5fr\)/);
  assert.match(overview, /project-detail-hero-visual\{[^}]*aspect-ratio:16\/9/);
  assert.match(overview, /project-detail-hero-visual\{[^}]*margin:0 auto/);
  assert.match(overview, /project-detail-hero-visual img\{[^}]*object-fit:contain/);
  assert.match(overview, /@media\(max-width:900px\)\{\.quick-view-v51--project\{grid-template-columns:1fr\}/);
  assert.match(overview, /@media\(max-width:600px\)\{\.modal-content-v45[\s\S]*?\.detail-commerce-v45\{[^}]*margin-bottom:var\(--space-5\)/);
  assert.match(app, /if\(heroAsset&&!heroAsset\.isPlaceholder\)/);
});
