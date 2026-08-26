import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const registry = JSON.parse(fs.readFileSync("public/site/docs/design-system/registry.json", "utf8"));
const tokens = fs.readFileSync("public/site/assets/css/tokens.css", "utf8");
const projectCard = fs.readFileSync("public/site/assets/css/components/project-card.css", "utf8");
const overview = fs.readFileSync("public/site/assets/css/components/project-detail-overview.css", "utf8");
const navigator = fs.readFileSync("public/site/assets/css/components/domain-selector.css", "utf8");

test("registry maps canonical components through variants to discoverable consumers and regressions", () => {
  const graph = registry.governanceGraph;
  assert.equal(graph.consumerDiscoveryOwner, "qa/design-system-impact.mjs");
  for (const name of ["ProjectCard", "InfoGrid", "Decision", "OutcomeMetric", "FloatingNavigator"]) {
    const contract = graph.componentContracts[name];
    assert.ok(contract.cssOwner);
    assert.ok(contract.variants.length);
    assert.ok(contract.consumerGroups.length);
    assert.ok(contract.regressionContracts.length);
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
