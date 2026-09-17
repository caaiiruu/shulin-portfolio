import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl=process.env.BASE_URL||'http://127.0.0.1:3000';
const outputRoot=process.env.EVIDENCE_DIR||'/tmp/portfolio-final-qa';
const viewports=[{name:'desktop-1419',width:1419,height:900},{name:'tablet-871',width:871,height:1024},{name:'mobile-430',width:430,height:932}];
const content=JSON.parse(fs.readFileSync('public/site/content/portfolio-content.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('public/site/content/portfolio-asset-manifest.json','utf8'));
const projectIds=Object.keys(content.projects);
const failures=[];
const report={baseUrl,head:process.env.QA_HEAD||null,viewports:{},failures};
const browser=await chromium.launch({headless:true});
const visible=async locator=>await locator.count()&&await locator.isVisible();
const waitReady=page=>page.waitForFunction(()=>document.readyState==='complete'&&Boolean(window.PORTFOLIO_RUNTIME_DATA),null,{timeout:15000});
const closeDialog=async page=>{await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#detailDialog')?.hasAttribute('open'));await page.waitForFunction(()=>!document.querySelector('.portfolio-loader-v59')?.classList.contains('is-active'));await page.waitForLoadState('networkidle')};
const shot=async(page,dir,name,fullPage=false)=>page.screenshot({path:path.join(dir,`${name}.png`),fullPage});
const record=(condition,message)=>{if(!condition)failures.push(message)};

for(const viewport of viewports){
  const dir=path.join(outputRoot,viewport.name);fs.mkdirSync(dir,{recursive:true});
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},hasTouch:viewport.width===430,isMobile:viewport.width===430});
  const page=await context.newPage();page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(30000);
  const consoleErrors=[],pageErrors=[],networkErrors=[];
  page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});
  page.on('pageerror',error=>pageErrors.push(error.message));
  page.on('requestfailed',request=>{if(!request.url().startsWith('data:')&&!request.url().startsWith('https://www.google-analytics.com/'))networkErrors.push(`${request.method()} ${request.url()} ${request.failure()?.errorText||''}`)});
  const routeResults={};
  for(const route of ['/','/work','/experiments','/profile','/work/payment','/work/daily-hours']){
    const response=await page.goto(`${baseUrl}${route}`,{waitUntil:'networkidle'});routeResults[route]=response?.status();
    record(response?.ok(),`${viewport.name} route failed ${route}: ${response?.status()}`);
    const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
    record(overflow<=1,`${viewport.name} overflow ${route}: ${overflow}`);
  }

  await page.goto(`${baseUrl}/profile`,{waitUntil:'networkidle'});await waitReady(page);
  const profile=await page.evaluate(()=>{const portrait=document.querySelector('.profile-hero-v36__portrait'),reviews=[...document.querySelectorAll('.profile-testimonial-v1')],viewport=document.querySelector('#profileTestimonialsViewport'),controls=document.querySelector('#profileTestimonialsControls');return{portrait:{clip:getComputedStyle(portrait).clipPath,radius:getComputedStyle(portrait).borderRadius,src:portrait.querySelector('img')?.getAttribute('src')},clouds:[...document.querySelectorAll('.profile-hero-v36__cloud')].map(node=>node.querySelector('use')?.getAttribute('href')),reviews:reviews.map(node=>node.querySelector('.profile-testimonial-v1__attribution')?.textContent.trim()),viewportOverflow:viewport.scrollWidth>viewport.clientWidth,controls:controls&&!controls.hidden,count:document.querySelector('#profileTestimonialsCount')?.textContent.trim()}});
  record(profile.portrait.clip!=='none'&&profile.portrait.radius==='0px'&&profile.portrait.src?.includes('profile-portrait-shulin-chou-public-v1'),`${viewport.name} Profile portrait contract: ${JSON.stringify(profile.portrait)}`);
  record(profile.clouds.length===3&&profile.clouds.every(value=>value?.includes('hero-transformation-system')&&value.includes('#Vector_')),`${viewport.name} Profile cloud reuse failed`);
  record(profile.reviews.length===7&&profile.reviews[0]==='Sip Khoon · FairPrice Group'&&profile.reviews.at(-1)==='Michelle Tan J.Y. · FairPrice Group'&&profile.viewportOverflow&&profile.controls&&profile.count==='1 / 7',`${viewport.name} testimonial rail contract: ${JSON.stringify(profile)}`);
  await page.locator('[data-testimonial-next]').click();record((await page.locator('#profileTestimonialsCount').textContent()).trim()==='2 / 7',`${viewport.name} testimonial next failed`);
  await page.locator('#profileTestimonialsViewport').press('ArrowLeft');record((await page.locator('#profileTestimonialsCount').textContent()).trim()==='1 / 7',`${viewport.name} testimonial keyboard failed`);
  await page.evaluate(()=>document.activeElement?.blur());
  await page.locator('#profileTestimonials').screenshot({path:path.join(dir,'profile-testimonials.png')});
  const reduced=await context.newPage();await reduced.emulateMedia({reducedMotion:'reduce'});await reduced.goto(`${baseUrl}/profile`,{waitUntil:'networkidle'});const before=(await reduced.locator('#profileTestimonialsCount').textContent()).trim();await reduced.waitForTimeout(7800);const after=(await reduced.locator('#profileTestimonialsCount').textContent()).trim();record(before===after,`${viewport.name} reduced-motion testimonial autoplay advanced`);await reduced.close();

  await page.goto(`${baseUrl}/work`,{waitUntil:'networkidle'});await waitReady(page);
  const taxonomy=await page.locator('.work-index-filter').allTextContents();
  record(JSON.stringify(taxonomy)===JSON.stringify(['All','0→1 launches','Transactions & checkout','Internal tools & operations','Incentives & engagement','Multi-step journeys']),`${viewport.name} Work taxonomy: ${JSON.stringify(taxonomy)}`);
  await page.getByRole('button',{name:'Transactions & checkout'}).click();
  const two=await page.evaluate(()=>{const root=document.querySelector('.work-index__filtered-results'),cards=[...root.children];return{count:root.dataset.resultCount,roles:cards.map(card=>card.dataset.filterResultRole),columns:getComputedStyle(root).gridTemplateColumns,overflow:document.documentElement.scrollWidth-innerWidth}});
  record(two.count==='2'&&two.roles.join(',')==='featured,secondary'&&two.overflow<=1,`${viewport.name} two-result layout: ${JSON.stringify(two)}`);await page.locator('.work-index__filtered-results').screenshot({path:path.join(dir,'work-filter-two-results.png')});
  const filteredTrigger=page.locator('.work-index__filtered-results [data-work-index-project] .work-card-v32__button').first();
  record(await visible(filteredTrigger),`${viewport.name} filtered Work card missing`);
  if(await visible(filteredTrigger)){await filteredTrigger.click();await page.waitForSelector('#detailDialog[open]');record(await page.locator('#detailDialog[open]').count()===1,`${viewport.name} filtered Work card first click failed`);await closeDialog(page)}
  await page.evaluate(()=>{const root=document.querySelector('.work-index__filtered-results'),cards=[...root.children];cards.slice(1).forEach(card=>card.hidden=true);root.dataset.resultCount='1';cards[0].dataset.filterResultRole='featured';cards[0].dataset.projectCardVariant='featured'});
  const one=await page.evaluate(()=>{const root=document.querySelector('.work-index__filtered-results'),card=root.querySelector('[data-filter-result-role="featured"]'),button=card.querySelector('.work-card-v32__button'),content=card.querySelector('.work-card-v32__content'),media=card.querySelector('.work-artifact'),r=node=>{const x=node.getBoundingClientRect();return{x:x.x,y:x.y,width:x.width,height:x.height}};return{count:root.dataset.resultCount,root:r(root),card:r(card),button:r(button),content:r(content),media:r(media),overflow:document.documentElement.scrollWidth-innerWidth}});
  record(one.count==='1'&&one.overflow<=1&&Math.abs(one.card.width-one.root.width)<2,`${viewport.name} one-result full-width: ${JSON.stringify(one)}`);
  if(viewport.width===1419)record(one.media.width/one.card.width>.55&&one.content.width/one.card.width<.45,`${viewport.name} one-result 40/60 geometry: ${JSON.stringify(one)}`);
  if(viewport.width===430)record(one.media.y>=one.content.y+one.content.height-2,`${viewport.name} one-result mobile stack: ${JSON.stringify(one)}`);
  await page.locator('.work-index__filtered-results').screenshot({path:path.join(dir,'work-filter-one-result.png')});
  await page.goto(`${baseUrl}/work`,{waitUntil:'networkidle'});await waitReady(page);
  const workCards=page.locator('.work-index .work-card-v32');
  const themes=await workCards.evaluateAll(cards=>cards.map(card=>({id:card.dataset.workIndexProject,theme:card.dataset.projectTheme,surface:getComputedStyle(card).getPropertyValue('--project-theme-surface').trim(),text:getComputedStyle(card).getPropertyValue('--project-theme-on-surface').trim(),chrome:card.dataset.projectChrome})));
  record(themes.length>=13&&themes.every(item=>item.theme&&item.surface&&item.text&&/^(light|dark)$/.test(item.chrome)),`${viewport.name} project theme resolution: ${JSON.stringify(themes)}`);
  const projectCardMedia=await workCards.evaluateAll(cards=>cards.map(card=>{const frame=card.querySelector('.work-artifact'),image=frame?.querySelector('img'),rect=frame?.getBoundingClientRect();return{id:card.dataset.workIndexProject,assetStatus:frame?.dataset.assetStatus,frameRatio:rect?.width/rect?.height,objectFit:image?getComputedStyle(image).objectFit:null}}).filter(item=>item.assetStatus==='real-active'));
  record(projectCardMedia.length>=13&&projectCardMedia.every(x=>Math.abs(x.frameRatio-16/9)<.06&&x.objectFit==='cover'),`${viewport.name} active ProjectCard full-bleed widescreen media: ${JSON.stringify(projectCardMedia)}`);
  const bandzo=await page.locator('[data-work-index-project="bandzo"]').getAttribute('data-work-categories');record(!bandzo?.split(/\s+/).includes('zero'),`${viewport.name} Bandzo incorrectly mapped to 0→1`);
  const cta=await page.locator('[data-work-index-project="payment"] .work-card-v32__action').evaluate(node=>{const s=getComputedStyle(node),a=getComputedStyle(node.querySelector('.icon-arrow')),b=getComputedStyle(node,'::before'),after=getComputedStyle(node,'::after');return{color:s.color,arrow:a.color,decoration:s.textDecorationLine,image:s.backgroundImage,divider:b.backgroundColor,after:after.content}});
  record(cta.color===cta.arrow&&cta.decoration==='none'&&cta.image==='none'&&cta.after==='none',`${viewport.name} ProjectCard CTA: ${JSON.stringify(cta)}`);
  const baseline=await page.locator('.work-index__featured-secondary-row .work-card-v32__action').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().bottom));
  if(viewport.width===1419)record(baseline.length===3&&Math.max(...baseline)-Math.min(...baseline)<=2,`${viewport.name} CTA bottom baseline: ${JSON.stringify(baseline)}`);
  if(viewport.width===871)record(baseline.length>=2&&Math.abs(baseline[0]-baseline[1])<=2,`${viewport.name} CTA same-row baseline: ${JSON.stringify(baseline)}`);
  await shot(page,dir,'work-all-themes',true);

  const openWorkProject=async id=>{await page.goto(`${baseUrl}/work`,{waitUntil:'networkidle'});const trigger=page.locator(`[data-work-index-project="${id}"] .work-card-v32__button`);record(await visible(trigger),`${viewport.name} missing Work trigger ${id}`);if(await visible(trigger)){await trigger.click();await page.waitForSelector('#detailDialog[open]');return true}return false};
  for(const id of ['payment','voucher','dbs','booking','daily-hours']){if(await openWorkProject(id)){record(await page.locator('#detailDialog[open]').count()===1,`${viewport.name} first click failed ${id}`);if(id==='booking'){const booking=await page.evaluate(()=>{const grid=document.querySelector('#systemCaseOutcomesSection .outcome-metric-grid'),audience=[...document.querySelectorAll('.info-grid-v45__audience')],quick=document.querySelector('.quick-view-v51--project');return{rowGap:grid?parseFloat(getComputedStyle(grid).rowGap)||0:0,audienceTotal:audience.length,audienceInGrid:audience.filter(node=>node.closest('#projectSignals')).length,audienceInContribution:audience.filter(node=>node.closest('.contribution-block')).length,quickOverflow:quick?Math.max(0,quick.scrollHeight-quick.clientHeight):0}});if(viewport.width===430)record(booking.rowGap>0,'Booking mobile Outcome group rhythm failed');record(booking.audienceTotal===booking.audienceInGrid&&booking.audienceInContribution===0,'Booking Audience projection duplicated');if(viewport.width===430)record(booking.quickOverflow<=1,'Booking mobile Info Grid overflowed into Contribution')}await closeDialog(page)}}
  await openWorkProject('voucher');await page.waitForFunction(()=>!document.querySelector('.portfolio-loader-v59')?.classList.contains('is-active'));const lightChrome=await page.locator('#detailDialog').evaluate(node=>({mode:node.dataset.projectChrome,color:getComputedStyle(node.querySelector('.modal-close')).color,background:getComputedStyle(node.querySelector('.modal-close')).backgroundColor}));record(lightChrome.mode==='light',`${viewport.name} light popup chrome: ${JSON.stringify(lightChrome)}`);
  await shot(page,dir,'popup-voucher-light-chrome');
  const tip=page.locator('.info-tooltip__trigger').first();if(await visible(tip)){await tip.click();record(await page.locator('.info-tooltip__panel:not([hidden])').count()===1,`${viewport.name} tooltip click failed`);await page.keyboard.press('Escape');record(await page.locator('.info-tooltip__panel:not([hidden])').count()===0,`${viewport.name} tooltip Escape failed`)}
  const related=page.locator('#detailRelated [data-project]').first();if(await visible(related)){await related.click();record(await page.locator('#detailDialog[open]').count()===1,`${viewport.name} More Work project first click failed`)}await closeDialog(page);
  await openWorkProject('daily-hours');await page.waitForFunction(()=>!document.querySelector('.portfolio-loader-v59')?.classList.contains('is-active'));const daily=await page.locator('#detailDialog').evaluate(node=>({mode:node.dataset.projectChrome,root:node.querySelector('[data-case-study-v2-root="daily-hours"]')!==null}));record(daily.mode==='dark'&&daily.root,`${viewport.name} Daily Hours popup/theme: ${JSON.stringify(daily)}`);await shot(page,dir,'popup-daily-hours-dark-chrome');await closeDialog(page);

  await page.goto(`${baseUrl}/experiments`,{waitUntil:'networkidle'});await waitReady(page);
  const experimentIds=await page.locator('#experimentPageRail [data-experiment]').evaluateAll(nodes=>[...new Set(nodes.map(node=>node.dataset.experiment))]);record(experimentIds.length>=6,`${viewport.name} experiment inventory: ${JSON.stringify(experimentIds)}`);
  for(const id of ['weekly-design-session','food-testing-workshop','aja-creative-workshop']){const trigger=page.locator(`[data-experiment="${id}"]`).first();record(await visible(trigger),`${viewport.name} missing experiment ${id}`);if(await visible(trigger)){await trigger.click();await page.waitForSelector('#detailDialog[open]');record(await page.locator('#detailDialog[open]').count()===1,`${viewport.name} first click failed ${id}`);if(id==='weekly-design-session'){const moreExperiment=page.locator('#detailRelated [data-experiment]').first();record(await visible(moreExperiment),`${viewport.name} More Work experiment missing`);if(await visible(moreExperiment)){await moreExperiment.click();await page.waitForSelector('#detailDialog[open]');record(await page.locator('#detailDialog[open]').count()===1,`${viewport.name} More Work experiment first click failed`)}}await closeDialog(page)}}
  await shot(page,dir,'experiments');

  await page.goto(`${baseUrl}/`,{waitUntil:'networkidle'});await waitReady(page);
  const seeAll=page.getByRole('link',{name:/See all experiments/i}).first();record(await visible(seeAll),`${viewport.name} See all experiments missing`);if(await visible(seeAll)){await seeAll.click();record(new URL(page.url()).pathname==='/experiments',`${viewport.name} See all experiments first click failed: ${page.url()}`)}
  await page.goto(`${baseUrl}/`,{waitUntil:'networkidle'});await waitReady(page);const domainIds=await page.locator('.domain-tab').evaluateAll(tabs=>tabs.map(tab=>tab.dataset.domain));record(domainIds.length===6,`${viewport.name} Domain taxonomy: ${JSON.stringify(domainIds)}`);
  const domainRepresentatives=[];
  for(const domainId of domainIds){await page.goto(`${baseUrl}/`,{waitUntil:'networkidle'});await waitReady(page);const tab=page.locator(`.domain-tab[data-domain="${domainId}"]`);await tab.click();await page.waitForFunction(id=>document.querySelector('#relatedProjects')?.dataset.domainPresentationId===id,domainId);await page.waitForLoadState('networkidle');const center=page.locator('.domain-project-card-v2[data-wheel-offset="0"][data-project]');record(await visible(center),`${viewport.name} Domain representative missing: ${domainId}`);if(await visible(center)){const project=await center.getAttribute('data-project');domainRepresentatives.push(`${domainId}:${project}`);await center.click();await page.waitForSelector('#detailDialog[open]');record(await page.locator('#detailDialog[open]').count()===1,`${viewport.name} Domain first click failed: ${domainId}:${project}`);await closeDialog(page)}}
  await shot(page,dir,'homepage-domain');

  record(consoleErrors.length===0,`${viewport.name} console errors: ${JSON.stringify(consoleErrors)}`);record(pageErrors.length===0,`${viewport.name} page errors: ${JSON.stringify(pageErrors)}`);record(networkErrors.length===0,`${viewport.name} network errors: ${JSON.stringify(networkErrors)}`);
  report.viewports[viewport.name]={routes:routeResults,profile,two,one,themes,cta,baseline,lightChrome,daily,experimentIds,domainRepresentatives,consoleErrors,pageErrors,networkErrors};
  await context.close();
}
await browser.close();
report.engineeringQa=failures.length===0?'PASS':'FAIL';report.humanVisualQa='PENDING_MANUAL_REVIEW';
fs.mkdirSync(outputRoot,{recursive:true});fs.writeFileSync(path.join(outputRoot,'browser-qa.json'),JSON.stringify(report,null,2));
if(failures.length)throw new Error(failures.join('\n'));
console.log(JSON.stringify({status:'PASS',evidence:outputRoot,viewports:Object.keys(report.viewports)},null,2));
