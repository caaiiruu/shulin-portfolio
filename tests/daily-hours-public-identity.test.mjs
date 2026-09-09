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
  assert.equal(project.decisionNarrative.primaryDecisions.length,3);
  assert.deepEqual(project.decisionNarrative.primaryDecisions.map(decision=>decision.label),['Project health','Attention','Lifecycle']);
  assert.equal(project.decisionNarrative.primaryDecisions[2].supportingEvidence[0].assetId,'daily-hours-decision-04-connected-model-preview-v1');
  assert.match(project.decisionNarrative.primaryDecisions[2].supportingEvidence[0].proof,/Active and Completed continuity/);
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
  assert.equal(project.presentation.composition,'case-study-v2');
  assert.deepEqual(project.sectionOrder,['hero','overview','first-question','product-reframing','key-design-decisions','real-usage-changed-product','outcomes','working-product-cta','related-work']);
  assert.match(runtime,/isCaseStudyV2/);
  assert.match(runtime,/renderCaseStudyV2/);
});

test('Daily Hours v2 decisions and proof use the governed schema',()=>{
  const decisions=content.projects['daily-hours'].decisionNarrative.primaryDecisions;
  const requiredDecision=['id','label','question','title','whyThisChoice','primaryProof','supportingEvidence'];
  const requiredProof=['assetId','mediaType','alt','caption','proof','mediaRole','presentationIntent'];
  for(const decision of decisions){
    for(const field of requiredDecision)assert.ok(field in decision,`${decision.id} missing ${field}`);
    for(const field of requiredProof)assert.ok(field in decision.primaryProof,`${decision.id} primary proof missing ${field}`);
    for(const proof of decision.supportingEvidence)for(const field of requiredProof)assert.ok(field in proof,`${proof.id} missing ${field}`);
  }
  assert.deepEqual(content.projects['daily-hours'].publicContent.firstQuestion.lines,['I knew how many hours I worked.','I still didn’t know if the work was worth it.']);
  assert.deepEqual(content.projects['daily-hours'].publicContent.productReframing.flow,['Work','Project','Economics','Attention','Decision']);
});

test('no public experiment title retains the retired descriptive name',()=>{
  for(const item of Object.values(content.experiments)){
    assert.notEqual(item.title?.en,'Freelance Project Operations Tool');
    assert.notEqual(item.title?.zh,'Freelance Project Operations Tool');
  }
});
