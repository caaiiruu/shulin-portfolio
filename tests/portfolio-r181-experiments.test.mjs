import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const truth=JSON.parse(fs.readFileSync('docs/portfolio-automation/verified-project-truth.json','utf8'));
const all={...(content.experiments||{}),...(content.sideProjects||{})};
const ids=['freelance-project-operations-tool','weekly-design-session','food-testing-workshop','aja-creative-workshop','capture-ideas','aha-creative-toolbox','hello-sabau'];

test('R181 registers exactly seven public Experiments & Practice records',()=>{
  const publicIds=Object.entries(all).filter(([,item])=>!String(item.contentStatus||'').includes('standalone-card-review')).map(([id])=>id);
  assert.equal(publicIds.length,7);
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
  assert.match(all['freelance-project-operations-tool'].claimBoundary.en,/not claimed as a core runtime capability/);
  assert.match(all['freelance-project-operations-tool'].learning.en,/approximately 18%/);
});

test('truth covers every experiment source package',()=>{
  for(const id of ids){
    assert.ok(truth.projects.some(item=>item.projectId===id));
    assert.ok(truth.projectSourcePacks.some(item=>item.projectId===id));
    assert.ok(truth.facts.some(item=>item.projectId===id&&item.lifecycle==='APPROVED'));
  }
});

test('all absent historical binaries and the freelance screenshot are explicit Human asset requirements',()=>{
  assert.equal(all['freelance-project-operations-tool'].assetStatus,'HUMAN_ASSET_REQUIRED');
  for(const id of ids.slice(1)){
    assert.equal(all[id].sourceAssetStatus,'HUMAN_SOURCE_ASSET_REQUIRED');
    assert.equal(all[id].abstractEvidenceFallback,'ACTIVE');
  }
  assert.equal(truth.futureAssetRequirements.filter(item=>item.requestId.startsWith('AR-R181-')).length,7);
});
