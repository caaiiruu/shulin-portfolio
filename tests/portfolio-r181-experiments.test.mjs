import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const truth=JSON.parse(fs.readFileSync('docs/portfolio-automation/verified-project-truth.json','utf8'));
const all={...(content.experiments||{}),...(content.sideProjects||{})};
const ids=['weekly-design-session','food-testing-workshop','aja-creative-workshop','capture-ideas','aha-creative-toolbox','hello-sabau'];

test('Daily Hours promotion leaves exactly six public Experiments & Practice records',()=>{
  const publicIds=Object.entries(all).filter(([,item])=>!String(item.contentStatus||'').includes('standalone-card-review')&&item.releaseEligibility!=='PROMOTED_PRIMARY').map(([id])=>id);
  assert.equal(publicIds.length,6);
  assert.deepEqual(publicIds,ids);
});

test('all experiments use the compact shared IA and hidden problem metadata',()=>{
  for(const id of ids){
    const item=all[id];
    assert.equal(item.problemTypeVisibility,'SEARCH_ONLY');
    assert.equal(item.experimentBlocks.length,3);
    assert.ok(item.question.en);
    assert.ok(item.learning.en);
  }
});

test('claim boundaries reject prohibited causal or AI-runtime inflation',()=>{
  assert.match(all['hello-sabau'].claimBoundary.en,/No tourism/);
  assert.match(all['aja-creative-workshop'].claimBoundary.en,/No personality-performance/);
  assert.equal(all['freelance-project-operations-tool'].promotionStatus,'PROMOTED_TO_PRIMARY_PROJECT');
  assert.equal(all['freelance-project-operations-tool'].promotedProjectId,'daily-hours');
});

test('truth covers every experiment source package',()=>{
  for(const id of ids){
    assert.ok(truth.projects.some(item=>item.projectId===id));
    assert.ok(truth.projectSourcePacks.some(item=>item.projectId===id));
    assert.ok(truth.facts.some(item=>item.projectId===id&&item.lifecycle==='APPROVED'));
  }
});

test('R183.8E resolves supplied evidence while preserving text-led projects without invented imagery',()=>{
  assert.equal(all['weekly-design-session'].assetStatus,'TEXT_EVIDENCE_ACTIVE');
  for(const id of ['food-testing-workshop','aja-creative-workshop','capture-ideas','aha-creative-toolbox']){
    assert.equal(all[id].assetStatus,'HUMAN_SOURCE_ACTIVE');
    assert.ok(all[id].hero?.assetId);
  }
  assert.equal(truth.futureAssetRequirements.filter(item=>item.requestId.startsWith('AR-R181-')).length,7);
});
