import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('canonical project paths are owned by the browser route reader', async () => {
  const [runtimeSource, vercelConfig] = await Promise.all([
    readFile(new URL('../public/site/assets/js/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8').then(JSON.parse)
  ]);
  const rewrite = vercelConfig.rewrites.find(({source}) => source === '/site/work/:projectId');
  assert.deepEqual(rewrite, {source: '/site/work/:projectId', destination: '/site/work'});
  assert.match(runtimeSource, /function projectIdFromPath\(/);
  assert.match(runtimeSource, /\/site\\\/work\\\/\(\[\^\/\]\+\)/);
  assert.match(runtimeSource, /get\('case'\)\|\|projectIdFromPath\(\)/);
  assert.match(runtimeSource, /history\.pushState\(\{detail:\{type:'project',key\}\},'',canonicalProjectUrl\(key\)\)/);
  assert.match(runtimeSource, /closeDialog\(\{syncHistory:false\}\)/);
});

test('project detail paths serve the canonical Work dialog document', async () => {
  const {default:worker}=await import('../dist/server/index.js');
  const requested=[];
  const env={
    ASSETS:{
      fetch:async request=>{
        requested.push(new URL(request.url).pathname);
        return new Response('<dialog id="detailDialog"></dialog>',{
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
    assert.equal(response.headers.get('content-location'),'/site/work.html');
    assert.match(await response.text(),/detailDialog/);
  }
  assert.deepEqual(requested,['/site/work.html','/site/work.html']);
});
