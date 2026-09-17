import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require=createRequire(import.meta.url);
const { chromium }=require("playwright");
const baseUrl=process.env.BASE_URL||"http://127.0.0.1:3000";
const outputRoot=process.env.EVIDENCE_DIR||"/tmp/style-b-regression-polish-evidence";
const chromePath="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const viewports=[{name:"1419",width:1419,height:900},{name:"871",width:871,height:1024},{name:"430",width:430,height:932}];
const report={baseUrl,viewports:{},domainCategories:{},oneClick:{},errors:[]};
fs.mkdirSync(outputRoot,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:chromePath});

const settle=async page=>{await page.waitForLoadState("domcontentloaded");await page.waitForTimeout(350)};
async function open(page,route){const response=await page.goto(`${baseUrl}${route}`,{waitUntil:"networkidle"});assert.ok(response&&response.status()<400,`${route}: ${response?.status()}`);await settle(page)}
function collectErrors(page,bucket){page.on("console",m=>{if(m.type()==="error")bucket.push(`console: ${m.text()}`)});page.on("pageerror",e=>bucket.push(`page: ${e.message}`));page.on("requestfailed",r=>{const reason=r.failure()?.errorText||"";if(reason!=="net::ERR_ABORTED")bucket.push(`network: ${r.url()} ${reason}`)})}
async function shell(page){return page.evaluate(()=>({logoSrc:document.querySelector(".site-header .brand__logo")?.getAttribute("src"),brandText:document.querySelector(".site-header .brand")?.textContent.trim(),headerClass:document.querySelector(".site-header")?.className,footerClass:document.querySelector(".site-footer")?.className,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))}
async function screenshot(page,file){await page.screenshot({path:file,fullPage:true});return file}
async function revealPage(page){
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  const step=Math.max(320,Math.floor((await page.viewportSize()).height*.7));
  for(let y=0;y<height;y+=step){await page.evaluate(next=>window.scrollTo(0,next),y);await page.waitForTimeout(50)}
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(150);
}
async function loadVisibleImages(page,selector){
  await page.locator(selector).evaluate(scope=>scope.querySelectorAll('img').forEach(image=>image.loading='eager'));
  await page.waitForFunction(scope=>[...document.querySelectorAll(`${scope} img`)].every(image=>image.complete&&image.naturalWidth>0),selector);
}
async function hoverIntegrity(page,selector){
  const targets=page.locator(selector);const count=await targets.count();const results=[];
  for(let index=0;index<count;index++){
    const target=targets.nth(index);if(!await target.isVisible())continue;
    const before=await target.evaluate(node=>{const action=node.querySelector('.work-card-v32__action,.experiment-card-action,.related-project-card__action,.detail-related-action-v46,.timeline-evidence-v34');const support=node.querySelector('p,.project-card__metric-label');return{height:node.offsetHeight,width:node.offsetWidth,actionTop:action?.offsetTop,actionText:action?.textContent.trim(),actionOpacity:action?getComputedStyle(action).opacity:null,supportOpacity:support?getComputedStyle(support).opacity:null,supportVisibility:support?getComputedStyle(support).visibility:null}});
    await target.hover();await page.waitForTimeout(80);
    const after=await target.evaluate(node=>{const action=node.querySelector('.work-card-v32__action,.experiment-card-action,.related-project-card__action,.detail-related-action-v46,.timeline-evidence-v34');const support=node.querySelector('p,.project-card__metric-label');return{height:node.offsetHeight,width:node.offsetWidth,actionTop:action?.offsetTop,actionText:action?.textContent.trim(),actionOpacity:action?getComputedStyle(action).opacity:null,supportOpacity:support?getComputedStyle(support).opacity:null,supportVisibility:support?getComputedStyle(support).visibility:null}});
    assert.deepEqual(after,before,`hover integrity ${selector} ${index}`);results.push(after);
  }
  return results;
}

for(const viewport of viewports){
  const dir=path.join(outputRoot,viewport.name);fs.mkdirSync(dir,{recursive:true});
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},hasTouch:viewport.width===430,isMobile:viewport.width===430,reducedMotion:"reduce"});
  const page=await context.newPage();const errors=[];collectErrors(page,errors);
  const routes={};
  for(const [name,route] of Object.entries({home:"/",work:"/work",experiments:"/experiments",profile:"/profile",dailyHours:"/work/daily-hours"})){
    await open(page,route);routes[name]=await shell(page);
    assert.equal(routes[name].logoSrc,"/site/assets/img/brand/shulin-studio-ss-logo.png",`${viewport.name} ${name} logo`);
    assert.equal(routes[name].brandText,"",`${viewport.name} ${name} text brand regression`);
    assert.ok(routes[name].footerClass?.includes("site-footer"),`${viewport.name} ${name} footer`);
    assert.ok(routes[name].overflow<=1,`${viewport.name} ${name} overflow ${routes[name].overflow}`);
  }

  await open(page,"/work");
  const workHero=await page.locator(".page-hero").evaluate(node=>({font:getComputedStyle(node.querySelector("h1")).fontSize,line:getComputedStyle(node.querySelector("h1")).lineHeight,paddingTop:getComputedStyle(node).paddingTop,grid:node.querySelector(".page-hero-grid")?.className}));
  const expectedFilters=["All","0→1 launches","Transactions & checkout","Internal tools & operations","Incentives & engagement","Multi-step journeys"];
  const filterLabels=await page.locator(".work-index-filter").allTextContents();
  assert.deepEqual(filterLabels.map(value=>value.trim()),expectedFilters,`${viewport.name} Work filter taxonomy`);
  const filterQA={};
  for(const label of expectedFilters.slice(1)){
    await page.getByRole("button",{name:label,exact:true}).click();
    filterQA[label]=await page.locator(".work-index__filtered-results").evaluate(node=>({count:Number(node.dataset.resultCount),columns:getComputedStyle(node).gridTemplateColumns,variants:[...node.children].map(card=>card.dataset.projectCardVariant)}));
    assert.equal(filterQA[label].count,filterQA[label].variants.length,`${viewport.name} ${label} count`);
    if(filterQA[label].count===2)assert.deepEqual(filterQA[label].variants,["featured","standard"],`${viewport.name} two-result layout`);
    if(filterQA[label].count>=3)assert.ok(filterQA[label].variants.every(value=>value==="compact"),`${viewport.name} ${label} consistent grid`);
  }
  await page.reload({waitUntil:"networkidle"});await settle(page);
  await page.locator('.work-card-v32[data-work-categories~="transactions"]').evaluateAll((cards)=>cards.slice(1).forEach(card=>card.dataset.workCategories=card.dataset.workCategories.replace(/\btransactions\b/g,'').trim()));
  await page.getByRole("button",{name:"Transactions & checkout",exact:true}).click();
  const singleResult=await page.locator(".work-index__filtered-results").evaluate(node=>({count:Number(node.dataset.resultCount),variants:[...node.children].map(card=>card.dataset.projectCardVariant)}));
  assert.deepEqual(singleResult,{count:1,variants:["featured"]},`${viewport.name} one-result layout contract`);
  await page.reload({waitUntil:"networkidle"});await settle(page);
  const workCtaRows=await page.locator(".work-index__featured-secondary-row,.work-index__more-grid").evaluateAll(rows=>rows.flatMap(row=>{const groups=new Map();[...row.children].forEach(card=>{const top=Math.round(card.getBoundingClientRect().top);const values=groups.get(top)||[];values.push(card.querySelector('.work-card-v32__action')?.getBoundingClientRect().top);groups.set(top,values)});return [...groups.values()].filter(values=>values.length>1)}));
  workCtaRows.forEach((tops,index)=>assert.ok(Math.max(...tops)-Math.min(...tops)<=1,`${viewport.name} Work CTA row ${index} alignment`));
  const workHover=viewport.width>640?await hoverIntegrity(page,'.work-index .work-card-v32'):[];
  await revealPage(page);const workShot=await screenshot(page,path.join(dir,"work.png"));
  await open(page,"/experiments");
  const experimentHero=await page.locator(".page-hero").evaluate(node=>({font:getComputedStyle(node.querySelector("h1")).fontSize,line:getComputedStyle(node.querySelector("h1")).lineHeight,paddingTop:getComputedStyle(node).paddingTop,grid:node.querySelector(".page-hero-grid")?.className,eyebrow:node.querySelector(".kicker")?.textContent.trim(),heading:node.querySelector("h1")?.textContent.trim(),copy:node.querySelector(".lead-copy")?.textContent.trim()}));
  assert.deepEqual({font:experimentHero.font,line:experimentHero.line,paddingTop:experimentHero.paddingTop,grid:experimentHero.grid},workHero,`${viewport.name} Work/Experiment hero parity`);
  assert.equal(experimentHero.eyebrow,"Experiment");
  assert.equal(experimentHero.heading,"Ongoing explorations. Different questions.");
  assert.equal(experimentHero.copy,"Ongoing explorations outside client and product work. Small tests, facilitation experiments, prototypes, and ideas I continue developing over time.");
  const experimentYears=await page.locator('#experimentPageRail [data-experiment]').evaluateAll(cards=>Object.fromEntries(cards.map(card=>[card.dataset.experiment,card.querySelector('.project-card__year')?.textContent.trim()])));
  assert.equal(experimentYears['weekly-design-session'],'2019');
  assert.equal(experimentYears['food-testing-workshop'],'2017');
  assert.equal(experimentYears['aja-creative-workshop'],'2017');
  const experimentHover=viewport.width>640?await hoverIntegrity(page,'#experimentPageRail .experiment-index-card-v36'):[];
  await loadVisibleImages(page,"#experimentPageRail");
  const ctaGeometry=await page.locator("#experimentPageRail .experiment-index-card-v36").first().evaluate(card=>{
    const content=card.querySelector(".work-card-v32__content"),action=card.querySelector(".work-card-v32__action"),arrow=action.querySelector(".icon-arrow");
    const cr=content.getBoundingClientRect(),ar=action.getBoundingClientRect(),rr=arrow.getBoundingClientRect(),style=getComputedStyle(action),divider=getComputedStyle(action,'::before'),contentStyle=getComputedStyle(content);
    return {contentLeft:cr.left,contentRight:cr.right,contentPaddingLeft:parseFloat(contentStyle.paddingLeft),contentPaddingRight:parseFloat(contentStyle.paddingRight),actionLeft:ar.left,actionRight:ar.right,dividerWidth:parseFloat(divider.width),dividerHeight:parseFloat(divider.height),paddingLeft:parseFloat(style.paddingLeft),paddingRight:parseFloat(style.paddingRight),arrowRight:rr.right};
  });
  const leftEdge=ctaGeometry.contentLeft+ctaGeometry.contentPaddingLeft,rightEdge=ctaGeometry.contentRight-ctaGeometry.contentPaddingRight;
  assert.ok(Math.abs(ctaGeometry.actionLeft-leftEdge)<=1,`${viewport.name} CTA left edge`);
  assert.ok(Math.abs(ctaGeometry.actionRight-rightEdge)<=1,`${viewport.name} CTA right edge`);
  assert.equal(ctaGeometry.dividerHeight,1,`${viewport.name} divider height`);
  assert.ok(Math.abs(ctaGeometry.dividerWidth-(rightEdge-leftEdge))<=1,`${viewport.name} divider width`);
  assert.ok(Math.abs(ctaGeometry.arrowRight-rightEdge)<=1,`${viewport.name} arrow right edge`);
  await revealPage(page);
  const experimentsShot=await screenshot(page,path.join(dir,"experiments.png"));

  await open(page,"/profile");
  const profile=await page.locator(".profile-hero-v36").evaluate(node=>{
    const copy=node.querySelector(".profile-hero-v36__copy"),panel=node.querySelector(".profile-value-v44"),summary=node.querySelector(".profile-hero-v36__summary"),cards=[...document.querySelectorAll("#profileSideRail .recognition-card-v1838f")].filter(n=>n.getClientRects().length);
    const r=n=>n.getBoundingClientRect();
    const cloud=getComputedStyle(node,'::before');
    return {eyebrow:node.querySelector(".profile-hero-v36__eyebrow")?.textContent.trim(),summary:summary?.textContent.trim(),summaryFont:getComputedStyle(summary).fontSize,startDelta:Math.abs(r(copy).top-r(panel).top),cloudMask:cloud.maskImage||cloud.webkitMaskImage,cloudRadius:cloud.borderRadius,contractPresent:document.querySelector('.career-timeline-v34')?.innerText.includes('CONTRACT'),cardGeometry:cards.map(card=>({top:r(card.querySelector(".experiment-index-card-v36__top")).top,title:r(card.querySelector("h3")).top,actionTop:r(card.querySelector(".experiment-card-action,.recognition-card-v1838f__status")).top,actionWidth:r(card.querySelector(".experiment-card-action,.recognition-card-v1838f__status")).width,cardWidth:r(card).width}))};
  });
  assert.equal(profile.eyebrow,"Principal Product Designer");
  assert.equal(profile.summary,"9+ years designing complex digital products across fintech, banking, retail, and global travel. I connect customer needs, business rules, and operations from product direction through shipped outcomes.");
  assert.ok(parseFloat(profile.summaryFont)<=28,`${viewport.name} Profile summary size ${profile.summaryFont}`);
  assert.match(profile.cloudMask,/experience-proof-cloud\.svg/,`${viewport.name} Profile cloud owner`);
  assert.equal(profile.contractPresent,false,`${viewport.name} CONTRACT removed`);
  const awardHover=viewport.width>640?await hoverIntegrity(page,'#profileSideRail .recognition-card-v1838f'):[];
  if(viewport.width>900)assert.ok(profile.startDelta<=1,`${viewport.name} Profile grid start delta ${profile.startDelta}`);
  else assert.ok(profile.startDelta>0,`${viewport.name} Profile stacked order`);
  await revealPage(page);
  const profileShot=await screenshot(page,path.join(dir,"profile.png"));

  await open(page,"/work/daily-hours");
  const daily=await page.evaluate(()=>({headline:document.querySelector(".csv2-display")?.innerText.replace(/\s+/g," ").trim(),headerLogo:document.querySelector(".site-header .brand__logo")?.getAttribute("src"),contactFooter:Boolean(document.querySelector(".site-footer .contact-bar-v42")),footerHeading:document.querySelector(".site-footer .contact-bar-v42 h2")?.textContent.trim(),footerAction:document.querySelector(".site-footer .contact-bar-v42__action")?.textContent.trim(),headerColor:getComputedStyle(document.querySelector(".site-header")).backgroundColor}));
  assert.equal(daily.headline,"Track work. Decide what’s worth it.");
  assert.equal(daily.headerLogo,"/site/assets/img/brand/shulin-studio-ss-logo.png");
  assert.equal(daily.contactFooter,true);
  assert.equal(daily.footerHeading,"Have a complex product problem?");
  assert.equal(daily.footerAction,"Start a conversation");
  await revealPage(page);
  const dailyShot=await screenshot(page,path.join(dir,"daily-hours.png"));
  await open(page,"/");await revealPage(page);const homeShot=await screenshot(page,path.join(dir,"homepage.png"));
  report.viewports[viewport.name]={routes,workHero,experimentHero,filterQA,singleResult,workCtaRows,workHover,experimentYears,experimentHover,ctaGeometry,profile,awardHover,daily,errors,screenshots:{home:homeShot,work:workShot,experiments:experimentsShot,profile:profileShot,dailyHours:dailyShot}};
  report.errors.push(...errors.map(error=>`${viewport.name}: ${error}`));
  await context.close();
}

const context=await browser.newContext({viewport:{width:1419,height:900},reducedMotion:"reduce"});
const page=await context.newPage();const clickErrors=[];collectErrors(page,clickErrors);
async function openDialog(route,selector){await open(page,route);const trigger=page.locator(selector).first();assert.equal(await trigger.count(),1,`missing ${selector}`);await trigger.scrollIntoViewIfNeeded();await trigger.click();await page.locator("#detailDialog").waitFor({state:"visible"});return{title:(await page.locator("#detailTitle").textContent()).trim(),url:page.url()}}
await open(page,"/");
const categories=await page.locator(".domain-tab").evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.domain,label:n.textContent.trim()})));
for(const category of categories){
  await page.locator(`.domain-tab[data-domain="${category.id}"]`).click();await page.waitForTimeout(300);
  const active=page.locator('.domain-project-card-v2[data-wheel-offset="0"]');const project=await active.getAttribute("data-project");await active.click({position:{x:200,y:200}});await page.locator("#detailDialog").waitFor({state:"visible"});report.domainCategories[category.id]={label:category.label,project,title:(await page.locator("#detailTitle").textContent()).trim(),clicks:1};
  const tooltip=page.locator('.inline-tooltip-tail .info-tooltip').first();if(await tooltip.count())report.tooltip=await tooltip.evaluate(node=>{const tail=node.parentElement,text=[...tail.childNodes].find(child=>child.nodeType===Node.TEXT_NODE&&child.textContent.trim());const range=document.createRange();range.selectNodeContents(text);const textRect=range.getBoundingClientRect(),glyph=node.querySelector('.info-tooltip__glyph').getBoundingClientRect();return{gap:glyph.left-textRect.right,verticalDelta:Math.abs((glyph.top+glyph.height/2)-(textRect.top+textRect.height/2))}});
  await page.locator("#detailClose").click();await page.locator("#detailDialog").waitFor({state:"hidden"});
}
assert.ok(report.tooltip,`missing inline tooltip`);assert.ok(Math.abs(report.tooltip.gap-4)<=.5,`tooltip gap ${report.tooltip.gap}`);assert.ok(report.tooltip.verticalDelta<=2,`tooltip vertical delta ${report.tooltip.verticalDelta}`);
report.oneClick.workCard=await openDialog("/work",'[data-project="payment"]');await page.locator("#detailClose").click();
await open(page,"/work");await page.getByRole("button",{name:"Transactions & checkout",exact:true}).click();const filteredWork=page.locator('.work-index__filtered-results .work-card-v32').first();const filteredId=await filteredWork.getAttribute('data-work-index-project');await filteredWork.locator('.work-card-v32__button').click();await page.locator('#detailDialog').waitFor({state:'visible'});report.oneClick.filteredWork={id:filteredId,title:(await page.locator('#detailTitle').textContent()).trim(),clicks:1};await page.locator('#detailClose').click();
await open(page,"/work");const dailyLink=page.locator('a[data-public-work-route="/work/daily-hours"]').first();await dailyLink.scrollIntoViewIfNeeded();await dailyLink.click();await page.waitForURL(/\/work\/daily-hours$/);assert.equal((await page.locator(".csv2-display").innerText()).replace(/\s+/g," ").trim(),"Track work. Decide what’s worth it.");report.oneClick.dailyHours={url:page.url(),clicks:1};
for(const id of ["weekly-design-session","food-testing-workshop","aja-creative-workshop"]){report.oneClick[id]=await openDialog("/experiments",`button[data-experiment="${id}"]`);await page.locator("#detailClose").click()}
await open(page,"/experiments");await page.locator('button[data-experiment="weekly-design-session"]').click();await page.locator("#detailDialog").waitFor({state:"visible"});const moreExperiment=page.locator('#detailRelatedRail button[data-experiment]').first();const moreExperimentId=await moreExperiment.getAttribute("data-experiment");await moreExperiment.click();report.oneClick.moreWorkExperiment={id:moreExperimentId,title:(await page.locator("#detailTitle").textContent()).trim(),clicks:1};await page.locator("#detailClose").click();
await open(page,"/work");await page.locator('[data-project="payment"]').first().click();await page.locator("#detailDialog").waitFor({state:"visible"});const moreWork=page.locator('#detailRelatedRail button[data-project]').first();const moreWorkId=await moreWork.getAttribute("data-project");await moreWork.click();report.oneClick.moreWorkWork={id:moreWorkId,title:(await page.locator("#detailTitle").textContent()).trim(),clicks:1};await page.locator("#detailClose").click();
await open(page,"/");const seeAll=page.locator('#homeExperimentRail a[href="/experiments"]');await seeAll.scrollIntoViewIfNeeded();await seeAll.click();await page.waitForURL(/\/experiments$/);report.oneClick.seeAll={url:page.url(),clicks:1};
await open(page,"/profile");const award=page.locator('#profileSideRail button[data-experiment]').first();const awardId=await award.getAttribute('data-experiment');await award.click();await page.locator('#detailDialog').waitFor({state:'visible'});report.oneClick.awardEvidence={id:awardId,title:(await page.locator('#detailTitle').textContent()).trim(),clicks:1};await page.locator('#detailClose').click();
report.errors.push(...clickErrors.map(error=>`click: ${error}`));assert.deepEqual(report.errors,[]);
await context.close();await browser.close();
fs.writeFileSync(path.join(outputRoot,"report.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
