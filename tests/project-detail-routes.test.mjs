import assert from 'node:assert/strict';
import test from 'node:test';

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
