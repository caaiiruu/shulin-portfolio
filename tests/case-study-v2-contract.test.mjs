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
  assert.equal(registry.productionRelease,'PRODUCTION_CANDIDATE');
  assert.equal(presentation.defaultPresentationContract,'legacy');
  assert.deepEqual(Object.keys(presentation.routes),['/work/daily-hours']);
  assert.deepEqual(presentation.routes['/work/daily-hours'],{
    projectId:'daily-hours',presentationContract:'case-study-v2',
    contentOwner:'content/case-studies/daily-hours/content.json',
    assetOwner:'content/case-studies/daily-hours/asset-manifest.json',
    motionOwner:'content/case-studies/daily-hours/motion-manifest.json',
    publicDiscovery:true,sitemap:true,previewOnly:false,
    legacyExperimentSlugs:['daily-hours'],
    workProjection:{
      title:'Daily Hours',cardTitle:'Daily Hours — A decision workspace for freelance capacity, pricing, and revenue',type:'0→1 Product',summary:'A freelance project-economics and decision workspace.',
      route:'/work/daily-hours',period:'2026',filterIds:['zero'],coverAssetId:'daily-hours-hero-static',
      searchIndexV2:{
        contentType:'project',canonicalId:'daily-hours',aliases:{en:['Daily Hours']},
        problemTags:{en:['freelance operations','project economics','decision workspace','0→1 product']},
        capabilityTags:{en:['project health','project estimation','workload planning']},intentIds:['launch-zero-to-one-product']
      }
    }
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
  assert.equal(content.outcomesHeadline,'A working decision system, not a portfolio concept.');
  assert.deepEqual(content.outcomes.map(item=>item.title),['Live product','~2 days','Continuous iteration']);
  assert.equal(content.cta.label,'Request demo access');
  assert.equal(content.cta.supportingCopy,'Daily Hours is a live product I use in my own freelance practice.');
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
  assert.match(css,/body\.csv2-active \.site-footer::before,body\.csv2-active \.site-footer::after\{content:none\}/);
  assert.match(css,/body\.csv2-active \.site-footer \.contact-bar-v42\{display:none\}/);
  assert.doesNotMatch(css,/\.csv2-cta-row/);
  assert.match(app,/function resolvePresentationRoute\(/);
  const resolver=app.slice(0,app.indexOf('function pair'));
  assert.doesNotMatch(resolver,/daily-hours/);
  assert.match(resolver,/presentationResolution\.contract!==['"]legacy['"]/);
});

test('Phase 1.1B visual corrections stay inside CSV2 owners',()=>{
  const renderer=fs.readFileSync(path.join(root,'assets/js/case-study-v2.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'assets/css/components/case-study-v2.css'),'utf8');
  assert.doesNotMatch(renderer,/csv2-proof-caption/);
  assert.match(renderer,/node\('span','csv2-outcome-index',String\(index\+1\)\.padStart\(2,'0'\)\)/);
  assert.match(renderer,/node\('strong','',item\.title\)/);
  assert.match(renderer,/node\('span','csv2-cta-label',content\.cta\.label\)/);
  assert.match(css,/\.csv2-evidence-frame\{[^}]*aspect-ratio:36\/25/);
  assert.match(css,/body\.csv2-active \.csv2-cta\{[^}]*white-space:nowrap/);
});

test('CSV2 evidence captions render only when they add explanatory value',()=>{
  const renderer=fs.readFileSync(path.join(root,'assets/js/case-study-v2.js'),'utf8');
  assert.match(renderer,/const caption=asset\?\.caption\?\.trim\(\)/);
  assert.match(renderer,/duplicates=\[label,asset\.role,decisionTitle\]/);
  assert.match(renderer,/if\(caption\)media\.push\(node\('p','csv2-evidence-caption',caption\)\)/);
  assert.doesNotMatch(renderer,/node\('p','csv2-evidence-caption',asset\?\.role/);
  assert.equal(Object.values(assets.assets).filter(asset=>asset.caption).length,0);
});

test('CSV2 lifecycle model preserves semantics and stacks on mobile',()=>{
  const css=fs.readFileSync(path.join(root,'assets/css/components/case-study-v2.css'),'utf8');
  assert.deepEqual(content.lifecycleModel,{
    states:['Active','Completed','Billed','Received'],
    semantics:['Forecast','Final','Receivable','Cash received'],
    label:'Completed ≠ Billed ≠ Received'
  });
  const mobile=css.slice(css.indexOf('@media(max-width:600px)'));
  assert.match(mobile,/\.csv2-lifecycle-states\{display:flex;flex-direction:column;width:100%;gap:28px\}/);
  assert.match(mobile,/\.csv2-lifecycle-state:not\(:last-child\)::after\{content:"↓"/);
  assert.match(mobile,/white-space:normal;text-overflow:clip/);
});

test('CSV2 uses an accessible single-open evidence accordion at tablet width',()=>{
  const renderer=fs.readFileSync(path.join(root,'assets/js/case-study-v2.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'assets/css/components/case-study-v2.css'),'utf8');
  const tablet=css.slice(css.indexOf('@media(max-width:1000px)'),css.indexOf('@media(max-width:600px)'));
  assert.match(tablet,/\.csv2-evidence-body\{display:none\}/);
  assert.match(tablet,/\.csv2-accordion\{display:block;padding:0 48px 40px\}/);
  assert.match(renderer,/summary\.setAttribute\('aria-controls',`csv2AccordionPanel-/);
  assert.match(renderer,/panel\.setAttribute\('role','region'\)/);
  assert.match(renderer,/panel\.setAttribute\('aria-labelledby',summary\.id\)/);
  assert.match(renderer,/accordion\.querySelectorAll\('\.csv2-accordion-summary'\)\.forEach\(control=>control\.setAttribute\('aria-expanded','false'\)\)/);
  assert.match(renderer,/evidenceBody\.hidden=expanded;accordion\.hidden=expanded/);
});
