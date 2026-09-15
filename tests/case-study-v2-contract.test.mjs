import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root=path.resolve('public/site');
const readJson=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
const presentation=readJson('content/project-presentation-registry.json');
const registry=readJson('docs/design-system/case-study-v2/registry.json');
const content=readJson('content/case-studies/daily-hours/content.json');
const assets=readJson('content/case-studies/daily-hours/asset-manifest.json');
const motion=readJson('content/case-studies/daily-hours/motion-manifest.json');

test('CSV2 is isolated and Daily Hours is its only consumer',()=>{
  assert.equal(registry.id,'CSV2-1.0');
  assert.equal(registry.productionRelease,'BLOCKED');
  assert.equal(presentation.defaultPresentationContract,'legacy');
  assert.deepEqual(Object.keys(presentation.routes),['/work/daily-hours']);
  assert.deepEqual(presentation.routes['/work/daily-hours'],{
    projectId:'daily-hours',presentationContract:'case-study-v2',
    contentOwner:'content/case-studies/daily-hours/content.json',
    assetOwner:'content/case-studies/daily-hours/asset-manifest.json',
    motionOwner:'content/case-studies/daily-hours/motion-manifest.json',
    publicDiscovery:false,sitemap:false,previewOnly:true
  });
});

test('approved English content is exact and zh remains pending',()=>{
  assert.equal(content.identity,'DH-CONTENT-1.0');
  assert.deepEqual(content.localeStatus,{en:'APPROVED',zh:'PENDING_HUMAN_APPROVAL'});
  assert.deepEqual(content.hero,{eyebrow:'0→1 Product',lineOne:'Track work.',lineTwo:'Decide what’s worth it.',positioning:'An independent freelance project-economics and decision workspace.'});
  assert.deepEqual(content.firstQuestion,{lineOne:'I could track every hour.',lineTwo:'But was the project actually healthy?'});
  assert.equal(content.shift.problemClose,'The problem wasn’t missing data. It was missing interpretation.');
  assert.deepEqual([content.shift.reframeOne,content.shift.reframeTwo],['Time is an input.','The decision is the product.']);
  assert.deepEqual(content.lifecycle,['Plan','Work','Monitor','Settle','Learn']);
  assert.equal(content.nextQuestion,'What should stay flexible—and what should become a system for other freelancers?');
});

test('approved evidence bytes match every recorded SHA-256',()=>{
  assert.equal(assets.identity,'DH-EVIDENCE-1.0');
  for(const [id,asset] of Object.entries(assets.assets)){
    if(asset.classification==='PRESENTATION_COMPONENT'){
      assert.equal(id,'daily-hours-lifecycle-model');
      assert.equal(asset.externalAssetRequired,false);
      assert.equal(asset.publicPath,undefined);
      continue;
    }
    const bytes=fs.readFileSync(path.join(root,asset.publicPath.slice('/site/'.length)));
    assert.equal(bytes.length,asset.bytes,`${id} byte size`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,`${id} hash`);
    assert.equal(asset.status,'HUMAN_APPROVED_FOR_PHASE_1');
  }
});

test('motion remains static-first and video pending',()=>{
  assert.equal(motion.identity,'DH-MOTION-0.0');
  assert.equal(motion.status,'VIDEO_PENDING');
  assert.equal(motion.heroFilm,null);
  assert.equal(motion.playCta.enabled,false);
  assert.equal(motion.autoplay,false);
  assert.equal(motion.fakeControls,false);
});

test('V2 owners do not leak into the legacy project-detail owner',()=>{
  const legacy=fs.readFileSync(path.join(root,'assets/css/components/project-detail-overview.css'),'utf8');
  const app=fs.readFileSync(path.join(root,'assets/js/app.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'assets/css/components/case-study-v2.css'),'utf8');
  assert.doesNotMatch(legacy,/csv2-|case-study-v2/i);
  assert.match(css,/\.csv2-main/);
  assert.match(app,/function resolvePresentationRoute\(/);
  const resolver=app.slice(0,app.indexOf('function pair'));
  assert.doesNotMatch(resolver,/daily-hours/);
  assert.match(resolver,/presentationResolution\.contract!==['"]legacy['"]/);
});
