import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const baseUrl=(process.env.BASE_URL||'http://127.0.0.1:3000').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const failures=[];
const results=[];

const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const position=page=>page.evaluate(()=>{
  const section=document.getElementById('domains');
  const target=section?.querySelector('.domain-layout')||section;
  const headerBottom=document.querySelector('.site-header')?.getBoundingClientRect().bottom||0;
  const anchorGap=section?parseFloat(getComputedStyle(section).getPropertyValue('--domain-anchor-gap'))||0:0;
  const expectedTop=headerBottom+anchorGap;
  const actualTop=target?.getBoundingClientRect().top??Number.NaN;
  return {actualTop,expectedTop,delta:Math.abs(actualTop-expectedTop),scrollY,hash:location.hash,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
});

for(const width of [1419,871,430]){
  const context=await browser.newContext({viewport:{width,height:width===1419?900:width===871?1024:932}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});

  await page.goto(`${baseUrl}/#domains`,{waitUntil:'networkidle'});
  await settle(page);
  const fresh=await position(page);

  await page.reload({waitUntil:'networkidle'});
  await settle(page);
  const refresh=await position(page);

  await page.goto(`${baseUrl}/`,{waitUntil:'networkidle'});
  await settle(page);
  const noHash=await page.evaluate(()=>({hash:location.hash,scrollY}));
  await page.locator('a.hero__cta[href="#domains"]').click();
  await page.waitForFunction(()=>Math.abs((document.querySelector('#domains .domain-layout')||document.getElementById('domains')).getBoundingClientRect().top-((document.querySelector('.site-header')?.getBoundingClientRect().bottom||0)+(parseFloat(getComputedStyle(document.getElementById('domains')).getPropertyValue('--domain-anchor-gap'))||0)))<=3);
  const click=await position(page);

  await page.goto(`${baseUrl}/#unknown`,{waitUntil:'networkidle'});
  await settle(page);
  const unknownHash=await page.evaluate(()=>({hash:location.hash,scrollY}));

  for(const [label,value] of Object.entries({fresh,refresh,click})){
    if(value.hash!=='#domains'||value.delta>3||value.overflow>1)failures.push(`${width} ${label}: ${JSON.stringify(value)}`);
  }
  if(Math.abs(fresh.actualTop-click.actualTop)>3)failures.push(`${width} fresh/click position drift: ${fresh.actualTop}/${click.actualTop}`);
  if(Math.abs(refresh.actualTop-click.actualTop)>3)failures.push(`${width} refresh/click position drift: ${refresh.actualTop}/${click.actualTop}`);
  if(noHash.hash||noHash.scrollY>2)failures.push(`${width} no-hash forced scroll: ${JSON.stringify(noHash)}`);
  if(unknownHash.hash!=='#unknown')failures.push(`${width} unknown hash changed: ${JSON.stringify(unknownHash)}`);
  if(errors.length)failures.push(`${width} runtime errors: ${JSON.stringify(errors)}`);
  results.push({width,fresh,refresh,click,noHash,unknownHash,errors});
  await context.close();
}

await browser.close();
assert.deepEqual(failures,[]);
console.log(JSON.stringify(results,null,2));
console.log('Domains direct, refresh, click, no-hash, and unknown-hash browser contracts PASS');
