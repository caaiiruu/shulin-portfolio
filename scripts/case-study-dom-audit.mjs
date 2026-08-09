import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base=process.env.BASE_URL||'http://127.0.0.1:3000';
const out=process.env.EVIDENCE_DIR||'/tmp/case-study-evidence';
const projects=[
  ['voucher','/site/work/voucher'],
  ['voucher-center','/site/work/voucher-center'],
  ['game-center','/site/work/game-center'],
  ['payment','/site/work/payment'],
  ['dbs','/site/work/dbs'],
  ['booking','/site/work/booking'],
  ['bandzo','/site/work/bandzo'],
  ['taishin-p2p-marketplace-platform','/site/work/taishin-p2p-marketplace-platform'],
  ['cathay-mortgage-assistant','/site/work/cathay-mortgage-assistant'],
  ['cathay-sit-online-account-opening','/site/work/cathay-sit-online-account-opening'],
  ['cathay-sit-review-remediation-operations','/site/work/cathay-sit-review-remediation-operations'],
  ['ctbc-mortgage-self-service-app','/site/work/ctbc-mortgage-self-service-app'],
  ['booking-taxi-pickup-service-strategy','/site/work/booking-taxi-pickup-service-strategy']
];
const ssot=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const presentation=ssot.implementationContracts.contentPresentationContract;
const stageUrl='/site/work/voucher?stage=discover';
const viewports=[1440,1280,1024,871,768,430,390,375,320];
const browser=await chromium.launch({headless:true});
const failures=[];
const report={projects:{},stageDecision:{},viewports:{},outcomes:{},geometry:{}};
const localizedValue=(value,locale)=>value&&typeof value==='object'&&!Array.isArray(value)?String(value[locale]||''):String(value||'');
const expectedOutcome=(project,locale)=>{
  const governed=(project.outcomeEvidenceModel||[]).map((item,index)=>{
    if(!item||['private','blocked'].includes(item.publicUse))return null;
    const sourceField=item.claim?'claim':item.publicValue?'publicValue':item.values?'values':'';
    const value=sourceField==='values'?(item.values||[]).map(v=>localizedValue(v,locale)).filter(Boolean).join(' · '):localizedValue(item[sourceField],locale);
    return sourceField&&value?{sourcePath:`outcomeEvidenceModel.${index}.${sourceField}`,value}:null;
  }).filter(Boolean);
  if(governed.length)return governed;
  const fallback=[];
  const completion=project.publicContent?.completionEvidence;
  if(completion?.publicValue&&completion?.label)fallback.push({sourcePath:'publicContent.completionEvidence.publicValue+label',value:`${String(completion.publicValue)} ${localizedValue(completion.label,locale)}`.trim()});
  const walk=(value,path)=>{
    if(!value||fallback.length>=4)return;
    if(value&&typeof value==='object'&&!Array.isArray(value)&&typeof value.en==='string'&&typeof value.zh==='string'){
      const copy=localizedValue(value,locale);
      if(value.en.length>=8&&value.zh.length>=8&&!path.endsWith('.label'))fallback.push({sourcePath:path,value:copy});
      return;
    }
    if(Array.isArray(value))value.forEach((item,index)=>walk(item,`${path}.${index}`));
    else if(typeof value==='object')Object.entries(value).forEach(([key,item])=>walk(item,`${path}.${key}`));
  };
  walk(project.publicContent?.completionEvidence,'publicContent.completionEvidence');
  return fallback;
};
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
  const sections=[...document.querySelectorAll('.case-study-section')].filter(visible).map(el=>({id:el.dataset.caseStudySection||'',canonicalId:el.dataset.canonicalSectionId||'',contentBlockIds:(el.dataset.contentBlockIds||'').split('|').filter(Boolean),surface:[...el.classList].find(x=>x.startsWith('case-study-section--'))?.replace('case-study-section--','')||'',heading:el.querySelector('.case-study-section__header h2')?.textContent.trim()||''}));
  const renderedOrder=sections.filter(x=>x.canonicalId).map(x=>x.canonicalId);
  const evidence=document.querySelector('[data-canonical-section-order]');
  const ssotOrder=(evidence?.dataset.canonicalSectionOrder||'').split(' ').filter(Boolean);
  const mappedOrder=(evidence?.dataset.mappedCanonicalSectionOrder||'').split(' ').filter(Boolean);
  const decisionCards=[...document.querySelectorAll('.decision-card-v46')].filter(visible);
  const disallowedDecisionSurfaces=decisionCards.flatMap((card,index)=>[...card.querySelectorAll('*')].filter(el=>visible(el)&&cardLike(el)&&!allowedDecisionSurface(el)).map(el=>({decision:index+1,tag:el.tagName,className:el.className,background:getComputedStyle(el).backgroundColor,radius:getComputedStyle(el).borderRadius})));
  const cells=[...document.querySelectorAll('.info-grid-v45>div')].filter(visible).map(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,radius:s.borderRadius}});
  const ownership=[...document.querySelectorAll('.ownership-grid-v45>article')].filter(visible).map(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,radius:s.borderRadius}});
  const inset=selector=>{const el=document.querySelector(selector);if(!el||!visible(el))return null;const s=getComputedStyle(el);return {selector,padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft],background:s.backgroundColor,radius:s.borderRadius,sectionOwner:Boolean(el.closest('.case-study-section'))}};
  return {majorSectionCount:sections.length,ssotOrder,mappedOrder,renderedOrder,sections,exactMappedRendered:JSON.stringify(mappedOrder)===JSON.stringify(renderedOrder),surfaceVariants:sections.map(x=>`${x.id}:${x.surface}`),maxVisualContainerDepth:maxDepth,maxVisualContainerPath:maxPath,headersComplete:sections.every(x=>x.heading),decisionStructure:{count:decisionCards.length,disallowedCardLikeSurfaces:disallowedDecisionSurfaces,effects:document.querySelectorAll('.decision-effect-v147').length},impactVariant:document.querySelector('[data-impact-variant]')?.dataset.impactVariant||'none',infoGridCells:cells,ownershipBlocks:ownership,mobileInsetOwners:[inset('.project-context-v45--decision-band'),inset('.quick-view-v51'),inset('.gallery-copy-v45'),inset('.gallery-thumbs-v45')].filter(Boolean)};
});
const requiredContent=(id)=>{
  const project=ssot.projects[id],specific=presentation.projects[id]?.sections||{};
  return (project.sectionOrder||[]).flatMap(sectionId=>{
    const item=specific[sectionId];
    if(!item?.renderRequired)return [];
    return (item.sourcePaths||[]).map(sourcePath=>({sectionId,sourcePath}));
  });
};
const check=(id,result)=>{
  const transparent=x=>x.background==='rgba(0, 0, 0, 0)'||x.background==='transparent';
  if(!result.majorSectionCount||!result.headersComplete||!result.exactMappedRendered||result.maxVisualContainerDepth>2||result.decisionStructure.disallowedCardLikeSurfaces.length||result.infoGridCells.some(x=>!transparent(x)||parseFloat(x.radius)>0)||result.ownershipBlocks.some(x=>!transparent(x)||parseFloat(x.radius)>0))failures.push(`${id}: ${JSON.stringify(result)}`);
  if(ssot.projects[id])for(const block of requiredContent(id)){
    const section=result.sections.find(item=>item.canonicalId===block.sectionId);
    if(!section||!section.contentBlockIds.includes(block.sourcePath))failures.push(`${id}: missing visible render chain for ${block.sourcePath} → ${block.sectionId}`);
  }
};
for(const [id,url] of projects){
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  await page.goto(base+url,{waitUntil:'networkidle'});await page.waitForTimeout(500);
  const result=await audit(page);report.projects[id]=result;check(id,result);
  const dir=path.join(out,'case-study',id);fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'full-1440.png'),fullPage:true});
  const expectedEn=expectedOutcome(ssot.projects[id],'en');
  const renderedEn=await page.locator('[data-outcome-source-path]').evaluateAll(nodes=>nodes.map(node=>({sourcePath:node.dataset.outcomeSourcePath,value:(node.matches('div')?node.querySelector('dd')?.textContent:node.textContent)?.trim()||'',visible:Boolean(node.getClientRects().length)&&getComputedStyle(node).visibility!=='hidden'})));
  const outcome=page.locator('[data-outcome-exact-projection="true"]').first();
  if(await outcome.isVisible().catch(()=>false)){await outcome.scrollIntoViewIfNeeded();await page.addStyleTag({content:'.site-header,#detailClose,#detailBack,.dialog-controls-v67,.pd-section-nav,[data-skip-link]{display:none!important}'});await outcome.screenshot({path:path.join(dir,'outcome-1440.png')})}
  const matchEn=JSON.stringify(renderedEn.map(x=>({sourcePath:x.sourcePath,value:x.value})))===JSON.stringify(expectedEn);
  if(!matchEn||renderedEn.some(x=>!x.visible)||!renderedEn.length)failures.push(`${id}: exact EN Outcome projection failed ${JSON.stringify({expectedEn,renderedEn})}`);
  report.outcomes[id]={expectedEn,renderedEn,matchEn};
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
for(const [id,url] of projects){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(()=>localStorage.setItem('portfolioLang','zh'));
  const page=await context.newPage();
  await page.goto(base+url,{waitUntil:'networkidle'});
  await page.locator('[data-outcome-exact-projection="true"]:visible').first().waitFor({state:'visible'});
  await page.waitForFunction(()=>window.getPortfolioLanguage?.()==='zh');
  const dir=path.join(out,'case-study',id);fs.mkdirSync(dir,{recursive:true});
  await page.screenshot({path:path.join(dir,'full-390.png'),fullPage:true});
  const expectedZh=expectedOutcome(ssot.projects[id],'zh');
  const renderedZh=await page.locator('[data-outcome-source-path]').evaluateAll(nodes=>nodes.map(node=>({sourcePath:node.dataset.outcomeSourcePath,value:(node.matches('div')?node.querySelector('dd')?.textContent:node.textContent)?.trim()||'',visible:Boolean(node.getClientRects().length)&&getComputedStyle(node).visibility!=='hidden',fontSize:parseFloat(getComputedStyle(node).fontSize),opacity:parseFloat(getComputedStyle(node).opacity)})));
  const outcome=page.locator('[data-outcome-exact-projection="true"]').first();
  if(await outcome.isVisible().catch(()=>false)){await outcome.scrollIntoViewIfNeeded();await page.addStyleTag({content:'.site-header,#detailClose,#detailBack,.dialog-controls-v67,.pd-section-nav,[data-skip-link]{display:none!important}'});await outcome.screenshot({path:path.join(dir,'outcome-390.png')})}
  const matchZh=JSON.stringify(renderedZh.map(x=>({sourcePath:x.sourcePath,value:x.value})))===JSON.stringify(expectedZh);
  const readable=renderedZh.length&&renderedZh.every(x=>x.visible&&x.fontSize>=14&&x.opacity>=.75&&x.value.length>=8);
  if(!matchZh||!readable)failures.push(`${id}: exact ZH/readable Outcome projection failed ${JSON.stringify({expectedZh,renderedZh})}`);
  const edge=await page.evaluate(()=>{const outcome=document.querySelector('[data-outcome-exact-projection="true"]');const section=outcome?.closest('.case-study-section');const header=section?.querySelector(':scope > .case-study-section__header');const primary=outcome?.querySelector('[data-outcome-source-path]');const business=outcome?.querySelector('.impact-evidence-v147__business-impact');const xs=[header,primary,business].filter(el=>el&&el.getClientRects().length).map(el=>Math.round(el.getBoundingClientRect().left*10)/10);return {xs,deviation:xs.length?Math.max(...xs)-Math.min(...xs):0,gutter:xs[0]||0}});
  if(edge.deviation>1)failures.push(`${id}: mobile Outcome reading-edge deviation ${edge.deviation}px`);
  report.outcomes[id]={...report.outcomes[id],expectedZh,renderedZh,matchZh,readable};
  report.geometry[id]={mobile390:edge};
  await context.close();
}
{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
  await page.goto(base+'/site/work',{waitUntil:'networkidle'});
  const domainDir=path.join(out,'domains');fs.mkdirSync(domainDir,{recursive:true});
  const domainControls=page.locator('[data-domain-id], [data-domain-filter], .domain-selector button');
  const domainCount=Math.min(6,await domainControls.count());
  for(let i=0;i<domainCount;i++){const control=domainControls.nth(i);if(await control.isVisible().catch(()=>false)){await control.click();await page.waitForTimeout(150);await page.screenshot({path:path.join(domainDir,`domain-${i+1}.png`),fullPage:true})}}
  await page.goto(base+'/site',{waitUntil:'networkidle'});
  const searchDir=path.join(out,'search');fs.mkdirSync(searchDir,{recursive:true});
  const search=page.locator('input[type="search"], [data-search-input]').first();
  for(const [i,query] of ['payment','voucher','banking'].entries()){if(await search.isVisible().catch(()=>false)){await search.fill(query);await page.waitForTimeout(300);await page.screenshot({path:path.join(searchDir,`search-${i+1}-${query}.png`),fullPage:true})}}
  await context.close();
}
await browser.close();
fs.writeFileSync(path.join(out,'case-study-dom-audit.json'),JSON.stringify(report,null,2));
if(failures.length)throw new Error(failures.join('\n'));
console.log('PASS: canonical section order, mobile ownership and computed visual-container audit',JSON.stringify(report));
