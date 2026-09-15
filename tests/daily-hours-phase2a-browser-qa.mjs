import fs from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import path from 'node:path';

const require=createRequire(import.meta.url);
const axePath=require.resolve('axe-core/axe.min.js');
const playwrightModule=await import(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const output=path.resolve(process.env.EVIDENCE_DIR||'/tmp/daily-hours-phase2a-qa');
await fs.promises.rm(output,{recursive:true,force:true});
await fs.promises.mkdir(output,{recursive:true});

let server;
let base=process.env.BASE_URL?.replace(/\/$/,'');
if(!base){
  const publicRoot=path.resolve('public');
  const types={'.css':'text/css','.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.webp':'image/webp'};
  server=http.createServer((request,response)=>{
    const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname).replace(/\/$/,'')||'/';
    const cleanRoutes={'/':'/site/index.html','/work':'/site/work.html','/experiments':'/site/experiments.html','/profile':'/site/profile.html'};
    const relative=cleanRoutes[pathname]||(/^\/work\/[a-z0-9-]+$/.test(pathname)?`/site${pathname}.html`:pathname);
    const file=path.resolve(publicRoot,`.${relative}`);
    if(!file.startsWith(publicRoot)||!fs.existsSync(file)){response.writeHead(404);response.end('Not found');return}
    response.writeHead(200,{'cache-control':'no-store','content-type':types[path.extname(file)]||'application/octet-stream'});
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  base=`http://127.0.0.1:${server.address().port}`;
}

const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const failures=[];
const results=[];
const expectedExperiments=['weekly-design-session','food-testing-workshop','aja-creative-workshop','capture-ideas','aha-creative-toolbox','hello-sabau'].sort();
const viewports=[{name:'1419',width:1419,height:1000},{name:'871',width:871,height:1000},{name:'430',width:430,height:932}];
const routes=['/','/work','/experiments','/profile','/work/payment','/work/voucher','/work/dbs','/work/booking','/work/daily-hours'];

async function settle(page){
  await page.waitForFunction(()=>document.body?.innerText.trim().length>40);
  await page.evaluate(async()=>{
    const step=Math.max(320,Math.floor(innerHeight*.75));
    for(let y=0;y<document.documentElement.scrollHeight;y+=step){window.scrollTo(0,y);await new Promise(resolve=>setTimeout(resolve,30))}
    window.scrollTo(0,0);
    document.querySelectorAll('[data-motion-reveal]').forEach(node=>node.classList.add('is-inview'));
    document.querySelectorAll('.csv2-reveal,.csv2-lifecycle-model').forEach(node=>node.classList.add('is-visible'));
    await Promise.all([...document.images].filter(image=>image.getClientRects().length).map(async image=>{image.loading='eager';try{await image.decode()}catch{}}));
  });
  await page.waitForTimeout(250);
}

try{
  for(const viewport of viewports){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:viewport.name==='430'?'reduce':'no-preference'});
    await context.addInitScript(()=>localStorage.setItem('portfolioLang','zh'));
    await context.addInitScript({path:axePath});
    const page=await context.newPage();
    const consoleErrors=[];
    const runtimeErrors=[];
    page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});
    page.on('pageerror',error=>runtimeErrors.push(error.message));
    if(process.env.PREVIEW_ACCESS_URL)await page.goto(process.env.PREVIEW_ACCESS_URL,{waitUntil:'networkidle'});

    for(const route of routes){
      const response=await page.goto(`${base}${route}`,{waitUntil:'networkidle'});
      if(route==='/work/daily-hours')await page.locator('[data-case-study-v2-root][data-csv2-mounted="true"]').waitFor();
      if(['/work/payment','/work/voucher','/work/dbs','/work/booking'].includes(route))await page.locator('#detailDialog[open]').waitFor();
      await settle(page);
      const state=await page.evaluate(()=>({
        lang:document.documentElement.lang,
        localeControls:document.querySelectorAll('[data-lang-toggle]').length,
        localeLabels:[...document.querySelectorAll('button,a')].filter(node=>/^(EN\s*[\/]\s*中文|中文\s*[\/]\s*EN)$/i.test(node.textContent.trim())).map(node=>node.outerHTML),
        overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),
        broken:[...document.images].filter(image=>(image.currentSrc||image.getAttribute('src'))&&image.complete&&image.naturalWidth===0).map(image=>image.currentSrc||image.src),
        title:document.title,
        bodyLength:document.body.innerText.trim().length
      }));
      const record={viewport:viewport.name,route,status:response?.status(),...state};
      results.push(record);
      if(record.status!==200||record.lang!=='en'||record.localeControls||record.localeLabels.length||record.overflow||record.broken.length||record.bodyLength<40)failures.push(record);
    }

    await page.goto(`${base}/work`,{waitUntil:'networkidle'});
    const dailyWork=page.locator('[data-public-work-route="/work/daily-hours"]');
    const workState={
      count:await dailyWork.count(),
      href:await dailyWork.first().getAttribute('href'),
      text:(await dailyWork.first().innerText()).replace(/\s+/g,' ').trim()
    };
    if(workState.count!==1||workState.href!=='/work/daily-hours'||!workState.text.includes('Daily Hours')||!workState.text.includes('0→1 Product')||!workState.text.includes('A freelance project-economics and decision workspace.'))failures.push({viewport:viewport.name,check:'work identity',...workState});

    await page.locator('.header-search-v114').click();
    await page.locator('#globalSearchInput').fill('Daily Hours');
    await page.locator('.global-search-v114__form').evaluate(form=>form.requestSubmit());
    await page.locator('.global-search-v114__results:not([hidden])').waitFor();
    const searchState=await page.evaluate(()=>({
      dailyWork:[...document.querySelectorAll('.global-search-v114__results [data-public-work-route="/work/daily-hours"]')].map(node=>node.textContent.replace(/\s+/g,' ').trim()),
      oldExperiment:document.querySelectorAll('.global-search-v114__results [data-experiment="freelance-project-operations-tool"]').length
    }));
    if(searchState.dailyWork.length!==1||searchState.oldExperiment||!searchState.dailyWork[0].includes('A freelance project-economics and decision workspace.'))failures.push({viewport:viewport.name,check:'search identity',...searchState});
    await page.keyboard.press('Escape');

    await page.goto(`${base}/experiments`,{waitUntil:'networkidle'});
    const experimentState=await page.evaluate(()=>({
      unique:[...new Set([...document.querySelectorAll('[data-experiment]')].map(node=>node.dataset.experiment))].sort(),
      daily:document.querySelectorAll('[data-experiment="freelance-project-operations-tool"]').length,
      text:document.body.innerText
    }));
    if(experimentState.daily||JSON.stringify(experimentState.unique)!==JSON.stringify(expectedExperiments)||experimentState.text.includes('Daily Hours'))failures.push({viewport:viewport.name,check:'experiment retirement',...experimentState,expectedExperiments});

    await page.goto(`${base}/experiments?experiment=daily-hours`,{waitUntil:'domcontentloaded'});
    await page.waitForURL(url=>url.pathname==='/work/daily-hours');
    await page.locator('[data-case-study-v2-root][data-csv2-mounted="true"]').waitFor();
    const redirectState={url:page.url(),canonical:await page.locator('link[rel="canonical"]').getAttribute('href')};
    if(new URL(redirectState.url).pathname!=='/work/daily-hours'||redirectState.canonical!=='https://shulinchou.com/work/daily-hours')failures.push({viewport:viewport.name,check:'legacy redirect',...redirectState});

    for(const route of ['/work','/experiments','/work/daily-hours']){
      await page.goto(`${base}${route}`,{waitUntil:'networkidle'});
      const violations=await page.evaluate(async()=>{const audit=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return audit.violations.filter(item=>['critical','serious'].includes(item.impact)).map(item=>item.id)});
      if(violations.length)failures.push({viewport:viewport.name,route,check:'axe',violations});
    }

    const screenshots=viewport.name==='871'?['/work','/work/daily-hours']:(viewport.name==='1419'?['/','/work','/work/daily-hours','/experiments','/work/payment']:['/','/work','/work/daily-hours','/experiments','/work/payment']);
    for(const route of screenshots){
      await page.goto(`${base}${route}`,{waitUntil:'networkidle'});
      if(route==='/work/daily-hours')await page.locator('[data-case-study-v2-root][data-csv2-mounted="true"]').waitFor();
      if(route==='/work/payment')await page.locator('#detailDialog[open]').waitFor();
      await settle(page);
      const name=(route==='/'?'home':route.slice(1).replaceAll('/','-'));
      await page.screenshot({path:path.join(output,`${name}-${viewport.name}.png`),fullPage:true});
    }
    if(consoleErrors.length||runtimeErrors.length)failures.push({viewport:viewport.name,check:'runtime errors',consoleErrors,runtimeErrors});
    await context.close();
  }
}finally{
  await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
}

await fs.promises.writeFile(path.join(output,'results.json'),JSON.stringify({base,results,failures},null,2));
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exitCode=1}
else console.log(JSON.stringify({status:'PASS',base,viewports:viewports.map(item=>item.name),routes:routes.length,screenshots:await fs.promises.readdir(output)},null,2));
