import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { validateAutomation } from "../scripts/portfolio-automation.mjs";

const truth = JSON.parse(fs.readFileSync("docs/portfolio-automation/verified-project-truth.json", "utf8"));
const ledger = JSON.parse(fs.readFileSync("docs/portfolio-automation/execution-ledger.json", "utf8"));
const content = JSON.parse(fs.readFileSync("public/site/content/portfolio-content.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("public/site/content/portfolio-asset-manifest.json", "utf8"));
const clone = (value) => structuredClone(value);
const errorsFor = (nextTruth = truth, nextLedger = ledger, options = {}) => validateAutomation({
  truth: nextTruth,
  ledger: nextLedger,
  content,
  manifest,
  ...options,
});
const expectError = (errors, pattern) => assert.ok(errors.some((error) => pattern.test(error)), errors.join("\n"));

test("R179 all-project truth bootstrap is valid", () => assert.deepEqual(errorsFor(), []));

test("all canonical projects have exactly one source pack", () => {
  assert.equal(truth.projects.length, 13);
  assert.equal(truth.projectSourcePacks.length, 13);
  assert.deepEqual(new Set(truth.projectSourcePacks.map((pack) => pack.projectId)), new Set(Object.keys(content.projects)));
});

test("source packs reject invalid fact and source references", () => {
  const next = clone(truth);
  next.projectSourcePacks[0].factIds.push("FACT-UNKNOWN");
  next.projectSourcePacks[0].sourceIds.push("SRC-UNKNOWN");
  const errors = errorsFor(next);
  expectError(errors, /invalid source-pack fact/);
  expectError(errors, /invalid source-pack source/);
});

test("source packs reject unresolved Content SSOT paths", () => {
  const next = clone(truth);
  next.projectSourcePacks[0].existingPublicClaims.push(`projects.${next.projectSourcePacks[0].projectId}.notARealField`);
  expectError(errorsFor(next), /invalid public claim reference/);
});

test("asset requests resolve only canonical manifest IDs", () => {
  const next = clone(truth);
  next.assetRequests[0].assetIds.push("asset-not-in-manifest");
  expectError(errorsFor(next), /invalid asset manifest reference/);
});

test("required asset requests cannot silently avoid Human intake", () => {
  const next = clone(truth);
  next.assetRequests.find((request) => request.requirement === "REQUIRED").humanUploadRequired = false;
  expectError(errorsFor(next), /must require Human upload/);
});

test("model inference cannot become APPROVED", () => {
  const next = clone(truth);
  next.facts[0].provenance.producer = "MODEL_INFERENCE";
  expectError(errorsFor(next), /model inference cannot become APPROVED/);
});

test("lower-precedence evidence cannot replace Human-approved truth", () => {
  const next = clone(truth);
  const protectedFact = next.facts.find((fact) => fact.provenance?.producer === "HUMAN_APPROVED");
  next.facts.push({ ...clone(protectedFact), factId: "FACT-LOWER", provenance: { producer: "GOVERNED_SOURCE", precedence: 5 }, supersedes: [protectedFact.factId] });
  expectError(errorsFor(next), /lower-precedence evidence cannot replace Human-approved truth/);
});

test("conflicting approved high-confidence facts require HUMAN_REQUIRED", () => {
  const next = clone(truth);
  next.facts.push({ ...clone(next.facts[0]), factId: "FACT-CONFLICTING", value: "different" });
  next.conflicts.push({ conflictId: "CONFLICT-1", factIds: [next.facts[0].factId, "FACT-CONFLICTING"], resolutionState: "OPEN" });
  expectError(errorsFor(next), /must become HUMAN_REQUIRED/);
});

test("invalid lifecycle transition fails", () => {
  const next = clone(truth);
  next.lifecycleHistory[0].from = "REJECTED";
  expectError(errorsFor(next), /invalid lifecycle transition REJECTED>SUPERSEDED/);
});

test("unapproved delta cannot enter IMPLEMENTATION", () => {
  const next = clone(ledger);
  next.approvedDeltas[0].status = "DRAFT";
  expectError(errorsFor(truth, next), /delta is not Human-approved|unapproved delta/);
});

test("HEAD mismatch creates HEAD_MOVED and blocks execution", () => {
  const errors = errorsFor(truth, ledger, { workOrderId: "WO-R176-PILOT", observedHead: "0000000000000000000000000000000000000000" });
  expectError(errors, /HEAD_MOVED/);
});

test("forbidden path fails", () => {
  const next = clone(ledger);
  next.approvedDeltas[0].operations[0].path = "public/site/content/portfolio-content.json";
  next.workOrders[0].allowedPaths.push("public/site/content/**");
  expectError(errorsFor(truth, next), /forbidden path/);
});

test("Work cannot claim an applied delta absent from its Work Order", () => {
  const next = clone(ledger);
  next.executionRuns[0].appliedDeltaIds.push("DELTA-NOT-IN-WORK-ORDER");
  expectError(errorsFor(truth, next), /is not present in Work Order/);
});

test("IMPLEMENTATION cannot transition directly to MERGE_READY", () => {
  const next = clone(ledger);
  next.executionRuns[0].stateHistory = ["IMPLEMENTATION", "MERGE_READY"];
  expectError(errorsFor(truth, next), /invalid state transition IMPLEMENTATION>MERGE_READY/);
});

test("SECURITY_BLOCKER cannot transition directly to MERGE_READY", () => {
  const next = clone(ledger);
  next.executionRuns[0].stateHistory = ["SECURITY_BLOCKER", "MERGE_READY"];
  expectError(errorsFor(truth, next), /invalid state transition SECURITY_BLOCKER>MERGE_READY/);
});

test("implementation report cannot claim a delta absent from the run", () => {
  const next = clone(ledger);
  next.implementationReports[0].appliedDeltaIds.push("DELTA-NOT-IN-RUN");
  expectError(errorsFor(truth, next), /claimed applied delta .* is absent from run/);
});
