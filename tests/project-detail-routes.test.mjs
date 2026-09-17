import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('canonical project paths are owned by the browser route reader', async () => {
  const [runtimeSource, vercelConfig] = await Promise.all([
    readFile(new URL('../public/site/assets/js/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8').then(JSON.parse)
  ]);
  const rewrite = vercelConfig.rewrites.find(({source}) => source === '/work/:projectId');
  assert.deepEqual(rewrite, {source:'/work/:projectId',destination:'/site/work/:projectId'});
  const generator = await readFile(new URL('../scripts/generate-project-pages.mjs', import.meta.url), 'utf8');
  assert.match(generator, /Object\.entries\(content\.projects/);
  assert.match(generator, /project\.title\.en/);
  assert.match(generator, /project\.atAGlance\.en/);
  assert.match(generator, /project\.criticalProblem\.en/);
  assert.match(runtimeSource, /function projectIdFromPath\(/);
  assert.match(runtimeSource, /\^\\\/work\\\/\(\[\^\/\]\+\)/);
  assert.match(runtimeSource, /get\('case'\)\|\|projectIdFromPath\(\)/);
  assert.match(runtimeSource, /const nextProjectUrl=canonicalProjectUrl\(key\);nextProjectUrl\.hash=''/);
  assert.match(runtimeSource, /history\.pushState\(\{detail:\{type:'project',key\},scrollTop:0\},'',nextProjectUrl\)/);
  assert.match(runtimeSource, /closeDialog\(\{syncHistory:false\}\)/);
});

test('Daily Hours has one public Work projection while its Case Study v2 owners remain frozen', async () => {
  const registry=JSON.parse(await readFile(new URL('../public/site/content/project-presentation-registry.json',import.meta.url),'utf8'));
  assert.equal(registry.defaultPresentationContract,'legacy');
  assert.deepEqual(Object.keys(registry.routes),['/work/daily-hours']);
  const daily=registry.routes['/work/daily-hours'];
  assert.deepEqual({
    projectId:daily.projectId,presentationContract:daily.presentationContract,
    contentOwner:daily.contentOwner,assetOwner:daily.assetOwner,motionOwner:daily.motionOwner,
    publicDiscovery:daily.publicDiscovery,sitemap:daily.sitemap,previewOnly:daily.previewOnly
  },{
    projectId:'daily-hours',presentationContract:'case-study-v2',
    contentOwner:'content/case-studies/daily-hours/content.json',
    assetOwner:'content/case-studies/daily-hours/asset-manifest.json',
    motionOwner:'content/case-studies/daily-hours/motion-manifest.json',
    publicDiscovery:true,sitemap:true,previewOnly:false
  });
  assert.deepEqual(daily.legacyExperimentSlugs,['daily-hours']);
  assert.equal(daily.workProjection.route,'/work/daily-hours');
  const generated=await readFile(new URL('../public/site/work/daily-hours.html',import.meta.url),'utf8');
  assert.match(generated,/data-case-study-v2-root="daily-hours"/);
});

test('internal project documents remain serveable behind public rewrites', async () => {
  const {default:worker}=await import('../dist/server/index.js');
  const requested=[];
  const env={
    ASSETS:{
      fetch:async request=>{
        requested.push(new URL(request.url).pathname);
        return new Response(`<article data-route="${new URL(request.url).pathname}"></article><dialog id="detailDialog"></dialog>`,{
          status:200,
          headers:{'content-type':'text/html'}
        });
      }
    }
  };
  const context={waitUntil(){},passThroughOnException(){}};
  for(const path of ['/site/work/voucher-center','/site/work/voucher/brand-challenges']){
    const response=await worker.fetch(new Request(`https://portfolio.test${path}`),env,context);
    assert.equal(response.status,200);
    const expected=path==='/site/work/voucher-center'?'/site/work/voucher-center.html':'/site/work.html';
    assert.equal(response.headers.get('content-location'),expected);
    assert.match(await response.text(),new RegExp(`data-route="${expected.replace('.', '\\.') }"`));
  }
  assert.deepEqual(requested,['/site/work/voucher-center.html','/site/work.html']);
});
