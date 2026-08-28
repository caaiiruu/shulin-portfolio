import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const content = JSON.parse(fs.readFileSync("public/site/content/portfolio-content.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("public/site/content/portfolio-asset-manifest.json", "utf8"));

test("R183 preserves Payment as a four-decision 0→1 transaction product", () => {
  const payment = content.projects.payment;
  assert.equal(payment.decisionNarrative.primaryDecisions.length, 4);
  assert.match(payment.at_glance, /0→1/i);
  assert.equal(payment.publicContent.coreSystemInsight.evidence[0].assetId, "payment-core-checkout-compression-approved-v3");
  assert.deepEqual(
    payment.publicContent.decisionEvidence.items.map((item) => item.assetId),
    [
      "payment-evidence-live-checkout-image-only-r1649d",
      "payment-evidence-journey-synthesis-r1649c",
      "payment-sco-research-photo-human-approved-v1",
      "payment-comparative-validation-existing-vs-proposed-v1",
    ],
  );
  assert.deepEqual(payment.publicContent.decisionEvidence.researchInsights.metrics.map((item) => [item.value, item.label.en]), [
    ["87.5%", "Time is money"],
    ["87.5%", "Social pressure"],
    ["87.5%", "Assurance"],
    ["75%", "Rebate awareness"],
    ["37.5%", "Additional value"],
  ]);
  assert.deepEqual(payment.publicContent.decisionEvidence.researchInsights.validationSignals.metrics.map((item) => item.value), ["87.5%", "85.7%"]);
  assert.equal(payment.publicContent.decisionEvidence.validationLayer, undefined);
  assert.deepEqual(payment.publicContent.decisionEvidence.items[2].assetIds, [
    "payment-sco-research-photo-human-approved-v1",
    "payment-live-interview-privacy-safe-v1",
  ]);
  assert.equal(payment.publicContent.decisionEvidence.items[2].presentation, "editorial-pair");
  assert.equal(manifest.items["payment-live-interview-privacy-safe-v1"].derivativeStatus, "privacy-safe-face-blur-v1");
  assert.match(manifest.items["payment-live-interview-privacy-safe-v1"].sourceBoundary, /source is preserved outside the public build/i);
  assert.equal(manifest.items["payment-return-recovery-human-r1649d"].sectionUsage, "decision-03-proof-only");
});

test("R183 classifies Booking Taxi as existing-proposition optimisation, never 0→1", () => {
  const taxi = content.projects["booking-taxi-pickup-service-strategy"];
  assert.equal(taxi.type, "Product Optimisation");
  assert.equal(taxi.infoGrid.type.value, "Product Optimisation");
  assert.notEqual(taxi.type, "Transaction System");
  assert.deepEqual(taxi.problemTypes.en, ["Travel mobility", "Pickup experience", "Proposition optimisation"]);
  assert.doesNotMatch(JSON.stringify(taxi), /0→1|greenfield|new product creation/i);
  assert.equal(content.workIndex.workFilters.find((filter) => filter.id === "zero").projectIds.includes(taxi.id), false);
  assert.deepEqual(taxi.publicContent.strategyEvidence.metrics, []);
  assert.match(taxi.publicContent.outcomes.closing.en, /implementation, launch and experiment results are not verified/i);
});

test("R183.1 preserves Payment as a true 0→1 product and protects the shared Type enum", () => {
  const payment = content.projects.payment;
  assert.equal(payment.type, "0→1 Product");
  assert.equal(payment.infoGrid.type.value, "0→1 Product");
  assert.ok(content.projectHeroContentContract.type.allowedValues.includes("Product Optimisation"));
});

test("R183.1 makes CTBC product-model reasoning the first recruiter Evidence", () => {
  const evidence = content.projects["ctbc-mortgage-self-service-app"].publicContent.decisionEvidence;
  const first = evidence.structuredGroups[0];
  assert.equal(first.id, "product-model-before-screens");
  assert.deepEqual(first.bullets.map(item => item.en), [
    "Entry model — Direct, calculator-led and employee-assisted starts converge into one application.",
    "Application model — Loan information, applicant information, related-party work, terms and confirmation form one staged structure.",
    "Persistent state — Saved progress, known information and resume behaviour return applicants to the relevant state.",
    "Post-submission orchestration — Documents, related-party completion and bank follow-up continue beyond the primary applicant’s submission."
  ]);
  assert.doesNotMatch(JSON.stringify(first), /launch|adoption|conversion|approval rate/i);
});

test("R183 keeps Taishin delivery claims below launch and commercial outcome", () => {
  const taishin = content.projects["taishin-p2p-marketplace-platform"].publicContent;
  assert.deepEqual(taishin.decisionEvidence.claimSafety.unavailable, [
    "production launch",
    "adoption",
    "conversion",
    "revenue",
    "GMV",
    "transaction volume",
    "measured efficiency",
    "exact ownership split",
  ]);
  assert.ok(taishin.outcomes.claimBoundary.some((claim) => /No launch, adoption, conversion, GMV, revenue/i.test(claim)));
});

test("R183 preserves Voucher hypothesis and deferred-phase boundaries", () => {
  const voucher = content.projects.voucher;
  assert.equal(voucher.publicContent.modelEvolution.earlyHypothesis.status, "exploratory-shared-definition");
  assert.equal(voucher.publicContent.modelEvolution.validatedModel.status, "launched-and-used");
  const phaseTwo = content.projects["voucher-center"].productEvolution.flashVoucher2024.phaseEvidence.phase2;
  assert.match(phaseTwo.status, /planned|deferred/i);
  assert.doesNotMatch(phaseTwo.status, /rejected/i);
  const activeVoucherAssets = Object.values(manifest.items).filter((item) => item.projectId === "voucher");
  assert.equal(activeVoucherAssets.some((item) => item.implementationStatus === "placeholder-active"), false);
  assert.equal(activeVoucherAssets.some((item) => item.replacementRequired === true), false);
});

test("R183 keeps Evidence captions attached to their approved visual owners", () => {
  const booking = content.projects.booking.decisionEvidenceMap;
  assert.equal(booking["booking-decision-01"].publicAssetId, "booking-evidence-decision-01-ride-mix-public-01");
  assert.equal(booking["booking-decision-02"].publicAssetId, "booking-evidence-decision-02-hotjar-edit-trip-01");
  assert.equal(booking["booking-decision-03"].publicAssetId, "booking-evidence-decision-03-baggage-language-01");
  const taxi = content.projects["booking-taxi-pickup-service-strategy"].publicContent.strategyEvidence.structuredGroups;
  assert.equal(taxi.find((item) => item.id === "proposition-definition").assetId, "booking-taxi-strategy-proposition-comparison-public-v1");
  assert.equal(taxi.find((item) => item.id === "phase-one-recommendation").assetId, "booking-taxi-strategy-experiment-risk-framing-public-v1");
});
