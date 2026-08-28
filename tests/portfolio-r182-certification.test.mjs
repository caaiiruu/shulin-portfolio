import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('public/site/content/portfolio-asset-manifest.json','utf8'));
const ledger=JSON.parse(fs.readFileSync('docs/portfolio-automation/execution-ledger.json','utf8'));
const truth=JSON.parse(fs.readFileSync('docs/portfolio-automation/verified-project-truth.json','utf8'));
const app=fs.readFileSync('public/site/assets/js/app.js','utf8');
const projectDetailCss=fs.readFileSync('public/site/assets/css/components/project-detail-overview.css','utf8');
const experiments=Object.entries({...content.experiments,...content.sideProjects}).filter(([,x])=>!String(x.contentStatus||'').includes('standalone-card-review'));

test('R182 applies the Human-approved Primary content package atomically',()=>{
  assert.match(content.contentVersion,/r18(?:22|26|3|-non-asset-complete)/);
  assert.equal(manifest.contentVersion,content.contentVersion);
  assert.equal(ledger.approvedDeltas.find(x=>x.deltaId==='DELTA-R1801-APPROVED-CONTENT-PACKAGE').implementationStatus,'APPLIED_ON_R182_BRANCH');
  assert.equal(content.projects.voucher.title.en,'Voucher rules to reusable incentive behaviour');
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

test('R182.5 binds one approved 16:9 Lead Visual to every Primary card and detail slot',()=>{
  const expected={
    voucher:['voucher-hero-incentive-journey-public-v1','voucher-lead-visual-incentive-ecosystem-public-v1.jpg','4a486dc375fb84c622940321c4bec2968856b1d8c20c80e69564d5331dd516a8'],
    'voucher-center':['voucher-center-hero-centralised-discovery-public-v1','voucher-center-lead-visual-claim-journey-public-v1.jpg','0baae930d225c7fa67222e112afbdab562bb8b7511ad1c270bd6bfd92f8f1ec2'],
    'game-center':['gamecenter-hero-shipped-before-after-public-v1','game-center-lead-visual-multi-game-discovery-public-v1.jpg','063b8259d3505d9cb4dfdb9bd2a5995391cf342f1d0f54bb124b010f417ced17'],
    dbs:['dbs-project-card-primary-01','dbs-lead-visual-exception-and-risk-workbench-public-v1.jpg','79f35586b956d33143655de49f28cce77c2fc8b14c79f76823f50b8d8dc95039'],
    booking:['booking-hero-connected-booking-public-v1','booking-connected-trip-lead-visual-timeline-experience-public-v1.jpg','83a1e6bba227db1c7609d217deae346dcdc3ea419148424986160fb465a71ed6'],
    bandzo:['bandzo-hero-guided-practice-public-v1','bandzo-lead-visual-guided-practice-system-public-v1.jpg','a3262643f2ea3f6447f7a3cd15c786ed2a95388d77fff6a6e9ef6c10c6f5e7af'],
    payment:['payment-hero-unified-checkout-public-v1','payment-lead-visual-app-and-sco-checkout-public-v1.jpg','f68d23dd247f0e85ca1468ca23d01a09951c6d55cd847bd0af6225071dff285f'],
    'cathay-sit-online-account-opening':['cathay-sit-hero-final-flow-public-v1','cathay-online-account-opening-lead-visual-end-to-end-flow-public-v1.jpg','2eb8b6ef4b799dd925fbcea786d6d11641e9c51185a26011e99de33062b6dfd6'],
    'taishin-p2p-marketplace-platform':['taishin-marketplace-hero-inuse-v1','taishin-p2p-marketplace-lead-visual-marketplace-platform-public-v1.jpg','b9480b52854ef5d3fffb2b92379cad755d57a3d92c7860f34a2c346ef9776734'],
    'cathay-mortgage-assistant':['cathay-mortgage-hero-consultation-public-v1','cathay-mortgage-assistant-lead-visual-consultation-system-public-v1.jpg','db141b4eff5cdcc8f1a07205d07ee2dd9a808f47f417ed6cc1601645881457d7'],
    'cathay-sit-review-remediation-operations':['cathay-review-research-operating-baseline-public-v1','cathay-review-remediation-lead-visual-remediation-operating-model-public-v1.jpg','cd2e47a58b64e4b0fd8b6cb264ef996959eb9f80216c79542a9bd2e94e7e6146'],
    'ctbc-mortgage-self-service-app':['ctbc-mortgage-hero-final-flow-public-v1','ctbc-mortgage-self-service-lead-visual-service-architecture-public-v1.jpg','032c45ffacf1549e6bec04c3fe156883870a1a3e1ebd771ce657f671d452cb5c'],
    'booking-taxi-pickup-service-strategy':['booking-taxi-pickup-overview-source-v1','booking-taxi-strategy-lead-visual-taxi-insights-public-v1.jpg','fd3d1c90a36a63dee42586eff4d5f2cad0d738f62f63094eb0c1c6c3c9c360f2']
  };
  assert.equal(Object.keys(expected).length,13);
  for(const [projectId,[assetId,filename,sha256]] of Object.entries(expected)){
    const project=content.projects[projectId];
    assert.equal(project.hero_visual_brief?.assetId||project.heroVisualBrief?.assetId,assetId);
    const asset=manifest.items[assetId];
    assert.deepEqual({projectId:asset.projectId,type:asset.type,aspectRatio:asset.aspectRatio,assetStatus:asset.assetStatus,implementationStatus:asset.implementationStatus,placeholderFallbackAssetId:asset.placeholderFallbackAssetId,replacementRequired:asset.replacementRequired,publicBuild:asset.publicBuild,width:asset.width,height:asset.height},{projectId,type:'image/jpeg',aspectRatio:'16:9',assetStatus:'production',implementationStatus:'real-active',placeholderFallbackAssetId:null,replacementRequired:false,publicBuild:true,width:2048,height:1152});
    assert.ok(asset.publicPath.endsWith(`/${filename}`));
    assert.equal(asset.sha256,sha256);
    assert.ok(asset.alt&&asset.alt_zh);
    const bytes=fs.readFileSync(`public${asset.publicPath}`);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sha256);
  }
  assert.notEqual(manifest.items[expected.booking[0]].publicPath,manifest.items[expected['booking-taxi-pickup-service-strategy'][0]].publicPath);
});

test('R182.6 restores final Payment semantics and retires stale Payment and Voucher requests',()=>{
  const payment=content.projects.payment;
  const decisions=payment.decisionNarrative.primaryDecisions;
  assert.equal(payment.title.en,'Unifying App, cashier and self-checkout into one payment system');
  assert.equal(payment.atAGlance.en,'Led 0→1 design of FairPrice’s payment system across App, cashier and self-checkout, reaching ~190 stores and ~228K monthly transactions at 98.5% success while cutting checkout time from 19.78 sec to 7.29 sec.');
  assert.equal(payment.infoGrid.type.value,'Transaction System');
  assert.equal(payment.infoGrid.timeline.duration.en,'1 year');
  assert.equal(payment.infoGrid.timeline.dateRange.en,'Dec 2020–Nov 2021');
  assert.equal(payment.presentation.contentRefs.decisions,'decisionNarrative.primaryDecisions');
  assert.equal(decisions.length,4);
  assert.deepEqual(decisions.map(item=>item.title.en),[
    'Orchestrate one shared transaction across App, cashier and self-checkout',
    'Keep loyalty value legible and trustworthy at the moment of payment',
    'Design recovery and traceability as part of the transaction',
    'Extend the payment model into operations, POS and cross-functional delivery'
  ]);
  assert.equal(payment.publicContent.coreSystemInsight.insight.en,'Payment trust broke across the seams between loyalty, checkout and post-payment recovery.');
  assert.equal(payment.publicContent.coreSystemInsight.evidence[0].assetId,'payment-core-checkout-compression-approved-v3');
  assert.equal(payment.publicContent.coreSystemInsight.showInsightLabel,false);
  assert.equal(payment.publicContent.coreSystemInsight.showVisualProofLabel,false);
  assert.equal(payment.publicContent.coreSystemInsight.evidence[0].presentation,'raw');
  assert.deepEqual(payment.publicContent.decisionEvidence.items.map(item=>item.assetId),[
    'payment-evidence-live-checkout-image-only-r1649d',
    'payment-evidence-journey-synthesis-r1649c',
    'payment-evidence-sco-entry-public-v2',
    'payment-return-recovery-human-r1649d'
  ]);
  assert.equal(payment.publicContent.decisionEvidence.quotes.length,2);
  assert.ok(payment.publicContent.decisionEvidence.quotes.every(item=>item.role.en==='SHOPPER VOICE'));
  assert.match(app,/element\('figure','structured-evidence-quote'\)/);
  assert.match(app,/element\('blockquote','',t\(item\.quote\)\)/);
  assert.match(projectDetailCss,/\.structured-evidence-quote blockquote\{/);
  assert.deepEqual(payment.publicContent.decisionEvidence.validationLayer.metrics.map(item=>item.value),['87.5%','85.7%']);
  assert.equal(payment.publicContent.outcomes.semanticHierarchy.measured[0].value,'70.2');
  assert.deepEqual(payment.publicContent.outcomes.semanticHierarchy.measured.map(item=>item.value),['70.2','~190','~57K','~228K','98.5%','2.7× faster']);
  assert.equal(payment.publicContent.outcomes.semanticHierarchy.measured.at(-1).supportingCopy.en,'19.78 sec → 7.29 sec');
  assert.equal(payment.publicContent.outcomes.semanticHierarchy.recognition.ctaLabel.en,'View award announcement ↗');
  assert.equal(payment.relatedProjects[0].projectId,'voucher');
  assert.deepEqual(Object.keys(payment.decisionEvidenceMap),['payment-r1641-decision-01','payment-r1641-decision-02','payment-r1641-decision-03','payment-r1641-decision-04']);
  assert.deepEqual(Object.values(payment.decisionEvidenceMap).map(item=>item.publicAssetId),[
    'payment-decision-01-app-entry-r1649h',
    'payment-decision-02-loyalty-history-r1649h',
    'payment-decision-03-return-record-r1649h',
    'payment-decision-04-operations-pos-guidelines-r1649h'
  ]);
  assert.match(decisions[3].whatIDecided.en,/Payments Engineering, POS, Finance, Security, Customer Service, NCR and store-operation stakeholders/);
  assert.match(decisions[3].whyThisChoice.en,/internal operational interfaces for transaction review and refund handling/);
  assert.equal(payment.latestConfirmedCorrection.supersededTitle,'Transaction continuity across App and in-store checkout');
  assert.doesNotMatch(JSON.stringify(payment),/Key in Payment ref\./);

  const restoredAssets=[
    'payment-core-checkout-compression-approved-v3',
    'payment-evidence-journey-synthesis-r1649c',
    'payment-evidence-live-checkout-image-only-r1649d',
    'payment-return-recovery-human-r1649d',
    'payment-decision-01-app-entry-r1649h',
    'payment-decision-02-loyalty-history-r1649h',
    'payment-decision-03-return-record-r1649h',
    'payment-decision-04-operations-pos-guidelines-r1649h'
  ];
  for(const id of restoredAssets){
    const asset=manifest.items[id];
    assert.equal(asset.assetStatus,'production');
    assert.equal(asset.implementationStatus,'real-active');
    assert.equal(asset.replacementRequired,false);
    assert.ok(fs.existsSync(`public${asset.publicPath}`));
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(`public${asset.publicPath}`)).digest('hex'),asset.sha256);
  }

  const retiredIds=[
    'payment-evidence-order-history-public-v1',
    'payment-video-core-app-pos-public-v1',
    'voucher-proof-sec-transformation-public-v1',
    'voucher-framework-error-recovery-public-v1',
    'voucher-framework-pdp-contextual-discovery-public-v1',
    'voucher-framework-voucher-details-evolution-public-v1',
    'voucher-framework-voucher-condition-action-matrix-public-v1',
    'voucher-framework-mechanism-transition-public-v1',
    'voucher-framework-channel-redemption-public-v1',
    'voucher-framework-voucher-card-system-public-v1',
    'voucher-framework-voucher-card-research-evidence-public-v1',
    'voucher-evidence-component-properties-public-v1',
    'voucher-evidence-operations-reuse-public-v1',
    'voucher-stage-review-post-use-public-v1'
  ];
  for(const id of retiredIds){
    assert.equal(manifest.items[id],undefined);
    assert.doesNotMatch(JSON.stringify(content),new RegExp(id));
    assert.doesNotMatch(JSON.stringify(truth),new RegExp(id));
  }
  assert.equal(Object.values(manifest.items).filter(asset=>['payment','voucher'].includes(asset.projectId)&&asset.implementationStatus==='placeholder-active').length,0);
});
