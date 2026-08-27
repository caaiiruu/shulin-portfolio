import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(`../public/site/${path}`,import.meta.url),'utf8');
const ssot=JSON.parse(read('content/portfolio-content.json'));
const registry=JSON.parse(read('docs/design-system/registry.json'));
const app=read('assets/js/app.js');
const css=read('assets/css/components/project-detail-overview.css');
const tokens=read('assets/css/tokens.css');
const presentation=ssot.implementationContracts.portfolioPresentation;
const primary=presentation.archetypes.primary;
const experiment=presentation.archetypes.experiment;

test('owns public IA through two explicit archetype contracts',()=>{
  assert.deepEqual(primary.canonicalOrder,['hero','overview','complexity','core-insight','decisions','evidence','outcomes','ownership','related-work']);
  assert.deepEqual(experiment.canonicalOrder,['hero','overview','exploration-question','explored-or-built','evidence','learning-or-decision','delivery-state','related-work']);
  assert.equal(primary.projectDefinedOrderAllowed,false);
  assert.equal(experiment.projectDefinedOrderAllowed,false);
  for(const forbidden of ['contribution','key-problems','critical-problem','business-impact'])assert.ok(primary.forbiddenPublicSlots.includes(forbidden));
});

test('routes every public Primary through one renderer and isolates legacy IA',()=>{
  assert.match(app,/archetype:'primary'/);
  assert.match(app,/isRecruiterSystemCase=currentDetail\.type==='project'&&DATA\.projects\[currentDetail\.key\]\?\.archetype==='primary'/);
  assert.match(app,/renderSystemCaseParent\(DATA\.projects\[currentDetail\.key\]\)/);
  const canonical=app.slice(app.indexOf('function renderSystemCaseParent'),app.indexOf('function renderProgrammeParent'));
  assert.doesNotMatch(canonical,/ContributionBlock|canonicalSectionId='my-contribution'|keyProblems|criticalProblem/);
  assert.match(canonical,/presentationContract\('primary'\)/);
  assert.match(canonical,/overview\.dataset\.projectNavTarget='overview'/);
  assert.match(canonical,/list\(contract\?\.canonicalOrder\)/);
  assert.doesNotMatch(canonical,/p\.presentation\?\.sectionOrder|p\.section_order/);
});

test('resolves components deterministically from semantic slots',()=>{
  assert.match(app,/function resolveProjectSemanticSlot\(project,slot\)/);
  assert.match(app,/for\(const path of list\(contract\?\.sourcePaths\)\)/);
  assert.doesNotMatch(app,/resolveProjectSemanticSlot[\s\S]{0,800}(?:project_id|projectKey)===/);
  assert.equal(presentation.semanticSlots.evidence.fallback,'TextEvidence');
  assert.deepEqual(presentation.componentSelectionPriority.evidence,['ProductEvidence','ResearchEvidence','PrototypeEvidence','ArtefactEvidence','FrameworkEvidence','TextEvidence']);
  assert.ok(registry.governanceGraph.componentContracts.SemanticComponentResolver);
});

test('protects the Human-approved baseline',()=>{
  const baseline=presentation.approvedBaseline;
  assert.equal(baseline.homepage.headline.en,'Turn confusion into clear systems');
  assert.equal(baseline.homepage.headline.zh,'把混亂轉化為清晰的系統');
  assert.equal(baseline.homepage.cta.en,'Explore domain experience');
  assert.equal(baseline.protectedTruths['booking-taxi-pickup-service-strategy.infoGrid.type.value'],'Product Optimisation');
  assert.equal(baseline.protectedTruths['payment.infoGrid.type.value'],'0→1 Product');
  assert.equal(baseline.protectedTruths['ctbc-mortgage-self-service-app.publicContent.decisionEvidence.structuredGroups.0.heading.en'],'Application model before screens');
  assert.equal(ssot.projects['booking-taxi-pickup-service-strategy'].infoGrid.type.value,'Product Optimisation');
  assert.equal(ssot.projects.payment.infoGrid.type.value,'0→1 Product');
  assert.equal(ssot.projects['ctbc-mortgage-self-service-app'].publicContent.decisionEvidence.structuredGroups[0].heading.en,'Application model before screens');
});

test('uses one divider-free Overview body semantic',()=>{
  for(const token of ['project-overview-body-size','project-overview-body-weight','project-overview-body-color','project-overview-body-leading'])assert.match(tokens,new RegExp(`--${token}:`));
  assert.match(css,/\.project-summary-v45 p\{[^}]*font-size:var\(--project-overview-body-size\)[^}]*font-weight:var\(--project-overview-body-weight\)/);
  assert.match(css,/\.project-signals-v45 strong\{[^}]*font-size:var\(--project-overview-body-size\)[^}]*font-weight:var\(--project-overview-body-weight\)/);
  assert.match(css,/\.info-grid-v45>div\{[^}]*border:0/);
  assert.doesNotMatch(css,/\.info-grid-v45>div\{[^}]*border-bottom:var\(/);
});

test('governs project-detail spans, spacing and semantic variants from the approved baseline',()=>{
  const variants=presentation.approvedBaseline.semanticVariants;
  assert.deepEqual(variants.complexity.allowed,['dominant-supporting','equal','two-up']);
  assert.equal(variants.complexity.projects.dbs,'dominant-supporting');
  assert.equal(variants.complexity.projects.bandzo,'equal');
  assert.equal(variants.outcomes.projects['cathay-sit-online-account-opening'],'consulting-implementation');
  assert.equal(variants.outcomes.projects.voucher,'quantified');
  assert.match(app,/approvedSemanticVariant\(p,'complexity'\)/);
  assert.match(app,/approvedSemanticVariant\(p,'outcomes'\)/);
  const canonical=app.slice(app.indexOf('function renderSystemCaseParent'),app.indexOf('function renderProgrammeParent'));
  assert.doesNotMatch(canonical,/p\.presentation\?\.complexityLayout/);
  for(const token of ['case-span-headline','case-span-summary','case-span-reading','case-span-full','case-span-focus','case-section-title-content-gap','case-section-canvas-inset','case-overview-summary-grid-gap','case-complexity-item-gap','case-outcome-item-gap']){
    assert.match(tokens,new RegExp(`--${token}:`));
    assert.ok(registry.governanceGraph.tokenContracts[token],`${token} must be registered`);
  }
  assert.match(css,/\.recruiter-complexity-grid--dominant-supporting>/);
  assert.match(css,/\.outcome-qualitative-hierarchy--consulting-implementation/);
});

test('does not promote consulting delivery scope as quantitative outcome impact',()=>{
  const outcomes=ssot.projects['cathay-sit-online-account-opening'].publicContent.outcomes;
  assert.equal(outcomes.semanticHierarchy,undefined);
  assert.equal(outcomes.cards.length,2);
  assert.deepEqual(outcomes.deliveryScopeFacts,['6 stages','4 routes','3 contexts','1 month completed-stage retention']);
  assert.equal(presentation.semanticSlots.outcomes.semanticComponents.quantified,'OutcomeMetric');
  assert.equal(presentation.semanticSlots.outcomes.semanticComponents['consulting-implementation'],'OutcomeStatement');
});

test('keeps sibling Evidence roles comparable without decorative one-off labels',()=>{
  const valueAt=(source,path)=>path.split('.').reduce((value,key)=>value?.[key],source);
  for(const [projectId,project] of Object.entries(ssot.projects)){
    const evidencePath=presentation.semanticSlots.evidence.sourcePaths.find(path=>valueAt(project,path));
    const evidence=valueAt(project,evidencePath||'');
    const groups=evidence?.structuredGroups||evidence?.items||[];
    if(groups.length<2)continue;
    const labelCount=groups.filter(item=>item.supportingLabel||item.eyebrow).length;
    const bulletCount=groups.filter(item=>Array.isArray(item.bullets)&&item.bullets.length).length;
    assert.ok(labelCount===0||labelCount===groups.length,`${projectId}: Evidence labels must represent every sibling role or none`);
    assert.ok(bulletCount===0||bulletCount===groups.length,`${projectId}: one Evidence sibling cannot become a mini case study`);
  }
  const model=ssot.projects['ctbc-mortgage-self-service-app'].publicContent.decisionEvidence.structuredGroups[0];
  assert.equal(model.supportingLabel,undefined);
  assert.equal(model.bullets,undefined);
  assert.equal(model.verifiedModelFacts.length,4);
  assert.equal(model.heading.en,'Application model before screens');
});

test('keeps section intros concise and Domain experience in hiring-signal order',()=>{
  for(const [projectId,project] of Object.entries(ssot.projects)){
    const intro=project.whatMadeThisHard?.intro?.en;
    if(!intro)continue;
    assert.ok(intro.length<=180,`${projectId}: Complexity intro exceeds the concise context contract`);
    assert.ok((intro.match(/[.!?](?:\s|$)/g)||[]).length<=2,`${projectId}: Complexity intro exceeds two sentences`);
  }
  const ordered=[...ssot.contentDiscovery.domains].sort((a,b)=>a.order-b.order).map(item=>item.label.en);
  assert.deepEqual(ordered,['Enterprise operations','Financial services','Retail & commerce','Travel platforms','Rewards & incentives','Learning platforms']);
  assert.equal(ssot.contentDiscovery.section.title.en,'Domain experience');
});

test('keeps all seven Experiments inside the optional Experiment contract',()=>{
  const records=Object.fromEntries(Object.entries({...ssot.experiments,...ssot.sideProjects}).filter(([,item])=>!String(item.contentStatus||'').includes('standalone-card-review')));
  assert.equal(Object.keys(records).length,7);
  assert.match(app,/archetype:'experiment'/);
  assert.match(app,/presentationContract='portfolioPresentation\.experiment'/);
  assert.match(app,/toggleAttribute\('hidden',!prototypeText\)/);
  assert.equal(experiment.projectDefinedOrderAllowed,false);
});
