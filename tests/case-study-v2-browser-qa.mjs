import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');

const baseUrl=process.env.BASE_URL||'http://127.0.0.1:3000';
const evidenceDir=process.env.EVIDENCE_DIR||'/tmp/case-study-v2-browser-qa';
const viewports=[
  {name:'mobile-430',width:430,height:932},
  {name:'tablet-871',width:871,height:1024},
  {name:'desktop-1419',width:1419,height:900}
];
const failures=[];
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});

for(const viewport of viewports){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},hasTouch:viewport.width===430,isMobile:viewport.width===430});
  const page=await context.newPage();
  const runtimeErrors=[];page.on('pageerror',error=>runtimeErrors.push(error.message));
  const response=await page.goto(`${baseUrl}/work/daily-hours`,{waitUntil:'networkidle'});
  if(!response?.ok())failures.push(`${viewport.name}: HTTP ${response?.status()}`);
  try{await page.locator('.decision-explorer').waitFor({state:'visible',timeout:10000})}catch(error){
    fs.mkdirSync(evidenceDir,{recursive:true});await page.screenshot({path:path.join(evidenceDir,`${viewport.name}-load-failure.png`),fullPage:true});
    failures.push(`${viewport.name}: Decision Explorer did not render; title=${await page.title()}; body=${(await page.locator('body').innerText()).slice(0,500)}; runtime=${runtimeErrors.join(' | ')||error.message}`);
    await context.close();continue;
  }
  const result=await page.evaluate(()=>{
    const visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=='none'&&node.getClientRects().length);
    const tabs=[...document.querySelectorAll('.decision-explorer__tab')];
    const stories=[...document.querySelectorAll('.decision-explorer__story')];
    const selector=document.querySelector('.decision-explorer__selector')?.getBoundingClientRect();
    const selected=stories.find(visible)?.getBoundingClientRect();
    return {
      labels:tabs.map(tab=>tab.textContent.trim()),
      selectedTabs:tabs.filter(tab=>tab.getAttribute('aria-selected')==='true').length,
      visibleStories:stories.filter(visible).length,
      primaryProofVisible:Boolean(document.querySelector('.decision-explorer__story:not([hidden]) .decision-explorer__primary-proof .evidence-frame')),
      explorerTriggers:[...document.querySelectorAll('.decision-explorer__story:not([hidden]) .evidence-explorer__trigger')].filter(visible).length,
      openingMedia:Boolean(document.querySelector('.case-study-v2-opening .evidence-frame video')),
      supportCounts:[...document.querySelectorAll('.decision-explorer__story')].map(story=>story.querySelectorAll('.evidence-explorer__index-item').length),
      selectorLeftOfStory:Boolean(selector&&selected&&selector.right<=selected.left),
      selectorAboveStory:Boolean(selector&&selected&&selector.bottom<=selected.top),
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      presentation:document.querySelector('#projectEvidence')?.dataset.presentationContract,
      sectionOrder:document.querySelector('#projectEvidence')?.dataset.canonicalSectionOrder,
      owners:[...document.querySelectorAll('[data-case-study-v2-generated]')].map(node=>node.dataset.componentOwner),
      videos:[...document.querySelectorAll('.decision-explorer video')].map(video=>({controls:video.controls,muted:video.muted,playsInline:video.playsInline,poster:Boolean(video.poster),loop:video.loop}))
    };
  });
  try{
    assert.deepEqual(result.labels,['Project health','Attention','Lifecycle']);
    assert.equal(result.selectedTabs,1);assert.equal(result.visibleStories,1);assert.equal(result.primaryProofVisible,true);assert.equal(result.explorerTriggers,1);
    assert.equal(result.openingMedia,true);assert.deepEqual(result.supportCounts,[3,4,3]);
    assert.equal(result.presentation,'case-study-v2');assert.match(result.sectionOrder,/first-question.*product-reframing.*key-design-decisions.*real-usage-changed-product.*outcomes.*working-product-cta/);
    assert.equal(result.overflow,false);assert.ok(result.owners.includes('Decision'));assert.ok(result.owners.includes('ChangeSequence'));assert.ok(result.owners.includes('ProjectCTA'));
    if(viewport.width===1419)assert.equal(result.selectorLeftOfStory,true);else assert.equal(result.selectorAboveStory,true);
    assert.ok(result.videos.every(video=>video.controls&&video.muted&&video.playsInline&&video.poster));
    const second=page.locator('.decision-explorer__tab').nth(1);await second.focus();await second.press('Enter');
    assert.equal(await second.getAttribute('aria-selected'),'true');assert.equal(await second.evaluate(node=>document.activeElement===node),true);
    if(viewport.width===430){
      await page.locator('.decision-explorer__tab').first().click();
      const trigger=page.locator('.decision-explorer__story:not([hidden]) .evidence-explorer__trigger');await trigger.click();
      const accordionButtons=page.locator('.decision-explorer__story:not([hidden]) .evidence-explorer__accordion-button');
      assert.equal(await accordionButtons.evaluateAll(nodes=>nodes.every(node=>node.getAttribute('aria-expanded')==='false')),true);
      assert.deepEqual(await accordionButtons.evaluateAll(nodes=>nodes.map(node=>node.querySelector('.evidence-explorer__number')?.textContent)),['01','02','03']);
      await accordionButtons.first().click();
      assert.equal(await accordionButtons.evaluateAll(nodes=>nodes.filter(node=>node.getAttribute('aria-expanded')==='true').length),1);
    }
  }catch(error){failures.push(`${viewport.name}: ${error.message}\n${JSON.stringify(result)}`)}
  if(runtimeErrors.length)failures.push(`${viewport.name}: runtime errors ${runtimeErrors.join(' | ')}`);
  fs.mkdirSync(evidenceDir,{recursive:true});
  const capture=async(name,locator)=>{await locator.scrollIntoViewIfNeeded();await locator.screenshot({path:path.join(evidenceDir,viewport.name,name)});};
  fs.mkdirSync(path.join(evidenceDir,viewport.name),{recursive:true});
  await capture('01-opening.png',page.locator('.case-study-v2-opening'));
  await capture('02-first-question.png',page.locator('[data-project-section="first-question"]'));
  await capture('03-reframe.png',page.locator('[data-project-section="product-reframing"]'));
  await capture('04-decision-selector.png',page.locator('.decision-explorer__selector'));
  for(const [index,name] of ['project-health','attention','lifecycle'].entries()){
    await page.locator('.decision-explorer__tab').nth(index).click();
    await capture(`${String(5+index*2).padStart(2,'0')}-${name}.png`,page.locator('.decision-explorer__story:not([hidden])'));
    const trigger=page.locator('.decision-explorer__story:not([hidden]) .evidence-explorer__trigger');if(await trigger.getAttribute('aria-expanded')!=='true')await trigger.click();
    if(viewport.width===430){const firstEvidence=page.locator('.decision-explorer__story:not([hidden]) .evidence-explorer__accordion-button').first();if(await firstEvidence.getAttribute('aria-expanded')!=='true')await firstEvidence.click()}
    await capture(`${String(6+index*2).padStart(2,'0')}-${name}-evidence.png`,page.locator('.decision-explorer__story:not([hidden]) .evidence-explorer'));
  }
  await capture('11-what-changed.png',page.locator('.case-study-v2-change-sequence'));
  await capture('12-outcomes.png',page.locator('.case-study-v2-outcomes'));
  await capture('13-cta.png',page.locator('.case-study-v2-cta'));
  await capture('14-overall-page.png',page.locator('.modal-content-v45'));
  await context.close();
}

const reducedContext=await browser.newContext({viewport:{width:871,height:1024},reducedMotion:'reduce'});
const reducedPage=await reducedContext.newPage();
await reducedPage.goto(`${baseUrl}/work/daily-hours`,{waitUntil:'networkidle'});
await reducedPage.locator('.decision-explorer').waitFor({state:'visible'});
const reducedVideos=await reducedPage.locator('.case-study-v2-opening video,.decision-explorer video').evaluateAll(videos=>videos.map(video=>({paused:video.paused,controls:video.controls,poster:Boolean(video.poster)})));
if(!reducedVideos.length||reducedVideos.some(video=>!video.paused||!video.controls||!video.poster))failures.push(`reduced-motion: managed video contract failed ${JSON.stringify(reducedVideos)}`);
await reducedContext.close();

const regressionContext=await browser.newContext({viewport:{width:1419,height:900}});
const regressionPage=await regressionContext.newPage();
for(const projectId of ['payment','dbs','voucher','booking']){
  const errors=[];const onError=error=>errors.push(error.message);regressionPage.on('pageerror',onError);
  await regressionPage.goto(`${baseUrl}/work/${projectId}`,{waitUntil:'networkidle'});
  await regressionPage.locator('#detailDialog[open]').waitFor({state:'visible'});
  const state=await regressionPage.evaluate(id=>{
    const visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=='none'&&node.getClientRects().length);
    return {
      title:document.querySelector('#detailTitle')?.textContent.trim(),
      v2:document.querySelector('#projectEvidence')?.dataset.presentationContract==='case-study-v2',
      decisions:[...document.querySelectorAll('.decision-card-v46,.voucher-r149-decision')].filter(visible).length,
      evidenceFrames:[...document.querySelectorAll('.evidence-frame')].filter(visible).length,
      outcomes:[...document.querySelectorAll('[data-project-nav-target="outcomes"],#systemCaseOutcomesSection')].filter(visible).length,
      related:Boolean([...document.querySelectorAll('#detailRelated')].find(visible)),
      navigation:Boolean([...document.querySelectorAll('.pd-section-nav')].find(visible)),
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      id
    };
  },projectId);
  if(!state.title||state.v2||(projectId!=='voucher'&&!state.decisions)||!state.outcomes||!state.related||state.overflow||errors.length)failures.push(`${projectId} cross-project regression failed: ${JSON.stringify({...state,errors})}`);
  if(projectId!=='voucher'&&(!state.evidenceFrames||!state.navigation))failures.push(`${projectId} shared EvidenceFrame/navigation regression failed: ${JSON.stringify(state)}`);
  regressionPage.off('pageerror',onError);
}
await regressionContext.close();

await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exit(1)}
console.log(`Case Study v2 browser QA passed at 1419px, 871px, and 430px. Evidence: ${evidenceDir}`);
