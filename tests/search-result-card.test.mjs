import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), "utf8");
const content = JSON.parse(read("public/site/content/portfolio-content.json"));

const projections = {
  voucher: { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "outcome", index: 2 }, intentSignals: { "improve-product-discovery": { source: "outcome", index: 1 }, "build-measurement-and-monitoring": { source: "outcome", index: 0 } } },
  "voucher-center": { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "outcome", index: 1 } },
  "game-center": { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "completionEvidence" } },
  dbs: { ownershipEnd: { en: ", working with", zh: "；" }, defaultSignal: { source: "outcome", index: 1 }, intentSignals: { "align-stakeholders-and-operations": { source: "ownership" }, "build-measurement-and-monitoring": { source: "outcome", index: 0 } } },
  booking: { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "outcome", index: 1 }, intentSignals: { "improve-product-discovery": { source: "outcome", index: 3 } } },
  bandzo: { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "outcome", index: 0 }, intentSignals: { "improve-product-discovery": { source: "outcome", index: 1 } } },
  "taishin-p2p-marketplace-platform": { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "outcome", index: 0 }, intentSignals: { "align-stakeholders-and-operations": { source: "ownership" } } },
  "cathay-mortgage-assistant": { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "outcome", index: 0 }, intentSignals: { "align-stakeholders-and-operations": { source: "ownership" } } },
  payment: { ownershipEnd: { en: ". Voucher integration", zh: "。優惠券整合" }, defaultSignal: { source: "outcome", index: 1 }, intentSignals: { "launch-zero-to-one-product": { source: "outcome", index: 3 }, "align-stakeholders-and-operations": { source: "ownership" } } },
  "cathay-sit-online-account-opening": { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "outcome", index: 0 }, intentSignals: { "align-stakeholders-and-operations": { source: "ownership" } } },
  "cathay-sit-review-remediation-operations": { ownershipEnd: { en: ";", zh: "；" }, defaultSignal: { source: "outcome", index: 1 }, intentSignals: { "reduce-operational-friction": { source: "outcome", index: 0 }, "build-measurement-and-monitoring": { source: "outcome", index: 0 }, "align-stakeholders-and-operations": { source: "ownership" } } },
  "ctbc-mortgage-self-service-app": { defaultSignal: { source: "outcome", index: 0 } },
  "booking-taxi-pickup-service-strategy": { ownershipEnd: { en: ", working with", zh: "，並與" }, defaultSignal: { source: "outcome", index: 0 } },
};

function projectApprovedCardSignal(id, language, intentId) {
  const project = content.projects[id];
  const contract = projections[id];
  const signal = contract.intentSignals?.[intentId] || contract.defaultSignal;
  if (signal.source === "ownership") {
    const source = project.ownershipModel.publicSummary[language];
    const boundary = contract.ownershipEnd?.[language];
    const index = boundary ? source.indexOf(boundary) : -1;
    if (boundary) assert.notEqual(index, -1, `${id} ${language} ownership boundary`);
    const value = boundary ? source.slice(0, index).trim() : source.trim();
    assert.ok(source.startsWith(value), `${id} ${language} ownership must be verbatim`);
    return { kind: "ownership", value };
  }
  if (signal.source === "completionEvidence") {
    const source = project.publicContent.completionEvidence;
    return { kind: "evidence", value: `${source.publicValue} ${source.label[language]}` };
  }
  const source = project.outcomeEvidenceModel[signal.index];
  assert.match(source.publicUse, /^approved/, `${id} signal must remain Human-approved`);
  return { kind: "evidence", value: source.claim[language] };
}

test("Search Result Card has an explicit approved default for every canonical project", () => {
  assert.deepEqual(Object.keys(projections).sort(), Object.keys(content.projects).sort());
  for (const id of Object.keys(projections)) for (const language of ["en", "zh"]) assert.ok(projectApprovedCardSignal(id, language).value);
});

test("query intents select exactly one deterministic project-specific signal", () => {
  assert.equal(projectApprovedCardSignal("dbs", "en", "align-stakeholders-and-operations").kind, "ownership");
  assert.match(projectApprovedCardSignal("dbs", "en", "build-measurement-and-monitoring").value, /prototype tests/);
  assert.match(projectApprovedCardSignal("voucher", "en", "improve-product-discovery").value, /products and categories/);
  assert.match(projectApprovedCardSignal("payment", "en", "launch-zero-to-one-product").value, /190 stores/);
  assert.match(projectApprovedCardSignal("bandzo", "en", "improve-product-discovery").value, /Eight interview/);
});

test("Search Result Card renderer fails closed and exposes only one signal", () => {
  const app = read("public/site/assets/js/app.js");
  const home = read("public/site/assets/js/home.js");
  assert.match(app, /const SEARCH_RESULT_PROJECT_PROJECTIONS=\{/);
  assert.match(app, /approved ownership boundary changed/);
  assert.match(app, /approved signal source changed/);
  assert.match(app, /dataset\.searchCardProjection='approved'/);
  assert.match(app, /element\('h4','related-project-card__title'/);
  assert.match(app, /search-result-card__signal search-result-card__signal--\$\{projection\.kind\}/);
  assert.doesNotMatch(app, /search-result-card__ownership|search-result-card__proof/);
  assert.doesNotMatch(app, /reasons\.map\(reason=>reason\.label\)\.join/);
  assert.match(home, /window\.searchResultCardProjection\?\.\(key\)/);
});

test("Search Result Card CSS is compact, image-free and arrow-led", () => {
  const css = read("public/site/assets/css/components/project-card.css");
  assert.match(css, /\.related-project-card--search\{[^}]*align-self:stretch;[^}]*height:100%;[^}]*grid-template-rows:auto auto minmax\(0,1fr\)/);
  assert.match(css, /@media\(max-width:600px\)\{\.related-project-card--search\{[^}]*align-self:start;[^}]*height:auto;[^}]*grid-template-rows:auto auto auto/);
  assert.match(css, /\.related-project-card--search \.search-result-card__signal\{[^}]*border-top:[^}]*font-weight:var\(--sys-weight-bold\)/);
  assert.match(css, /\.related-project-card--search \.related-project-card__action\{[^}]*align-self:end;[^}]*justify-self:end/);
  assert.match(css, /\.related-project-card--search \.company-separator-v159\{[^}]*margin-inline:var\(--space-1\)/);
  assert.match(css, /\.related-project-card--search \.company-context-v132\{[^}]*text-transform:none/);
  assert.match(css, /\.related-project-card--search \.related-project-card__top-v45\{[^}]*flex-wrap:wrap;[^}]*text-align:left/);
  assert.match(css, /\.related-project-card--search \.related-project-card__context-group\{[^}]*display:inline-flex/);
  assert.doesNotMatch(css, /\.related-project-card--search[^}]*aspect-ratio/);
});

test("global Search remediation preserves a labelled native input and approved empty state", () => {
  const app = read("public/site/assets/js/app.js");
  assert.doesNotMatch(app, /const intro=element\('p','global-search-v114__intro'/);
  assert.match(app, /label\.htmlFor='globalSearchInput'/);
  assert.match(app, /Search by company, domain, product problem, or design challenge/);
  assert.doesNotMatch(app, /addEventListener\('focus'.*placeholder/);
  assert.match(app, /Can’t find what you’re looking for\?/);
  assert.match(app, /If you’re hiring for a product or system problem that isn’t represented here, feel free to get in touch\./);
  assert.match(app, /element\('a','button button--dark'.*Contact me/);
  assert.match(app, /mailto:r\.c\.shulin@gmail\.com\?subject=Product%20design%20inquiry/);
});

test("global Search exposes exactly eight industry-common shortcuts through certified query phrases", () => {
  const app = read("public/site/assets/js/app.js");
  const block = app.match(/const SEARCH_RECOMMENDED_QUERIES=\[([\s\S]*?)\n    \];/)?.[1] || "";
  for (const label of [
    "0→1 Product Design",
    "Payment Experience",
    "Operational Workflows",
    "Internal Tools",
    "Exception Handling",
    "Onboarding Flows",
    "Cross-Market Products",
    "Product Strategy",
  ]) assert.ok(block.includes(label), label);
  assert.equal((block.match(/\{label:/g) || []).length, 8);
  assert.match(app, /SEARCH_RECOMMENDED_QUERIES\.forEach/);
});

test("Search applies only the approved Cathay public company display projection", () => {
  const app = read("public/site/assets/js/app.js");
  const block = app.match(/const SEARCH_PROJECT_COMPANY_DISPLAY=\{([\s\S]*?)\n    \};/)?.[1] || "";
  assert.match(block, /'cathay-sit-online-account-opening':\{en:'國泰投信',zh:'國泰投信'\}/);
  assert.match(block, /'cathay-sit-review-remediation-operations':\{en:'國泰投信',zh:'國泰投信'\}/);
  assert.equal((block.match(/國泰投信/g) || []).length, 4);
});

export { projectApprovedCardSignal, projections };
