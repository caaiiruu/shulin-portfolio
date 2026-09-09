import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const runtime=fs.readFileSync('public/site/assets/js/app.js','utf8');
const internalId='freelance-project-operations-tool';

test('Daily Hours is one canonical Primary Project with archived experiment provenance',()=>{
  const project=content.projects['daily-hours'];
  const legacy=content.experiments[internalId];
  assert.equal(project.id,'daily-hours');
  assert.equal(project.legacyExperimentId,internalId);
  assert.deepEqual(project.cardTitle,{en:'Daily Hours',zh:'Daily Hours'});
  assert.equal(project.company.en,'0→1 Independent Product');
  assert.equal(project.decisionNarrative.primaryDecisions.length,4);
  assert.equal(project.mediaAssetStatus,'REQUIRES_HUMAN_SELECTION');
  assert.equal(project.publicContent.productVideo.assetStatus,'CANDIDATE_REVIEW');
  assert.equal(project.publicContent.productVideo.assetId,'daily-hours-overview-28s-preview-v1');
  assert.deepEqual(project.publicContent.productInteractionEvidence.items.map(item=>item.assetStatus),Array(4).fill('CANDIDATE_REVIEW'));
  assert.equal(new Set(project.publicContent.productInteractionEvidence.items.map(item=>item.assetId)).size,4);
  assert.equal(legacy.promotionStatus,'PROMOTED_TO_PRIMARY_PROJECT');
  assert.equal(legacy.promotedProjectId,'daily-hours');
  assert.equal(legacy.releaseEligibility,'PROMOTED_PRIMARY');
});

test('Daily Hours uses the canonical project route and controlled demo access',()=>{
  const project=content.projects['daily-hours'];
  assert.ok(content.workIndex.workFilters.find(filter=>filter.id==='all').projectIds.includes('daily-hours'));
  assert.ok(content.workIndex.workFilters.find(filter=>filter.id==='zero').projectIds.includes('daily-hours'));
  assert.equal(project.publicContent.workingProductCta.cta.href.startsWith('mailto:'),true);
  assert.doesNotMatch(JSON.stringify(project),/https?:\/\/[^\s"]*daily-hours/i);
  assert.match(runtime,/isProjectDefinedCase/);
  assert.match(runtime,/renderProjectDefinedCaseStudy/);
});

test('no public experiment title retains the retired descriptive name',()=>{
  for(const item of Object.values(content.experiments)){
    assert.notEqual(item.title?.en,'Freelance Project Operations Tool');
    assert.notEqual(item.title?.zh,'Freelance Project Operations Tool');
  }
});
