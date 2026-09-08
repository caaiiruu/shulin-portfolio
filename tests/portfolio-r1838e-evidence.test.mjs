import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('public/site/content/portfolio-asset-manifest.json','utf8'));
const all={...(content.experiments||{}),...(content.sideProjects||{})};
const ids=['freelance-project-operations-tool','weekly-design-session','food-testing-workshop','aja-creative-workshop','capture-ideas','aha-creative-toolbox','hello-sabau'];
const text=value=>JSON.stringify(value);

test('R183.8E gives each exploration an explicit maturity, evidence sequence and independent release gate',()=>{
  for(const id of ids){
    const item=all[id];
    assert.ok(item.maturity?.en,`${id}: maturity`);
    assert.ok(['READY_PUBLIC','DEFERRED_NON_SHIPPING','HUMAN_INPUT_REQUIRED'].includes(item.releaseEligibility),`${id}: release gate`);
    assert.ok(item.presentationSections?.length>=3,`${id}: evidence-led sequence`);
    assert.match(text(item.presentationSections),/Contribution/);
    assert.match(text(item.presentationSections),/Delivery boundary/i);
  }
  assert.equal(content.experimentArchitecture.releaseVisibility,'ELIGIBILITY_GATED');
});

test('Human-provided final assets are governed and physically present',()=>{
  const used=new Set();
  for(const item of ids.map(id=>all[id])){
    if(item.hero?.assetId)used.add(item.hero.assetId);
    for(const section of item.presentationSections) for(const id of section.assetIds||[]) used.add(id);
  }
  assert.ok(used.size>=22);
  for(const id of used){
    const asset=manifest.items[id];
    assert.ok(asset,`${id}: manifest record`);
    if(!id.startsWith('red-dot-2016-')){
      assert.ok(['R183.8E-experiment-source-assets.zip','Hello-SABAU-R183.8F-human-assets.zip'].includes(asset.sourcePackage));
      assert.match(asset.derivativeStatus,/public-safe/);
    }
    assert.ok(fs.existsSync(`public${asset.publicPath.replace(/^\/site/,'/site')}`.replace('public/site','public/site')),`${id}: file exists`);
  }
});

test('Red Dot recognition uses two Human-approved governed award records',()=>{
  const registry=content.recognitionRegistry['red-dot-award-2016'];
  assert.deepEqual(registry.awardItems.map(item=>item.id),[
    'red-dot-2016-game-design-winner',
    'red-dot-2016-packaging-design-winner'
  ]);
  assert.equal(registry.awardItems[0].projectId,'hello-sabau');
  assert.equal(registry.awardItems[0].interaction,'project-linked');
  assert.equal(registry.awardItems[1].projectId,null);
  assert.equal(registry.awardItems[1].interaction,'non-interactive');
  assert.deepEqual(all['hello-sabau'].presentationSections.find(section=>section.id==='recognition').assetIds,['red-dot-2016-game-design-winner-public-v1']);
});

test('Capture Ideas uses exact RSA Final 7 recognition without winner inflation',()=>{
  const item=all['capture-ideas'];
  assert.equal(item.maturity.en,'Awarded concept');
  assert.match(text(item),/RSA Student Design Awards/);
  assert.match(text(item),/Final 7 Shortlist/);
  assert.doesNotMatch(text(item),/award-winning|RSA[^\n]{0,80}Winner/i);
  assert.equal(content.recognitionRegistry['rsa-student-design-awards-2015'].awardResultFromCv.en,'Final 7 Shortlist');
  assert.deepEqual(item.presentationSections.slice(0,3).map(section=>section.id),['proposed-system','contribution','proposed-details']);
  assert.equal(item.presentationSections.filter(section=>['physical-digital-proposition','evidence-gallery'].includes(section.id)).length,0);
  assert.equal(item.presentationSections.find(section=>section.id==='proposed-details').assetIds.length,4);
});

test('evidence maturity and claim boundaries remain source-bounded',()=>{
  assert.equal(all['aha-creative-toolbox'].maturity.en,'Tested concept / prototype exploration');
  assert.match(text(all['aha-creative-toolbox']),/hands-on evaluation/);
  assert.match(all['aha-creative-toolbox'].presentationSections.at(-1).body.en,/No commercial launch, measured creativity uplift, productivity improvement or long-term adoption is proven/);
  assert.equal(all['food-testing-workshop'].maturity.en,'Facilitated research-method experiment');
  assert.equal(all['aja-creative-workshop'].maturity.en,'Facilitated practice');
  assert.equal(all['hello-sabau'].maturity.en,'Delivered cultural product / local experience');
  assert.doesNotMatch(text({summary:all['hello-sabau'].summary,sections:all['hello-sabau'].presentationSections}),/successfully increased tourism|increased revenue|caused talent return/i);
});

test('Freelance and Weekly remain text-led and do not invent imagery or outcomes',()=>{
  for(const id of ['freelance-project-operations-tool','weekly-design-session']){
    assert.equal(all[id].hero,null);
    assert.equal(all[id].presentationSections.flatMap(section=>section.assetIds||[]).length,0);
  }
  assert.match(text(all['freelance-project-operations-tool']),/18%/);
  assert.doesNotMatch(all['freelance-project-operations-tool'].summary.en,/two-day/i);
  const freelanceBoundary=all['freelance-project-operations-tool'].presentationSections.find(section=>section.id==='delivery-boundary');
  assert.match(freelanceBoundary.body.en,/does not prove productivity, revenue or profitability improvement/i);
  assert.match(freelanceBoundary.body.en,/AI is not a runtime product capability/i);
});

test('Booking Taxi recovers two-sided strategic evidence while preserving recommendation isolation',()=>{
  const taxi=content.projects['booking-taxi-pickup-service-strategy'];
  const evidence=text(taxi.publicContent.strategyEvidence);
  assert.match(evidence,/Strategic question/);
  assert.match(evidence,/Customer side/);
  assert.match(evidence,/Supplier side/);
  assert.match(evidence,/Decision workshop/);
  assert.match(evidence,/Recommendation and validation boundary/);
  assert.match(evidence,/does not prove an experiment ran/);
  assert.doesNotMatch(evidence,/conversion result|ride volume|experiment succeeded/i);
});
