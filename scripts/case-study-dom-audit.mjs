import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base=process.env.BASE_URL||'http://127.0.0.1:3000';
const out=process.env.EVIDENCE_DIR||'/tmp/case-study-evidence';
const projects=[
  ['voucher','/site/work/voucher'],
  ['pdp-initiative','/site/work/voucher?initiative=pdpVoucher2024'],
  ['voucher-center','/site/work/voucher-center'],
  ['payment','/site/work/payment'],
  ['dbs','/site/work/dbs'],
  ['booking','/site/work/booking'],
  ['bandzo','/site/work/bandzo']
];
const viewports=[1440,1280,1024,768,430,390,375,320];
const browser=await chromium.launch({headless:true});
const failures=[];
const report={projects:{},viewports:{}};
const audit=async page=>page.evaluate(()=>{
  const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
  const visual=el=>{const s=getComputedStyle(el);const r=el.getBoundingClientRect();return s.backgroundColor!=='rgba(0, 0, 0, 0)'&&s.backgroundColor!=='transparent'&&parseFloat(s.borderRadius)>4&&r.width>120&&r.height>60&&!el.matches('button,[role="button"],.gallery-thumbs-v45 *')};
  let maxDepth=0;
  for(const leaf of document.querySelectorAll('.case-study-section *')){
    if(!visible(leaf)||leaf.closest('.evidence-lightbox-v147,[data-interactive-prototype]'))continue;
    let depth=0,node=leaf;
    while(node&&node.matches('.case-study-section *')){if(visual(node))depth++;else depth=0;maxDepth=Math.max(maxDepth,depth);node=node.parentElement}
  }
  const sections=[...document.querySelectorAll('.case-study-section')].filter(visible).map(el=>({id:el.dataset.caseStudySection||'',surface:[...el.classList].find(x=>x.startsWith('case-study-section--'))?.replace('case-study-section--','')||'',heading:el.querySelector('.case-study-section__header h2')?.textContent.trim()||''}));
  const cells=[...document.querySelectorAll('.info-grid-v45>div')].filter(visible).map(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,radius:s.borderRadius}});
  const ownership=[...document.querySelectorAll('.ownership-grid-v45>article')].filter(visible).map(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,radius:s.borderRadius}});
  return {majorSectionCount:sections.length,sectionOrder:sections.map(x=>x.id),surfaceVariants:sections.map(x=>`${x.id}:${x.surface}`),maxVisualContainerDepth:maxDepth,headersComplete:sections.every(x=>x.heading),decisionStructure:{count:document.querySelectorAll('.decision-card-v46').length,nestedCards:document.querySelectorAll('.decision-card-v46 .decision-card-v46').length,effects:document.querySelectorAll('.decision-effect-v147').length},impactVariant:document.querySelector('[data-impact-variant]')?.dataset.impactVariant||'none',infoGridCells:cells,ownershipBlocks:ownership,canonicalOrder:document.querySelector('[data-canonical-section-order]')?.dataset.canonicalSectionOrder||''};
});
for(const [id,url] of projects){
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  await page.goto(base+url,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  const result=await audit(page);report.projects[id]=result;
  const transparent=x=>x.background==='rgba(0, 0, 0, 0)'||x.background==='transparent';
  if(!result.majorSectionCount||!result.headersComplete||result.maxVisualContainerDepth>2||result.decisionStructure.nestedCards||result.infoGridCells.some(x=>!transparent(x)||parseFloat(x.radius)>0)||result.ownershipBlocks.some(x=>!transparent(x)||parseFloat(x.radius)>0))failures.push(`${id}: ${JSON.stringify(result)}`);
  const dir=path.join(out,'case-study',id);fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'full-1440.png'),fullPage:true});
  for(const [name,selector] of [['top-two-screens','.project-detail-v45'],['overview-decisions','.detail-overview-v45'],['decision','.decision-section-v45'],['impact','.impact-section-v45'],['ownership','.ownership-section-v45']]){const el=page.locator(selector).first();if(await el.isVisible().catch(()=>false)){await el.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,`${name}-1440.png`),fullPage:false})}}
  await context.close();
}
for(const width of viewports){
  const context=await browser.newContext({viewport:{width,height:width<=430?844:1000}}),page=await context.newPage();
  await page.goto(base+'/site/work/voucher',{waitUntil:'networkidle'});await page.waitForTimeout(300);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  const dir=path.join(out,'case-study',`viewport-${width}`);fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'voucher.png'),fullPage:true});
  await page.goto(base+'/site/work',{waitUntil:'networkidle'});await page.screenshot({path:path.join(dir,'domain.png'),fullPage:true});
  report.viewports[width]={overflow,pass:overflow<=0};if(overflow>0)failures.push(`viewport ${width}: overflow ${overflow}`);await context.close();
}
await browser.close();
fs.writeFileSync(path.join(out,'case-study-dom-audit.json'),JSON.stringify(report,null,2));
if(failures.length)throw new Error(failures.join('\n'));
console.log('PASS: rendered CaseStudySection DOM and screenshots',JSON.stringify(report));
