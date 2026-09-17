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
  await open(page,"/experiments");
  const experimentHero=await page.locator(".page-hero").evaluate(node=>({font:getComputedStyle(node.querySelector("h1")).fontSize,line:getComputedStyle(node.querySelector("h1")).lineHeight,paddingTop:getComputedStyle(node).paddingTop,grid:node.querySelector(".page-hero-grid")?.className,eyebrow:node.querySelector(".kicker")?.textContent.trim(),heading:node.querySelector("h1")?.textContent.trim(),copy:node.querySelector(".lead-copy")?.textContent.trim()}));
  assert.deepEqual({font:experimentHero.font,line:experimentHero.line,paddingTop:experimentHero.paddingTop,grid:experimentHero.grid},workHero,`${viewport.name} Work/Experiment hero parity`);
  assert.equal(experimentHero.eyebrow,"Experiment");
  assert.equal(experimentHero.heading,"Ongoing explorations. Different questions.");
  assert.equal(experimentHero.copy,"Ongoing explorations outside client and product work. Small tests, facilitation experiments, prototypes, and ideas I continue developing over time.");
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
    return {eyebrow:node.querySelector(".profile-hero-v36__eyebrow")?.textContent.trim(),summary:summary?.textContent.trim(),summaryFont:getComputedStyle(summary).fontSize,startDelta:Math.abs(r(copy).top-r(panel).top),cardGeometry:cards.map(card=>({top:r(card.querySelector(".experiment-index-card-v36__top")).top,title:r(card.querySelector("h3")).top,actionTop:r(card.querySelector(".experiment-card-action,.recognition-card-v1838f__status")).top,actionWidth:r(card.querySelector(".experiment-card-action,.recognition-card-v1838f__status")).width,cardWidth:r(card).width}))};
  });
  assert.equal(profile.eyebrow,"Principal Product Designer");
  assert.equal(profile.summary,"9+ years designing complex products across fintech, banking, retail, and global travel. I connect customer needs, business rules, and operations from early product direction through production.");
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
  report.viewports[viewport.name]={routes,workHero,experimentHero,ctaGeometry,profile,daily,errors,screenshots:{home:homeShot,experiments:experimentsShot,profile:profileShot,dailyHours:dailyShot}};
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
  const active=page.locator('.domain-project-card-v2[data-wheel-offset="0"]');const project=await active.getAttribute("data-project");await active.click({position:{x:200,y:200}});await page.locator("#detailDialog").waitFor({state:"visible"});report.domainCategories[category.id]={label:category.label,project,title:(await page.locator("#detailTitle").textContent()).trim(),clicks:1};await page.locator("#detailClose").click();await page.locator("#detailDialog").waitFor({state:"hidden"});
}
report.oneClick.workCard=await openDialog("/work",'[data-project="payment"]');await page.locator("#detailClose").click();
await open(page,"/work");const dailyLink=page.locator('a[data-public-work-route="/work/daily-hours"]').first();await dailyLink.scrollIntoViewIfNeeded();await dailyLink.click();await page.waitForURL(/\/work\/daily-hours$/);assert.equal((await page.locator(".csv2-display").innerText()).replace(/\s+/g," ").trim(),"Track work. Decide what’s worth it.");report.oneClick.dailyHours={url:page.url(),clicks:1};
for(const id of ["weekly-design-session","food-testing-workshop","aja-creative-workshop"]){report.oneClick[id]=await openDialog("/experiments",`button[data-experiment="${id}"]`);await page.locator("#detailClose").click()}
await open(page,"/experiments");await page.locator('button[data-experiment="weekly-design-session"]').click();await page.locator("#detailDialog").waitFor({state:"visible"});const moreExperiment=page.locator('#detailRelatedRail button[data-experiment]').first();const moreExperimentId=await moreExperiment.getAttribute("data-experiment");await moreExperiment.click();report.oneClick.moreWorkExperiment={id:moreExperimentId,title:(await page.locator("#detailTitle").textContent()).trim(),clicks:1};await page.locator("#detailClose").click();
await open(page,"/work");await page.locator('[data-project="payment"]').first().click();await page.locator("#detailDialog").waitFor({state:"visible"});const moreWork=page.locator('#detailRelatedRail button[data-project]').first();const moreWorkId=await moreWork.getAttribute("data-project");await moreWork.click();report.oneClick.moreWorkWork={id:moreWorkId,title:(await page.locator("#detailTitle").textContent()).trim(),clicks:1};await page.locator("#detailClose").click();
await open(page,"/");const seeAll=page.locator('#homeExperimentRail a[href="/experiments"]');await seeAll.scrollIntoViewIfNeeded();await seeAll.click();await page.waitForURL(/\/experiments$/);report.oneClick.seeAll={url:page.url(),clicks:1};
report.errors.push(...clickErrors.map(error=>`click: ${error}`));assert.deepEqual(report.errors,[]);
await context.close();await browser.close();
fs.writeFileSync(path.join(outputRoot,"report.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
