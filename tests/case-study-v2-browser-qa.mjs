import fs from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import path from 'node:path';

const require=createRequire(import.meta.url);
const axePath=require.resolve('axe-core/axe.min.js');
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
    const proofCaptionCount=await page.locator('.csv2-proof-caption').count();
    const initialDisclosure=page.locator('.csv2-disclosure');await initialDisclosure.click();
    const redundantEvidenceCaptions=await page.locator('.csv2-evidence-caption').allTextContents();
    const connectedContext=await page.evaluate(()=>{
      const image=[...document.querySelectorAll('[data-csv2-asset="daily-hours-project-health-context"]')].find(item=>item.getBoundingClientRect().width>0);
      const frame=image?.closest('.csv2-evidence-frame');
      if(!image||!frame)return null;
      const frameRect=frame.getBoundingClientRect();const imageRect=image.getBoundingClientRect();
      return{frameWidth:frameRect.width,frameHeight:frameRect.height,imageWidth:imageRect.width,imageHeight:imageRect.height,contained:imageRect.width<=frameRect.width&&imageRect.height<=frameRect.height};
    });
    await initialDisclosure.click();
    const tabs=page.locator('.csv2-decision-tab');await tabs.nth(1).click();
    await page.waitForFunction(()=>document.querySelector('.csv2-decision-title')?.textContent==='Attention');
    const attention=await page.locator('.csv2-decision-title').textContent();
    await tabs.nth(1).press('ArrowRight');
    await page.waitForFunction(()=>document.querySelector('.csv2-decision-title')?.textContent==='Lifecycle');
    const lifecycle=await page.locator('.csv2-decision-title').textContent();
    await tabs.nth(1).click();
    await page.waitForFunction(()=>document.querySelector('.csv2-decision-title')?.textContent==='Attention');
    const disclosure=page.locator('.csv2-disclosure');await disclosure.click();
    let interaction;
    if(viewport.width<=600){
      const accordions=page.locator('.csv2-accordion-summary');await accordions.nth(1).click();
      interaction={mode:'accordion',open:await accordions.nth(1).getAttribute('aria-expanded'),first:await accordions.nth(0).getAttribute('aria-expanded'),focusRetained:await accordions.nth(1).evaluate(element=>document.activeElement===element)};
    }else{
      const evidenceTabs=page.locator('.csv2-evidence-index-button');await evidenceTabs.nth(0).press('ArrowRight');
      interaction={mode:'indexed-explorer',visible:await page.locator('#csv2EvidenceBody').isVisible(),tabs:await evidenceTabs.count(),secondSelected:await evidenceTabs.nth(1).getAttribute('aria-selected'),focusMoved:await evidenceTabs.nth(1).evaluate(element=>document.activeElement===element)};
    }
    await disclosure.click();const evidenceClosed=await disclosure.getAttribute('aria-expanded');
    await tabs.nth(0).click();
    await page.waitForFunction(()=>document.querySelector('.csv2-decision-title')?.textContent==='Project health');
    await disclosure.click();
    await revealFullPage(page);
    const cta=page.locator('.csv2-cta');
    const ctaState=await cta.evaluate(element=>{const rect=element.getBoundingClientRect();const icon=element.querySelector('.csv2-icon');const label=element.querySelector('.csv2-cta-label');const copy=element.parentElement.querySelector('.csv2-demo-copy').getBoundingClientRect();const labelRange=document.createRange();labelRange.selectNodeContents(label);return{href:element.getAttribute('href'),fits:rect.left>=0&&rect.right<=innerWidth,tag:element.tagName,before:getComputedStyle(icon).transform,labelLines:labelRange.getClientRects().length,stacked:rect.top>=copy.bottom}});
    await cta.hover();await page.waitForTimeout(240);
    const hoverTransform=await cta.locator('.csv2-icon').evaluate(element=>getComputedStyle(element).transform);
    await cta.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
    const focusState=await cta.evaluate(element=>({outline:getComputedStyle(element).outlineStyle,outlineWidth:getComputedStyle(element).outlineWidth}));
    await cta.evaluate(element=>{window.__csv2CtaKeyboard=false;element.addEventListener('click',event=>{event.preventDefault();window.__csv2CtaKeyboard=true},{once:true})});
    await cta.press('Enter');const keyboardActivated=await page.evaluate(()=>window.__csv2CtaKeyboard===true);
    await page.addScriptTag({path:axePath});
    const axeViolations=await page.evaluate(async()=>{const audit=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return audit.violations.filter(item=>['critical','serious'].includes(item.impact)).map(item=>({id:item.id,impact:item.impact,nodes:item.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}))});
    const ending=await page.evaluate(()=>({
      wave:getComputedStyle(document.querySelector('.site-footer'),'::before').content,
      legacyContactVisible:document.querySelector('.contact-bar-v42')?.getClientRects().length>0,
      redLegacyCta:Boolean([...document.querySelectorAll('.site-footer a')].find(link=>getComputedStyle(link).backgroundColor==='rgb(225, 57, 72)')),
      outcomes:[...document.querySelectorAll('.csv2-outcome strong')].map(item=>item.textContent),
      outcomeIndices:[...document.querySelectorAll('.csv2-outcome')].map(card=>{const index=card.querySelector('.csv2-outcome-index');const cardRect=card.getBoundingClientRect();const indexRect=index.getBoundingClientRect();return{text:index.textContent,topRight:indexRect.top>=cardRect.top&&indexRect.top<cardRect.top+60&&indexRect.right<=cardRect.right&&indexRect.right>cardRect.right-60}}),
      sections:[...document.querySelectorAll('main > section')].map(item=>item.dataset.csv2Section),
      footerAfterMain:Boolean(document.querySelector('main + footer'))
    }));
    await page.screenshot({path:path.join(output,`daily-hours-${viewport.name}.png`),fullPage:true});
    const result={viewport:viewport.name,route:'/work/daily-hours',status:response?.status(),overflow:initial.overflow,consoleErrors:[...consoleErrors,...runtimeErrors],brokenMedia:initial.broken,proofCaptionCount,redundantEvidenceCaptions,connectedContext,interaction,evidenceClosed,cta:{...ctaState,hoverTransform,focusState,keyboardActivated},ending,axeViolations,attention,lifecycle,sections:initial.sections};
    results.push(result);
    const expectedSections=['hero','first-question','the-shift','three-decisions','what-changed','outcomes','next-question','request-demo'];
    const expectedOutcomes=['Live product','~2 days','Continuous iteration'];
    const expectedOutcomeIndices=['01','02','03'];
    if(result.status!==200||result.overflow>0||result.consoleErrors.length||result.brokenMedia.length||initial.play||initial.zh.some(item=>!item.disabled||item.aria!=='true')||proofCaptionCount!==0||redundantEvidenceCaptions.length||!connectedContext?.contained||Math.abs(connectedContext.frameWidth/connectedContext.frameHeight-36/25)>.03||attention!=='Attention'||lifecycle!=='Lifecycle'||evidenceClosed!=='false'||interaction.focusRetained===false||interaction.secondSelected==='false'||interaction.focusMoved===false||ctaState.tag!=='A'||!ctaState.href?.startsWith('mailto:r.c.shulin@gmail.com?subject=Daily%20Hours%20demo%20access%20request')||!ctaState.fits||ctaState.labelLines!==1||(viewport.name==='430'&&!ctaState.stacked)||(viewport.name!=='430'&&hoverTransform===ctaState.before)||focusState.outline==='none'||focusState.outlineWidth==='0px'||!keyboardActivated||axeViolations.length||ending.wave!=='none'||ending.legacyContactVisible||ending.redLegacyCta||!ending.footerAfterMain||JSON.stringify(ending.sections)!==JSON.stringify(expectedSections)||JSON.stringify(ending.outcomes)!==JSON.stringify(expectedOutcomes)||JSON.stringify(ending.outcomeIndices.map(item=>item.text))!==JSON.stringify(expectedOutcomeIndices)||ending.outcomeIndices.some(item=>!item.topRight))failures.push(result);
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
