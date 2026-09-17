import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const runtime=fs.readFileSync('public/site/assets/js/app.js','utf8');
const internalId='freelance-project-operations-tool';

test('Daily Hours keeps one governed internal record and a separate public identity',()=>{
  const matches=Object.entries(content.experiments).filter(([key,item])=>key===internalId||item.publicSlug==='daily-hours');
  assert.equal(matches.length,1);
  const [key,item]=matches[0];
  assert.equal(key,internalId);
  assert.equal(item.id,internalId);
  assert.equal(item.searchIndexV2.canonicalId,internalId);
  assert.equal(item.publicSlug,'daily-hours');
  assert.deepEqual(item.title,{en:'Daily Hours',zh:'Daily Hours'});
  assert.equal(item.publicDescriptor.en,'AI-assisted freelance project operations tool');
  assert.match(item.claimBoundary.en,/AI assisted construction; AI is not claimed as a core runtime capability/);
  assert.equal(item.releaseEligibility,'DEFERRED_NON_SHIPPING');
});

test('the retired experiment slug resolves to the canonical CSV2 Work route',()=>{
  assert.match(runtime,/function retiredExperimentDestination\(\)/);
  assert.match(runtime,/legacyExperimentSlugs\?\.includes\(slug\)/);
  assert.match(runtime,/window\.location\.replace\(retiredDestination\)/);
  assert.match(runtime,/function experimentKeyFromPublicSlug\(slug\)/);
  assert.match(runtime,/DATA\.experiments\?\.\[slug\]/);
  assert.match(runtime,/item\.publicSlug===slug/);
  assert.match(runtime,/function experimentPublicSlug\(key\)\{return DATA\.experiments\?\.\[key\]\?\.publicSlug\|\|key\}/);
  assert.match(runtime,/url\.pathname='\/experiments'/);
  assert.match(runtime,/url\.searchParams\.set\('experiment',experimentPublicSlug\(key\)\)/);
  assert.match(runtime,/history\.replaceState\(\{detail:\{type:'experiment',key:deepLinkedExperiment\},scrollTop:0\},'',canonicalExperimentUrl\(deepLinkedExperiment\)\)/);
  assert.match(runtime,/history\.pushState\(\{detail:\{type:'experiment',key\},scrollTop:0\},'',url\)/);
});

test('Daily Hours is a registry-backed Work projection without becoming legacy project 14',()=>{
  const registry=JSON.parse(fs.readFileSync('public/site/content/project-presentation-registry.json','utf8'));
  const route=registry.routes['/work/daily-hours'];
  assert.equal(Object.keys(content.projects).length,13);
  assert.equal(content.projects['daily-hours'],undefined);
  assert.equal(route.publicDiscovery,true);
  assert.deepEqual(route.workProjection,{title:'Daily Hours',cardTitle:'Daily Hours — A decision workspace for freelance capacity, pricing, and revenue',type:'0→1 Product',summary:'A freelance project-economics and decision workspace.',route:'/work/daily-hours',period:'2026',filterIds:['zero','operations'],coverAssetId:'daily-hours-hero-static',searchIndexV2:{contentType:'project',canonicalId:'daily-hours',aliases:{en:['Daily Hours']},problemTags:{en:['freelance operations','project economics','decision workspace','0→1 product']},capabilityTags:{en:['project health','project estimation','workload planning']},intentIds:['launch-zero-to-one-product']}});
  assert.match(runtime,/caseStudyProjects/);
  assert.match(runtime,/publicProjects:\{\.\.\.projects,\.\.\.caseStudyProjects\}/);
});

test('no public experiment title retains the retired descriptive name',()=>{
  for(const item of Object.values(content.experiments)){
    assert.notEqual(item.title?.en,'Freelance Project Operations Tool');
    assert.notEqual(item.title?.zh,'Freelance Project Operations Tool');
  }
});
