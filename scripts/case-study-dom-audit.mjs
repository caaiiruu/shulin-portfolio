import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base=process.env.BASE_URL||'http://127.0.0.1:3000';
const out=process.env.EVIDENCE_DIR||'/tmp/case-study-evidence';
const projects=[
  ['voucher','/site/work/voucher'],
  ['pdp-initiative','/site/work/voucher?stage=discover'],
  ['voucher-center','/site/work/voucher-center'],
  ['payment','/site/work/payment'],
  ['dbs','/site/work/dbs'],
  ['booking','/site/work/booking'],
  ['bandzo','/site/work/bandzo']
];
const stageUrl='/site/work/voucher?stage=discover';
const viewports=[1440,1280,1024,768,430,390,375,320];
const browser=await chromium.launch({headless:true});
const failures=[];
const report={projects:{},stageDecision:{},viewports:{}};
const audit=async page=>page.evaluate(()=>{
  const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
  const transparent=color=>color==='rgba(0, 0, 0, 0)'||color==='transparent'||/rgba\([^)]*,\s*0\)$/.test(color);
  const px=value=>Number.parseFloat(value)||0;
  const hasVisibleBorder=s=>['Top','Right','Bottom','Left'].some(side=>px(s['border'+side+'Width'])>0&&s['border'+side+'Style']!=='none'&&!transparent(s['border'+side+'Color']));
  const hasInset=s=>['paddingTop','paddingRight','paddingBottom','paddingLeft'].some(key=>px(s[key])>0);
  const cardLike=el=>{const s=getComputedStyle(el);return !transparent(s.backgroundColor)&&(px(s.borderRadius)>0||hasVisibleBorder(s)||hasInset(s))};
  const allowedDecisionSurface=el=>Boolean(el.closest('.decision-number-v48,.decision-visual-v58,.decision-effect-v147,.decision-considerations-v46,button,[role="button"]'));
  const majorContainer=el=>{const r=el.getBoundingClientRect();return r.width>120&&r.height>60&&cardLike(el)};
  let maxDepth=0,maxPath=[];
  for(const leaf of document.querySelectorAll('.case-study-section *')){
    if(!visible(leaf)||leaf.closest('.evidence-lightbox-v147,[data-interactive-prototype],.decision-visual-v58,.gallery-stage-v45,.gallery-thumbs-v45,.key-intervention-map,.interactive-flow-v195,.programme-stage-visual__frame,.voucher-foundation-gallery__visual'))continue;
    let depth=0,node=leaf,encountered=[];
    while(node&&node.closest('.case-study-section')){if(majorContainer(node)){depth++;encountered.push(node.className||node.tagName)}if(depth>maxDepth){maxDepth=depth;maxPath=[...encountered]}node=node.parentElement}
  }
  const sections=[...document.querySelectorAll('.case-study-section')].filter(visible).map(el=>({id:el.dataset.caseStudySection||'',canonicalId:el.dataset.canonicalSectionId||'',surface:[...el.classList].find(x=>x.startsWith('case-study-section--'))?.replace('case-study-section--','')||'',heading:el.querySelector('.case-study-section__header h2')?.textContent.trim()||''}));
  const renderedOrder=sections.filter(x=>x.canonicalId).map(x=>x.canonicalId);
  const evidence=document.querySelector('[data-canonical-section-order]');
  const ssotOrder=(evidence?.dataset.canonicalSectionOrder||'').split(' ').filter(Boolean);
  const mappedOrder=(evidence?.dataset.mappedCanonicalSectionOrder||'').split(' ').filter(Boolean);
  const decisionCards=[...document.querySelectorAll('.decision-card-v46')].filter(visible);
  const disallowedDecisionSurfaces=decisionCards.flatMap((card,index)=>[...card.querySelectorAll('*')].filter(el=>visible(el)&&cardLike(el)&&!allowedDecisionSurface(el)).map(el=>({decision:index+1,tag:el.tagName,className:el.className,background:getComputedStyle(el).backgroundColor,radius:getComputedStyle(el).borderRadius})));
  const cells=[...document.querySelectorAll('.info-grid-v45>div')].filter(visible).map(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,radius:s.borderRadius}});
  const ownership=[...document.querySelectorAll('.ownership-grid-v45>article')].filter(visible).map(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,radius:s.borderRadius}});
  const inset=selector=>{const el=document.querySelector(selector);if(!el||!visible(el))return null;const s=getComputedStyle(el);return {selector,padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft],background:s.backgroundColor,radius:s.borderRadius,sectionOwner:Boolean(el.closest('.case-study-section'))}};
  return {majorSectionCount:sections.length,ssotOrder,mappedOrder,renderedOrder,exactMappedRendered:JSON.stringify(mappedOrder)===JSON.stringify(renderedOrder),surfaceVariants:sections.map(x=>`${x.id}:${x.surface}`),maxVisualContainerDepth:maxDepth,maxVisualContainerPath:maxPath,headersComplete:sections.every(x=>x.heading),decisionStructure:{count:decisionCards.length,disallowedCardLikeSurfaces:disallowedDecisionSurfaces,effects:document.querySelectorAll('.decision-effect-v147').length},impactVariant:document.querySelector('[data-impact-variant]')?.dataset.impactVariant||'none',infoGridCells:cells,ownershipBlocks:ownership,mobileInsetOwners:[inset('.project-context-v45--decision-band'),inset('.quick-view-v51'),inset('.gallery-copy-v45'),inset('.gallery-thumbs-v45')].filter(Boolean)};
});
const check=(id,result)=>{
  const transparent=x=>x.background==='rgba(0, 0, 0, 0)'||x.background==='transparent';
  if(!result.majorSectionCount||!result.headersComplete||!result.exactMappedRendered||result.maxVisualContainerDepth>2||result.decisionStructure.disallowedCardLikeSurfaces.length||result.infoGridCells.some(x=>!transparent(x)||parseFloat(x.radius)>0)||result.ownershipBlocks.some(x=>!transparent(x)||parseFloat(x.radius)>0))failures.push(`${id}: ${JSON.stringify(result)}`);
};
for(const [id,url] of projects){
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  await page.goto(base+url,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  const result=await audit(page);report.projects[id]=result;check(id,result);
  const dir=path.join(out,'case-study',id);fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'full-1440.png'),fullPage:true});
  for(const [name,selector] of [['top-two-screens','.project-detail-v45'],['overview-decisions','.detail-overview-v45'],['decision','.decision-section-v45'],['impact','.impact-section-v45'],['ownership','.ownership-section-v45']]){const el=page.locator(selector).first();if(await el.isVisible().catch(()=>false)){await el.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(dir,`${name}-1440.png`),fullPage:false})}}
  await context.close();
}
{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  await page.goto(base+stageUrl,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  report.stageDecision=await audit(page);check('voucher-stage',report.stageDecision);if(!report.stageDecision.decisionStructure.count)failures.push('voucher-stage: no rendered shared Decision found');
  const dir=path.join(out,'case-study','voucher-stage');fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'decision-1440.png'),fullPage:true});
  await context.close();
}
for(const width of viewports){
  const context=await browser.newContext({viewport:{width,height:width<=430?844:1000}}),page=await context.newPage();
  await page.goto(base+'/site/work/voucher',{waitUntil:'networkidle'});await page.waitForTimeout(300);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  const structure=await audit(page);
  const horizontalInset=structure.mobileInsetOwners.filter(item=>parseFloat(item.padding[1])>0||parseFloat(item.padding[3])>0);
  const dir=path.join(out,'case-study',`viewport-${width}`);fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'voucher.png'),fullPage:true});
  await page.goto(base+stageUrl,{waitUntil:'networkidle'});await page.waitForTimeout(200);
  const stage=await audit(page);await page.screenshot({path:path.join(dir,'voucher-stage.png'),fullPage:true});
  await page.goto(base+'/site/work',{waitUntil:'networkidle'});await page.screenshot({path:path.join(dir,'domain.png'),fullPage:true});
  report.viewports[width]={overflow,horizontalLegacyInsets:horizontalInset,stageDecisionSurfaces:stage.decisionStructure.disallowedCardLikeSurfaces,pass:overflow<=0&&!horizontalInset.length&&!stage.decisionStructure.disallowedCardLikeSurfaces.length};
  if(!report.viewports[width].pass)failures.push(`viewport ${width}: ${JSON.stringify(report.viewports[width])}`);
  await context.close();
}
await browser.close();
fs.writeFileSync(path.join(out,'case-study-dom-audit.json'),JSON.stringify(report,null,2));
if(failures.length)throw new Error(failures.join('\n'));
console.log('PASS: canonical section order, mobile ownership and computed visual-container audit',JSON.stringify(report));