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

test('keeps all seven Experiments inside the optional Experiment contract',()=>{
  const records=Object.fromEntries(Object.entries({...ssot.experiments,...ssot.sideProjects}).filter(([,item])=>!String(item.contentStatus||'').includes('standalone-card-review')));
  assert.equal(Object.keys(records).length,7);
  assert.match(app,/archetype:'experiment'/);
  assert.match(app,/presentationContract='portfolioPresentation\.experiment'/);
  assert.match(app,/toggleAttribute\('hidden',!prototypeText\)/);
  assert.equal(experiment.projectDefinedOrderAllowed,false);
});
