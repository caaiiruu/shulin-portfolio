import { chromium } from 'playwright';
import fs from 'node:fs';

const base=process.env.BASE_URL||'http://127.0.0.1:3002';
const ids=['freelance-project-operations-tool','weekly-design-session','food-testing-workshop','aja-creative-workshop','capture-ideas','aha-creative-toolbox','hello-sabau'];
const eligibleIds=[...ids];
const widths=[1419,871,430];
const evidenceDir=process.env.EVIDENCE_DIR||'/tmp/r1838e-experiment-qa';
fs.mkdirSync(evidenceDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
let failed=false;
const indexPage=await browser.newPage({viewport:{width:1419,height:1000}});
await indexPage.goto(`${base}/site/experiments.html`,{waitUntil:'networkidle'});
const discovery=await indexPage.evaluate(()=>({cards:document.querySelectorAll('#experimentPageRail [data-experiment]').length,indexHidden:document.querySelector('#experimentIndex')?.hidden,navLinks:document.querySelectorAll('a[href="/site/experiments.html"]').length,metaRefresh:Boolean(document.querySelector('meta[http-equiv="refresh"]')),runtimeCount:Object.keys(window.PORTFOLIO_RUNTIME_DATA?.experiments||{}).length}));
await indexPage.screenshot({path:`${evidenceDir}/experiment-index-1419.png`,fullPage:true});
await indexPage.close();
if(discovery.cards!==eligibleIds.length||discovery.indexHidden||discovery.navLinks<2||discovery.metaRefresh||discovery.runtimeCount!==eligibleIds.length)failed=true;
for(const id of ids){
  for(const width of widths){
    const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});
    const errors=[];
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`${base}/site/work.html`,{waitUntil:'networkidle'});
    const projected=await page.evaluate(id=>Boolean(window.PORTFOLIO_RUNTIME_DATA?.experiments?.[id]),id);
    if(projected){
      await page.evaluate(id=>{const button=document.createElement('button');button.dataset.experiment=id;document.body.append(button);button.click()},id);
      await page.locator('#detailDialog[open]').waitFor();
      await page.locator('#experimentStory').waitFor();
      await page.evaluate(async()=>{const root=document.querySelector('#detailDialog .dialog-scroll');if(!root)return;for(let top=0;top<=root.scrollHeight;top+=600){root.scrollTop=top;await new Promise(resolve=>setTimeout(resolve,35))}root.scrollTop=0});
      await page.waitForTimeout(120);
    }
    const audit=await page.evaluate(({id,projected})=>{
      const dialog=document.querySelector('#detailDialog');
      const scroll=dialog?.querySelector('.dialog-scroll');
      const story=document.querySelector('#experimentStory');
      const images=[...(dialog?.querySelectorAll('.experiment-hero-v1838e img,.experiment-story-v1838e img')||[])];
      const sections=[...(story?.querySelectorAll('[data-experiment-section]')||[])].map(node=>node.dataset.experimentSection);
      const imageAudit=images.map(image=>{const rect=image.getBoundingClientRect();const owner=scroll?.getBoundingClientRect();return {src:image.currentSrc,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,contained:!owner||rect.left>=owner.left-1&&rect.right<=owner.right+1}});
      return {id,projected,open:dialog?.open||false,title:document.querySelector('#detailTitle')?.textContent?.trim(),maturity:document.querySelector('#detailInfoExperiment')?.textContent?.trim(),sections,hasContribution:sections.includes('contribution'),hasBoundary:sections.includes('delivery-boundary'),horizontalOverflow:scroll?scroll.scrollWidth-scroll.clientWidth:null,imageAudit,bodyOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    },{id,projected});
    const shouldProject=eligibleIds.includes(id);
    const pass=shouldProject
      ? audit.projected&&audit.open&&audit.title&&audit.maturity&&audit.hasContribution&&audit.hasBoundary&&audit.horizontalOverflow===0&&audit.bodyOverflow===0&&audit.imageAudit.every(image=>image.naturalWidth>0&&image.naturalHeight>0&&image.contained)&&errors.length===0
      : !audit.projected&&!audit.open&&errors.length===0;
    results.push({...audit,width,errors,pass});
    if(!pass)failed=true;
    if(audit.open)await page.screenshot({path:`${evidenceDir}/${id}-${width}.png`,fullPage:true});
    await page.close();
  }
}
await browser.close();
fs.writeFileSync(`${evidenceDir}/results.json`,JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({discovery,total:results.length,passed:results.filter(result=>result.pass).length,failed:results.filter(result=>!result.pass).map(result=>({id:result.id,width:result.width,errors:result.errors,overflow:result.horizontalOverflow,bodyOverflow:result.bodyOverflow,projected:result.projected,images:result.imageAudit}))},null,2));
if(failed)process.exit(1);
