import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('public/site/content/portfolio-asset-manifest.json','utf8'));
const ledger=JSON.parse(fs.readFileSync('docs/portfolio-automation/execution-ledger.json','utf8'));
const truth=JSON.parse(fs.readFileSync('docs/portfolio-automation/verified-project-truth.json','utf8'));
const experiments=Object.entries({...content.experiments,...content.sideProjects}).filter(([,x])=>!String(x.contentStatus||'').includes('standalone-card-review'));

test('R182 applies the Human-approved Primary content package atomically',()=>{
  assert.equal(content.contentVersion,'2026-08-25-r182-non-asset-complete');
  assert.equal(manifest.contentVersion,content.contentVersion);
  assert.equal(ledger.approvedDeltas.find(x=>x.deltaId==='DELTA-R1801-APPROVED-CONTENT-PACKAGE').implementationStatus,'APPLIED_ON_R182_BRANCH');
  assert.equal(content.projects.voucher.title.en,'Fragmented voucher journeys to a reusable incentive ecosystem');
  assert.equal(content.projects.booking.role,'UX Designer');
  assert.equal(content.projects.bandzo.infoGrid.timeline.dateRange.en,'Sep 2016–Jan 2017');
});

test('R182 governs 13 Primary Cases and 7 subordinate Experiments',()=>{
  assert.equal(Object.keys(content.projects).length,13);
  assert.equal(experiments.length,7);
  assert.equal(truth.projects.length,20);
  for(const [,item] of experiments)assert.equal(item.problemTypeVisibility,'SEARCH_ONLY');
});

test('high-risk EN/ZH claims retain qualifiers and delivery boundaries',()=>{
  assert.match(JSON.stringify(content.projects['game-center']),/~50%/);
  assert.match(content.projects.booking.atAGlance.en,/40\+ countries/);
  assert.match(content.projects.booking.atAGlance.zh,/40 多個國家/);
  assert.match(content.projects['cathay-sit-online-account-opening'].publicContent.approvedDeliveryBoundary.en,/client-owned/);
  assert.match(content.projects['cathay-sit-online-account-opening'].publicContent.approvedDeliveryBoundary.zh,/客戶端負責/);
  assert.doesNotMatch(JSON.stringify(content.projects.bandzo),/measured learning improvement/i);
});

test('stale PRs are reconciled without changing their heads',()=>{
  assert.deepEqual(ledger.reconciliations.map(x=>x.pr),[16,17,12]);
  for(const item of ledger.reconciliations)assert.equal(item.status,'SUPERSEDED_CANDIDATE_AFTER_R182');
  assert.equal(ledger.reconciliations.find(x=>x.pr===16).head,'36e5ab0363ba19a330dc62f2e2cb9dd4af90ef5f');
  assert.equal(ledger.reconciliations.find(x=>x.pr===17).head,'3a45925d62de3e92527bb4eb7c6b65476f4bfc9f');
  assert.equal(ledger.reconciliations.find(x=>x.pr===12).head,'10821d25833af40bcd6d1db37f5d07bc03d9a1a8');
});

test('Production and asset mutation remain unauthorized',()=>{
  const workOrder=ledger.workOrders.find(x=>x.workOrderId==='WO-R182-NON-ASSET-CLOSURE');
  assert.equal(workOrder.productionAuthorized,false);
  assert.ok(workOrder.forbiddenPaths.includes('public/site/assets/projects/**'));
});
