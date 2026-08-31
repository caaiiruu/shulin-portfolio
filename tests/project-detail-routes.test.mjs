import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('canonical project paths are owned by the browser route reader', async () => {
  const [runtimeSource, vercelConfig] = await Promise.all([
    readFile(new URL('../public/site/assets/js/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8').then(JSON.parse)
  ]);
  const rewrite = vercelConfig.rewrites.find(({source}) => source === '/site/work/:projectId');
  assert.equal(rewrite, undefined);
  const generator = await readFile(new URL('../scripts/generate-project-pages.mjs', import.meta.url), 'utf8');
  assert.match(generator, /Object\.entries\(content\.projects/);
  assert.match(generator, /project\.title\.en/);
  assert.match(generator, /project\.atAGlance\.en/);
  assert.match(generator, /project\.criticalProblem\.en/);
  assert.match(runtimeSource, /function projectIdFromPath\(/);
  assert.match(runtimeSource, /\/site\\\/work\\\/\(\[\^\/\]\+\)/);
  assert.match(runtimeSource, /get\('case'\)\|\|projectIdFromPath\(\)/);
  assert.match(runtimeSource, /history\.pushState\(\{detail:\{type:'project',key\}\},'',canonicalProjectUrl\(key\)\)/);
  assert.match(runtimeSource, /closeDialog\(\{syncHistory:false\}\)/);
});

test('project detail paths serve generated canonical project documents', async () => {
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
