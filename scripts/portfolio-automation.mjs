#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const truthPath = "docs/portfolio-automation/verified-project-truth.json";
const ledgerPath = "docs/portfolio-automation/execution-ledger.json";
const contentPath = "public/site/content/portfolio-content.json";
const manifestPath = "public/site/content/portfolio-asset-manifest.json";
const lifecycle = new Set(["UNVERIFIED_CANDIDATE", "APPROVED", "SUPERSEDED", "REJECTED", "HUMAN_REQUIRED"]);
const boundaries = new Set(["SHIPPED", "VALIDATED", "RECOMMENDED", "CONCEPTUAL", "UNKNOWN"]);
const differences = new Set(["MATCH", "NORMALIZATION_REQUIRED", "PUBLIC_COPY_REVIEW", "SOURCE_CONFLICT", "MISSING_EVIDENCE"]);
const safetyStates = new Set(["PUBLIC_SAFE", "RESTRICTED", "PROHIBITED_RAW_EVIDENCE", "HUMAN_REVIEW_REQUIRED"]);
const lifecycleTransitions = new Set([
  "UNVERIFIED_CANDIDATE>APPROVED", "UNVERIFIED_CANDIDATE>SUPERSEDED", "UNVERIFIED_CANDIDATE>REJECTED", "UNVERIFIED_CANDIDATE>HUMAN_REQUIRED",
  "APPROVED>SUPERSEDED", "APPROVED>HUMAN_REQUIRED", "HUMAN_REQUIRED>APPROVED", "HUMAN_REQUIRED>REJECTED",
]);

function readJson(file) { return JSON.parse(fs.readFileSync(path.join(root, file), "utf8")); }
function unique(records, key, label, errors) {
  const seen = new Set();
  for (const record of records) {
    if (!record || typeof record[key] !== "string" || !record[key]) errors.push(`${label} requires ${key}`);
    else if (seen.has(record[key])) errors.push(`duplicate ${label} ${record[key]}`);
    else seen.add(record[key]);
  }
  return seen;
}
function hasPath(value, dotted) {
  return dotted.split(".").every((part) => value != null && Object.prototype.hasOwnProperty.call(value, part) && (value = value[part]) !== undefined);
}
function globMatch(file, pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("**", "\u0000").replaceAll("*", "[^/]*").replaceAll("\u0000", ".*");
  return new RegExp(`^${escaped}$`).test(file);
}

export function validateAutomation({ truth, ledger, content, manifest, workOrderId, observedHead } = {}) {
  truth ||= readJson(truthPath); ledger ||= readJson(ledgerPath); content ||= readJson(contentPath); manifest ||= readJson(manifestPath);
  const errors = [];
  if (truth.schemaVersion !== 1) errors.push("truth schemaVersion must be 1");
  if (ledger.schemaVersion !== 1) errors.push("ledger schemaVersion must be 1");
  const projectIds = unique(truth.projects || [], "projectId", "project", errors);
  const contentEntities = { ...(content.projects || {}), ...(content.experiments || {}), ...(content.sideProjects || {}) };
  const sourceIds = unique(truth.sources || [], "sourceId", "source", errors);
  const factIds = unique(truth.facts || [], "factId", "fact", errors);
  unique(truth.projectSourcePacks || [], "projectId", "project source pack", errors);
  unique(truth.assetRequests || [], "requestId", "asset request", errors);
  const deltaIds = unique(ledger.approvedDeltas || [], "deltaId", "delta", errors);
  const workOrderIds = unique(ledger.workOrders || [], "workOrderId", "work order", errors);
  const runIds = unique(ledger.executionRuns || [], "runId", "run", errors);
  unique(ledger.implementationReports || [], "reportId", "report", errors);

  for (const source of truth.sources || []) {
    if (!projectIds.has(source.projectId)) errors.push(`${source.sourceId}: invalid project reference`);
    if (!lifecycle.has(source.lifecycle)) errors.push(`${source.sourceId}: invalid lifecycle`);
    if (!safetyStates.has(source.publicSafety)) errors.push(`${source.sourceId}: invalid public-safety state`);
  }
  for (const fact of truth.facts || []) {
    if (!projectIds.has(fact.projectId)) errors.push(`${fact.factId}: invalid project reference`);
    if (!lifecycle.has(fact.lifecycle)) errors.push(`${fact.factId}: invalid lifecycle`);
    if (!boundaries.has(fact.deliveryBoundary)) errors.push(`${fact.factId}: invalid delivery boundary`);
    if (!safetyStates.has(fact.publicSafety)) errors.push(`${fact.factId}: invalid public-safety state`);
    for (const id of fact.sourceIds || []) if (!sourceIds.has(id)) errors.push(`${fact.factId}: invalid source ${id}`);
    if (fact.lifecycle === "APPROVED" && fact.provenance?.producer === "MODEL_INFERENCE") errors.push(`${fact.factId}: model inference cannot become APPROVED`);
    for (const oldId of fact.supersedes || []) {
      const old = truth.facts.find((candidate) => candidate.factId === oldId);
      if (!old) errors.push(`${fact.factId}: supersedes unknown fact ${oldId}`);
      else if (old.provenance?.producer === "HUMAN_APPROVED" && fact.provenance?.producer !== "HUMAN_CORRECTION") errors.push(`${fact.factId}: lower-precedence evidence cannot replace Human-approved truth`);
    }
  }
  for (const claim of truth.claims || []) {
    if (!projectIds.has(claim.projectId)) errors.push(`${claim.claimId}: invalid project reference`);
    if (!lifecycle.has(claim.lifecycle) || !boundaries.has(claim.deliveryBoundary)) errors.push(`${claim.claimId}: invalid claim vocabulary`);
    for (const id of claim.factIds || []) if (!factIds.has(id)) errors.push(`${claim.claimId}: invalid fact ${id}`);
  }
  for (const correction of truth.humanCorrections || []) {
    if (correction.actor !== "HUMAN") errors.push(`${correction.correctionId}: Human correction must have HUMAN actor`);
    if (!factIds.has(correction.factId)) errors.push(`${correction.correctionId}: invalid fact reference`);
  }
  for (const conflict of truth.conflicts || []) {
    const facts = (conflict.factIds || []).map((id) => truth.facts.find((fact) => fact.factId === id));
    if (facts.some((fact) => !fact)) errors.push(`${conflict.conflictId}: invalid conflict fact`);
    if (facts.filter(Boolean).filter((fact) => fact.confidence === "HIGH" && fact.lifecycle === "APPROVED").length > 1) {
      if (conflict.resolutionState !== "HUMAN_REQUIRED" || facts.some((fact) => fact.lifecycle !== "HUMAN_REQUIRED")) errors.push(`${conflict.conflictId}: conflicting approved/high-confidence facts must become HUMAN_REQUIRED`);
    }
  }
  for (const pack of truth.projectSourcePacks || []) {
    if (!projectIds.has(pack.projectId) || !contentEntities[pack.projectId]) errors.push(`${pack.projectId}: project source pack has invalid project reference`);
    if (!differences.has(pack.difference)) errors.push(`${pack.projectId}: invalid source-pack difference`);
    for (const id of pack.factIds || []) {
      const fact = truth.facts.find((candidate) => candidate.factId === id);
      if (!factIds.has(id) || fact?.projectId !== pack.projectId) errors.push(`${pack.projectId}: invalid source-pack fact ${id}`);
    }
    for (const id of pack.sourceIds || []) {
      const source = truth.sources.find((candidate) => candidate.sourceId === id);
      if (!sourceIds.has(id) || source?.projectId !== pack.projectId) errors.push(`${pack.projectId}: invalid source-pack source ${id}`);
    }
    for (const ref of pack.existingPublicClaims || []) {
      if (!hasPath(content, ref)) errors.push(`${pack.projectId}: invalid public claim reference ${ref}`);
    }
  }
  for (const request of truth.assetRequests || []) {
    if (!projectIds.has(request.projectId)) errors.push(`${request.requestId}: invalid project reference`);
    if (!new Set(["REQUIRED", "REQUIRED_CANDIDATE_PACK", "OPTIONAL"]).has(request.requirement)) errors.push(`${request.requestId}: invalid requirement`);
    if (!Array.isArray(request.assetIds) || !request.assetIds.length) errors.push(`${request.requestId}: asset IDs are required`);
    for (const id of request.assetIds || []) if (!manifest.items?.[id]) errors.push(`${request.requestId}: invalid asset manifest reference ${id}`);
    if (["REQUIRED", "REQUIRED_CANDIDATE_PACK"].includes(request.requirement) && request.humanUploadRequired !== true) errors.push(`${request.requestId}: required unresolved asset must require Human upload`);
    if (request.requirement === "REQUIRED_CANDIDATE_PACK" && (!request.candidateSourceVisualRange || request.candidateSourceVisualRange.minimum < 1 || request.candidateSourceVisualRange.maximum < request.candidateSourceVisualRange.minimum)) errors.push(`${request.requestId}: invalid candidate source visual range`);
  }
  for (const reuse of truth.assetReuse || []) {
    if (!projectIds.has(reuse.projectId)) errors.push(`${reuse.requestId}: invalid reuse project`);
    if (!manifest.items?.[reuse.manifestAssetId]) errors.push(`${reuse.requestId}: invalid reused manifest asset`);
    if (!sourceIds.has(reuse.reuseSourceId)) errors.push(`${reuse.requestId}: invalid reuse source`);
  }
  const canonicalProjectIds = Object.keys(content.projects || {});
  const canonicalExperimentIds = Object.entries({ ...(content.experiments || {}), ...(content.sideProjects || {}) })
    .filter(([, item]) => !String(item.contentStatus || '').includes('standalone-card-review'))
    .map(([id]) => id);
  if (canonicalProjectIds.length !== 13 || canonicalProjectIds.some((id) => !projectIds.has(id))) errors.push("Verified Project Truth must cover all 13 canonical primary projects");
  if (canonicalExperimentIds.length !== 7 || canonicalExperimentIds.some((id) => !projectIds.has(id))) errors.push("Verified Project Truth must cover all 7 canonical Experiments & Practice records");
  for (const item of truth.lifecycleHistory || []) {
    if (!lifecycleTransitions.has(`${item.from}>${item.to}`)) errors.push(`${item.recordId}: invalid lifecycle transition ${item.from}>${item.to}`);
    if (item.to === "APPROVED" && item.actor !== "HUMAN") errors.push(`${item.recordId}: only Human can approve truth`);
  }

  const allowed = ledger.stateMachine?.allowedTransitions || {};
  for (const [from, targets] of Object.entries(allowed)) for (const to of targets) {
    if (!(ledger.stateVocabulary || []).includes(from) || !(ledger.stateVocabulary || []).includes(to)) errors.push(`unknown state transition ${from}>${to}`);
  }
  for (const [from, to] of ledger.stateMachine?.forbiddenTransitions || []) if ((allowed[from] || []).includes(to)) errors.push(`forbidden transition is allowed ${from}>${to}`);

  for (const delta of ledger.approvedDeltas || []) {
    if (delta.status !== "APPROVED" || delta.approvedBy !== "HUMAN") errors.push(`${delta.deltaId}: delta is not Human-approved`);
    for (const id of delta.truthReferences || []) {
      const fact = truth.facts.find((candidate) => candidate.factId === id);
      if (!factIds.has(id)) errors.push(`${delta.deltaId}: invalid truth reference ${id}`);
      else if (delta.status === "APPROVED" && fact?.lifecycle !== "APPROVED") errors.push(`${delta.deltaId}: approved delta references non-approved truth ${id}`);
    }
    for (const ref of delta.contentTruthReferences || []) {
      if (!content.projects?.[ref.projectId] || !hasPath(content.projects[ref.projectId], ref.fieldPath)) errors.push(`${delta.deltaId}: invalid content truth reference ${ref.projectId}.${ref.fieldPath}`);
    }
    for (const ref of delta.assetTruthReferences || []) if (!manifest.items?.[ref.assetId]) errors.push(`${delta.deltaId}: invalid asset truth reference ${ref.assetId}`);
    for (const fieldDelta of delta.fieldDeltas || []) {
      if (!contentEntities[fieldDelta.projectId]) errors.push(`${delta.deltaId}: invalid field-delta project ${fieldDelta.projectId}`);
      if (!fieldDelta.fields || !Object.keys(fieldDelta.fields).length) errors.push(`${delta.deltaId}: field delta requires fields for ${fieldDelta.projectId}`);
      for (const id of fieldDelta.truthReferences || []) {
        const fact = truth.facts.find((candidate) => candidate.factId === id);
        if (!fact || fact.projectId !== fieldDelta.projectId || fact.lifecycle !== "APPROVED") errors.push(`${delta.deltaId}: invalid approved field-delta truth ${id}`);
      }
    }
  }
  for (const order of ledger.workOrders || []) {
    if (order.status !== "APPROVED" || order.approvedBy !== "HUMAN") errors.push(`${order.workOrderId}: Work may consume only approved Work Orders`);
    if (!/^[0-9a-f]{40}$/i.test(order.expectedHead || "")) errors.push(`${order.workOrderId}: exact-head expectation is required`);
    if (!Array.isArray(order.allowedPaths) || !order.allowedPaths.length || !Array.isArray(order.forbiddenPaths) || !order.forbiddenPaths.length) errors.push(`${order.workOrderId}: allowed and forbidden paths are required`);
    for (const id of order.approvedDeltaIds || []) {
      const delta = ledger.approvedDeltas.find((candidate) => candidate.deltaId === id);
      if (!deltaIds.has(id) || delta?.status !== "APPROVED") errors.push(`${order.workOrderId}: unapproved delta ${id} cannot enter IMPLEMENTATION`);
      for (const operation of delta?.operations || []) {
        if (!(order.allowedPaths || []).some((pattern) => globMatch(operation.path, pattern))) errors.push(`${order.workOrderId}: path is not allowed ${operation.path}`);
        if ((order.forbiddenPaths || []).some((pattern) => globMatch(operation.path, pattern))) errors.push(`${order.workOrderId}: forbidden path ${operation.path}`);
      }
    }
  }
  for (const run of ledger.executionRuns || []) {
    const order = ledger.workOrders.find((candidate) => candidate.workOrderId === run.workOrderId);
    if (!order) errors.push(`${run.runId}: invalid Work Order`);
    if (run.expectedHead !== run.observedHead) errors.push(`${run.runId}: HEAD_MOVED expected ${run.expectedHead} observed ${run.observedHead}`);
    const history = run.stateHistory || [];
    for (let index = 1; index < history.length; index++) if (!(allowed[history[index - 1]] || []).includes(history[index])) errors.push(`${run.runId}: invalid state transition ${history[index - 1]}>${history[index]}`);
    for (const id of run.appliedDeltaIds || []) if (!order?.approvedDeltaIds.includes(id)) errors.push(`${run.runId}: applied delta ${id} is not present in Work Order`);
    for (const changed of run.changedPaths || []) {
      if (!(order?.allowedPaths || []).some((pattern) => globMatch(changed, pattern))) errors.push(`${run.runId}: changed path is not allowed ${changed}`);
      if ((order?.forbiddenPaths || []).some((pattern) => globMatch(changed, pattern))) errors.push(`${run.runId}: changed forbidden path ${changed}`);
    }
  }
  const appendKeys = (ledger.executionRuns || []).map((run) => run.appendOnlyKey);
  if (new Set(appendKeys).size !== appendKeys.length) errors.push("execution history appendOnlyKey values must be unique");
  for (const report of ledger.implementationReports || []) {
    const run = ledger.executionRuns.find((candidate) => candidate.runId === report.runId);
    if (!runIds.has(report.runId)) errors.push(`${report.reportId}: invalid run`);
    for (const id of report.appliedDeltaIds || []) if (!run?.appliedDeltaIds.includes(id)) errors.push(`${report.reportId}: claimed applied delta ${id} is absent from run`);
  }
  if (workOrderId) {
    const order = ledger.workOrders.find((candidate) => candidate.workOrderId === workOrderId);
    if (!workOrderIds.has(workOrderId)) errors.push(`unknown Work Order ${workOrderId}`);
    else if (observedHead && order.expectedHead !== observedHead) errors.push(`${workOrderId}: HEAD_MOVED expected ${order.expectedHead} observed ${observedHead}`);
  }
  return errors;
}

function currentHead() { return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); }
function fail(errors) { for (const error of errors) console.error(`ERROR ${error}`); process.exitCode = 1; }
function inspect(truth, ledger) {
  const pending = ledger.humanGates.filter((gate) => gate.status === "PENDING").length;
  console.log(`Truth ${truth.truthVersion}: ${truth.facts.length} fact(s), ${truth.conflicts.length} conflict(s)`);
  console.log(`Ledger ${ledger.ledgerVersion}: ${ledger.workOrders.length} Work Order(s), ${ledger.executionRuns.length} run(s), ${pending} pending Human gate(s)`);
}
function renderReport(ledger, runId) {
  const run = ledger.executionRuns.find((item) => item.runId === runId);
  const report = ledger.implementationReports.find((item) => item.runId === runId);
  if (!run || !report) throw new Error(`Unknown run/report ${runId}`);
  console.log(`# Implementation Report — ${runId}\n`);
  console.log(`- Work Order: ${run.workOrderId}`);
  console.log(`- Result: ${report.result}`);
  console.log(`- State: ${run.stateHistory.at(-1)}`);
  console.log(`- Head: ${run.observedHead}`);
  console.log(`- Applied deltas: ${report.appliedDeltaIds.join(", ") || "none"}`);
  console.log(`- Content / assets / UI / Production changed: ${report.contentChanged} / ${report.assetsChanged} / ${report.uiChanged} / ${report.productionChanged}`);
  console.log(`- Human required: ${report.humanRequired.join("; ") || "none"}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = process.argv[2] || "validate";
  const truth = readJson(truthPath), ledger = readJson(ledgerPath), content = readJson(contentPath), manifest = readJson(manifestPath);
  if (command === "inspect") inspect(truth, ledger);
  else if (command === "validate") {
    const errors = validateAutomation({ truth, ledger, content, manifest });
    if (errors.length) fail(errors); else console.log("Portfolio automation control plane: VALID");
  } else if (command === "validate-work-order") {
    const id = process.argv[3];
    const headFlag = process.argv.indexOf("--head");
    const observedHead = headFlag >= 0 ? process.argv[headFlag + 1] : currentHead();
    const errors = validateAutomation({ truth, ledger, content, manifest, workOrderId: id, observedHead });
    if (errors.length) fail(errors); else console.log(`${id}: VALID at ${observedHead}`);
  } else if (command === "render-report") renderReport(ledger, process.argv[3]);
  else fail([`unknown command ${command}`]);
}
