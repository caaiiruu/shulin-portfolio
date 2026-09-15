import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const playwrightModule=await import(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const output=path.resolve(process.env.EVIDENCE_DIR||'/tmp/daily-hours-v2-qa');
await fs.promises.rm(output,{recursive:true,force:true});
await fs.promises.mkdir(output,{recursive:true});
const publicRoot=path.resolve('public');
const types={'.css':'text/css','.html':'text/html','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname).replace(/\/$/,'')||'/';
  const cleanRoutes={'/':'/site/index.html','/work':'/site/work.html','/experiments':'/site/experiments.html','/profile':'/site/profile.html'};
  let relative=cleanRoutes[pathname]||(/^\/work\/[a-z0-9-]+$/.test(pathname)?`/site${pathname}.html`:pathname);
  const file=path.resolve(publicRoot,`.${relative}`);
  if(!file.startsWith(publicRoot)||!fs.existsSync(file)){response.writeHead(404);response.end('Not found');return}
  response.writeHead(200,{'cache-control':'no-store','content-type':types[path.extname(file)]||'application/octet-stream'});
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;const base=`http://127.0.0.1:${port}`;
const browser=await chromium.launch({
  headless:true,
  executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});
async function revealFullPage(page){
  await page.evaluate(async()=>{
    const step=Math.max(320,Math.floor(window.innerHeight*.72));
    for(let y=0;y<document.documentElement.scrollHeight;y+=step){
      window.scrollTo(0,y);
      await new Promise(resolve=>setTimeout(resolve,80));
    }
    window.scrollTo(0,0);
  });
  await page.evaluate(()=>document.querySelectorAll('.csv2-reveal,.csv2-lifecycle-model').forEach(item=>item.classList.add('is-visible')));
  await page.evaluate(async()=>Promise.all([...document.images].filter(image=>image.offsetParent!==null).map(async image=>{image.loading='eager';try{await image.decode()}catch{}})));
  await page.waitForTimeout(700);
}
const results=[];
const failures=[];
try{
  for(const viewport of [{name:'1419',width:1419,height:1000},{name:'871',width:871,height:1000},{name:'430',width:430,height:932}]){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:viewport.name==='430'?'reduce':'no-preference'});
    const page=await context.newPage();const consoleErrors=[];const runtimeErrors=[];
    page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});
    page.on('pageerror',error=>runtimeErrors.push(error.message));
    const response=await page.goto(`${base}/work/daily-hours`,{waitUntil:'networkidle'});
    await page.locator('[data-case-study-v2-root][data-csv2-mounted="true"]').waitFor();
    await page.waitForFunction(()=>document.querySelector('.csv2-decision-title')?.textContent==='Project health');
    const initial=await page.evaluate(()=>({
      overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
      sections:[...document.querySelectorAll('[data-csv2-section]')].map(item=>item.dataset.csv2Section),
      broken:[...document.images].filter(image=>image.complete&&image.naturalWidth===0).map(image=>image.src),
      play:[...document.querySelectorAll('button,a')].some(item=>/play product film/i.test(item.textContent||'')),
      zh:[...document.querySelectorAll('[data-lang-toggle]')].map(button=>({disabled:button.disabled,aria:button.getAttribute('aria-disabled')}))
    }));
    const tabs=page.locator('.csv2-decision-tab');await tabs.nth(1).click();
    await page.waitForFunction(()=>document.querySelector('.csv2-decision-title')?.textContent==='Attention');
    const attention=await page.locator('.csv2-decision-title').textContent();
    await tabs.nth(1).press('ArrowRight');
    await page.waitForFunction(()=>document.querySelector('.csv2-decision-title')?.textContent==='Lifecycle');
    const lifecycle=await page.locator('.csv2-decision-title').textContent();
    if(viewport.width<=600)await tabs.nth(1).click();
    const disclosure=page.locator('.csv2-disclosure');await disclosure.click();
    let interaction;
    if(viewport.width<=600){
      const accordions=page.locator('.csv2-accordion-summary');await accordions.nth(1).click();
      interaction={mode:'accordion',open:await accordions.nth(1).getAttribute('aria-expanded'),first:await accordions.nth(0).getAttribute('aria-expanded')};
    }else{
      const evidenceTabs=page.locator('.csv2-evidence-index-button');if(await evidenceTabs.count()>1)await evidenceTabs.nth(1).click();
      interaction={mode:'indexed-explorer',visible:await page.locator('#csv2EvidenceBody').isVisible(),tabs:await evidenceTabs.count()};
    }
    await revealFullPage(page);
    await page.locator('[data-csv2-section="hero"]').scrollIntoViewIfNeeded();await page.waitForTimeout(180);
    await page.screenshot({path:path.join(output,`daily-hours-${viewport.name}.png`),fullPage:false});
    await page.locator('.csv2-decision-stage').scrollIntoViewIfNeeded();await page.waitForTimeout(180);
    await page.screenshot({path:path.join(output,`daily-hours-${viewport.name}-decisions.png`),fullPage:false});
    await page.locator('[data-csv2-section="outcomes"]').scrollIntoViewIfNeeded();await page.waitForTimeout(180);
    await page.screenshot({path:path.join(output,`daily-hours-${viewport.name}-outcomes.png`),fullPage:false});
    const result={viewport:viewport.name,route:'/work/daily-hours',status:response?.status(),overflow:initial.overflow,consoleErrors:[...consoleErrors,...runtimeErrors],brokenMedia:initial.broken,interaction,attention,lifecycle,sections:initial.sections};
    results.push(result);
    if(result.status!==200||result.overflow>0||result.consoleErrors.length||result.brokenMedia.length||initial.play||initial.zh.some(item=>!item.disabled||item.aria!=='true')||attention!=='Attention'||lifecycle!=='Lifecycle')failures.push(result);
    await context.close();
  }
  for(const id of ['payment','voucher','dbs','booking']){
    const context=await browser.newContext({viewport:{width:1419,height:1000}});const page=await context.newPage();const errors=[];
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto(`${base}/work/${id}`,{waitUntil:'networkidle'});await page.locator('#detailDialog[open]').waitFor();
    const state=await page.evaluate(()=>({v2:Boolean(document.querySelector('[data-csv2-mounted="true"]')),legacy:Boolean(document.querySelector('#detailDialog[open] .modal-content-v45')),overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth)}));
    await page.screenshot({path:path.join(output,`${id}-1419.png`),fullPage:false});
    const result={viewport:'1419',route:`/work/${id}`,status:response?.status(),overflow:state.overflow,consoleErrors:errors,brokenMedia:[],interaction:state.legacy?'legacy':'missing',v2:state.v2};results.push(result);
    if(result.status!==200||result.overflow>0||errors.length||!state.legacy||state.v2)failures.push(result);
    await context.close();
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
await fs.promises.writeFile(path.join(output,'results.json'),JSON.stringify({results,failures},null,2));
console.log(JSON.stringify({output,results,failures},null,2));
if(failures.length)process.exit(1);
