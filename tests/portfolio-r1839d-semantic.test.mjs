import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const site=new URL("../public/site/",import.meta.url);
const read=path=>fs.readFileSync(new URL(path,site),"utf8");
const ssot=JSON.parse(read("content/portfolio-content.json"));
const app=read("assets/js/app.js");
const ids=Object.keys(ssot.projects);
const slots=ssot.implementationContracts.portfolioPresentation.semanticSlots;
const hash=value=>crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("R183.9D owns the canonical four-role semantic model",()=>{
  assert.equal(ids.length,13);
  assert.deepEqual(slots.transformation.visibleLabels,{before:{en:"Before",zh:"原始狀態"},systemChange:{en:"System change",zh:"系統改變"},after:{en:"After",zh:"建立後"}});
  assert.equal(slots.transformation.semanticRole,"what-changed");
  assert.equal(slots.contribution.semanticRole,"what-i-personally-changed");
  assert.equal(slots.decisions.semanticRole,"what-i-chose");
  assert.equal(slots.ownership.semanticRole,"what-i-owned");
  assert.equal(ssot.implementationContracts.portfolioPresentation.canonicalContributionConsolidation.renderExactlyOnce,true);
});

test("R183.9D keeps all canonical system changes verified and ownership-free at the opening",()=>{
  for(const id of ids){
    const map=ssot.projects[id].keyInterventionMap;
    assert.ok(map?.status?.startsWith("verified"),`${id}: verified Transformation`);
    for(const field of ["before","intervention","after"])assert.ok(map[field]?.en,`${id}: ${field}`);
    assert.doesNotMatch(map.intervention.en,/^\s*I\s+(led|defined|drove|owned|created|turned)\b/i,`${id}: SYSTEM CHANGE must not open as personal ownership`);
  }
});

test("R183.9D renderer derives SYSTEM CHANGE from SSOT and cannot restore MY INTERVENTION",()=>{
  const renderer=app.slice(app.indexOf("function renderKeyInterventionMap"),app.indexOf("const TEAM_IMPACT_LABELS"));
  assert.match(renderer,/semanticSlotContract\('transformation'\)/);
  assert.match(renderer,/labels\.systemChange/);
  assert.doesNotMatch(renderer,/My intervention|MY INTERVENTION|我的介入/);
});

test("R183.9D preserves protected canonical and exploration contracts",()=>{
  assert.deepEqual(ssot.projects.voucher.recruiterFirstPopup.stages.map(stage=>stage.id),["discover","qualify","activate","redeem","review"]);
  assert.equal(ssot.projects.payment.decisionNarrative.primaryDecisions.length,4);
  assert.equal(ssot.implementationContracts.contentPresentationContract.projects.bandzo.sections.outcomes.renderRequired,true);
  const taxi=JSON.stringify(ssot.projects["booking-taxi-pickup-service-strategy"]);
  for(const forbidden of ["~7%","~150","40+ countries"])assert.equal(taxi.includes(forbidden),false);
  assert.equal(ssot.experimentArchitecture.releaseVisibility,"ELIGIBILITY_GATED");
  assert.match(ssot.experimentArchitecture.releaseNote,/only when its own releaseEligibility is READY_PUBLIC/);
  for(const item of Object.values({...ssot.experiments,...ssot.sideProjects}).filter(item=>item.releaseEligibility)){
    assert.ok(item.maturity?.en);
    assert.ok(item.presentationSections?.some(section=>section.id==='contribution'));
    assert.ok(item.presentationSections?.some(section=>section.id==='delivery-boundary'));
  }
});
