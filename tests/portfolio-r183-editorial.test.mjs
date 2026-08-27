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
      "payment-evidence-sco-entry-public-v2",
      "payment-return-recovery-human-r1649d",
    ],
  );
});

test("R183 classifies Booking Taxi as existing-proposition optimisation, never 0→1", () => {
  const taxi = content.projects["booking-taxi-pickup-service-strategy"];
  assert.equal(taxi.type, "Transaction System");
  assert.equal(taxi.infoGrid.type.value, "Transaction System");
  assert.doesNotMatch(JSON.stringify(taxi), /0→1|greenfield|new product creation/i);
  assert.equal(content.workIndex.workFilters.find((filter) => filter.id === "zero").projectIds.includes(taxi.id), false);
  assert.deepEqual(taxi.publicContent.strategyEvidence.metrics, []);
  assert.match(taxi.publicContent.outcomes.closing.en, /implementation, launch and experiment results are not verified/i);
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
