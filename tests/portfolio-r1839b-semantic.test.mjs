import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const site=new URL("../public/site/",import.meta.url);
const read=path=>fs.readFileSync(new URL(path,site),"utf8");
const ssot=JSON.parse(read("content/portfolio-content.json"));
const app=read("assets/js/app.js");
const ids=Object.keys(ssot.projects);
const presentation=ssot.implementationContracts.portfolioPresentation;
const contribution=presentation.canonicalContributionConsolidation;
const hash=value=>crypto.createHash("sha256").update(typeof value==="string"?value:JSON.stringify(value)).digest("hex");

test("R183.9B keeps Transformation and Contribution canonical across 14 projects",()=>{
  assert.equal(ids.length,14);
  assert.ok(presentation.archetypes.primary.requiredSlots.includes("contribution"));
  assert.equal(presentation.semanticSlots.transformation.visibleLabel,"Transformation");
  assert.deepEqual(presentation.semanticSlots.transformation.renderedFields,["before","intervention","after"]);
  assert.equal(presentation.semanticSlots.transformation.supportingCopyPresentation,"contribution-only");
  for(const id of ids){
    const map=ssot.projects[id].keyInterventionMap;
    assert.ok(map?.status?.startsWith("verified"),`${id}: verified Transformation`);
    for(const field of ["before","intervention","after"])assert.ok(map[field]?.en,`${id}: ${field}`);
  }
  assert.deepEqual(presentation.semanticSlots.transformation.visibleLabels,{before:{en:"Before",zh:"原始狀態"},systemChange:{en:"System change",zh:"系統改變"},after:{en:"After",zh:"建立後"}});
  assert.equal(presentation.semanticSlots.transformation.semanticRole,"what-changed");
  assert.equal(presentation.semanticSlots.contribution.semanticRole,"what-i-personally-changed");
  assert.equal(presentation.semanticSlots.decisions.semanticRole,"what-i-chose");
  assert.equal(presentation.semanticSlots.ownership.semanticRole,"what-i-owned");
  assert.match(app,/labels\.systemChange/);
  assert.doesNotMatch(app,/My intervention|MY INTERVENTION|我的介入/);
  assert.match(app,/safeText\(supporting,''\);\s*supporting\.hidden=true/);
  assert.doesNotMatch(app.slice(app.indexOf("function renderKeyInterventionMap"),app.indexOf("function renderProjectValue")),/localize\(map\.sectionLabel\)|localize\(map\.supportingCopy\)/);
});

test("R183.9B consolidates only authorized ownership sources",()=>{
  assert.equal(contribution.scope,"canonical-projects-only");
  assert.equal(contribution.renderExactlyOnce,true);
  for(const id of ["voucher","taishin-p2p-marketplace-platform","ctbc-mortgage-self-service-app"]){
    assert.equal(contribution.projects[id].includeLegacySupportingCopy,true,`${id}: legacy ownership support`);
  }
  for(const id of ["booking","bandzo"])assert.equal(contribution.projects[id].supportingSource,"keyInterventionMap.supportingCopy");
  for(const id of ["dbs","payment","cathay-mortgage-assistant","cathay-sit-online-account-opening"]){
    assert.notEqual(contribution.projects[id]?.includeLegacySupportingCopy,true,`${id}: duplicate support excluded`);
  }
  assert.equal(contribution.projects["voucher-center"].includeOwnershipProof,true);
  assert.equal(contribution.projects["game-center"].includeOwnershipProof,true);
  assert.match(app,/function createContributionBlock/);
  assert.match(app,/dataset\.componentOwner='ContributionBlock'/);
  assert.match(app,/project\.ownershipModel\?\.ledByMe/);
  assert.doesNotMatch(app.slice(app.indexOf("function createContributionBlock"),app.indexOf("function renderSystemCaseParent")),/appendContributionFlow/);
});

test("R183.9B preserves protected project contracts",()=>{
  assert.deepEqual(ssot.projects.voucher.recruiterFirstPopup.stages.map(stage=>stage.id),["discover","qualify","activate","redeem","review"]);
  assert.equal(ssot.projects.payment.decisionNarrative.primaryDecisions.length,4);
  assert.equal(ssot.implementationContracts.contentPresentationContract.projects.bandzo.sections.outcomes.renderRequired,true);
  const taxi=JSON.stringify(ssot.projects["booking-taxi-pickup-service-strategy"]);
  for(const forbidden of ["~7%","~150","40+ countries"])assert.equal(taxi.includes(forbidden),false);
});

test("R183.8E supersedes the former global Experiment deferral with per-project evidence gates",()=>{
  assert.equal(ssot.experimentArchitecture.releaseVisibility,"ELIGIBILITY_GATED");
  assert.match(ssot.experimentArchitecture.releaseNote,/releaseEligibility is READY_PUBLIC/);
  assert.ok(Object.values({...ssot.experiments,...ssot.sideProjects}).filter(item=>item.releaseEligibility).every(item=>item.releaseEligibility==='READY_PUBLIC'));
  const renderer=app.slice(app.indexOf("function renderExperiment"),app.indexOf("const RELATED_PROJECTS"));
  assert.match(renderer,/renderExperimentStory/);
  assert.match(renderer,/ExperimentEvidence/);
});
