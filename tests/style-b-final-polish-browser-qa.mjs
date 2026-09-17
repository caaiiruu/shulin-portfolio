import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require=createRequire(import.meta.url);
const { chromium }=require("playwright");
const baseUrl=process.env.BASE_URL||"http://127.0.0.1:3000";
const outputRoot=process.env.EVIDENCE_DIR||"/tmp/style-b-final-polish-evidence";
const chromePath="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const viewports=[
  {name:"1419",width:1419,height:900},
  {name:"871",width:871,height:1024},
  {name:"430",width:430,height:932},
];
fs.mkdirSync(outputRoot,{recursive:true});
const report={baseUrl,viewports:{},oneClick:{},errors:[]};
const browser=await chromium.launch({headless:true,executablePath:chromePath});

async function settle(page){
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(300);
  await page.evaluate(async()=>Promise.race([Promise.all([...document.images].map(image=>image.complete?true:new Promise(resolve=>{image.addEventListener("load",resolve,{once:true});image.addEventListener("error",resolve,{once:true})}))),new Promise(resolve=>setTimeout(resolve,2000))]));
}
async function open(page,route){
  const response=await page.goto(`${baseUrl}${route}`,{waitUntil:"networkidle"});
  assert.ok(response&&response.status()<400,`${route} HTTP ${response?.status()}`);
  await settle(page);
}
function collectErrors(page,bucket){
  page.on("console",message=>{if(message.type()==="error")bucket.push(`console: ${message.text()}`)});
  page.on("pageerror",error=>bucket.push(`page: ${error.message}`));
  page.on("requestfailed",request=>{const reason=request.failure()?.errorText||"";if(reason!=="net::ERR_ABORTED")bucket.push(`network: ${request.url()} ${reason}`)});
}

for(const viewport of viewports){
  const dir=path.join(outputRoot,viewport.name);fs.mkdirSync(dir,{recursive:true});
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},hasTouch:viewport.width===430,isMobile:viewport.width===430,reducedMotion:"reduce"});
  const page=await context.newPage();
  const errors=[];collectErrors(page,errors);
  await open(page,"/site/");
  const home=await page.evaluate(()=>{
    const rect=node=>{const r=node?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}:null};
    const principles=[...document.querySelectorAll(".principle-node")];
    const rail=document.querySelector("#homeExperimentRail");
    const header=document.querySelector("#homeExperiments .experiment-index-v36__head");
    const controls=document.querySelector("#homeExperiments .experiment-index-v36__controls");
    const last=rail?.lastElementChild;
    const style=node=>node?getComputedStyle(node):null;
    return {
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      principleCount:principles.length,
      principleHeaders:principles.map(node=>({
        number:rect(node.querySelector(".principle-node__number")),
        heading:rect(node.querySelector(".principle-node__heading")),
        toggle:rect(node.querySelector(".principle-node__toggle")),
        borderTop:style(node)?.borderTopWidth,
      })),
      constellationBorderBottom:style(document.querySelector(".principle-constellation"))?.borderBottomWidth,
      controlsInHeader:Boolean(controls&&header?.contains(controls)),
      headerRect:rect(header),controlsRect:rect(controls),
      rail:{clientWidth:rail?.clientWidth,scrollWidth:rail?.scrollWidth,childCount:rail?.children.length,lastClass:last?.className,lastHref:last?.getAttribute("href")},
      seeAllIsLast:last?.classList.contains("experiment-index-card-v36--see-all")||false,
      standaloneHeaderCta:Boolean(document.querySelector(".experiment-index-v36__all")),
      loaderActivePointerEvents:(()=>{const loader=document.querySelector(".portfolio-loader-v59");loader?.classList.add("is-active");const value=loader?getComputedStyle(loader).pointerEvents:null;loader?.classList.remove("is-active");return value})(),
    };
  });
  assert.ok(home.overflow<=1,`${viewport.name} homepage overflow ${home.overflow}`);
  assert.equal(home.principleCount,4);
  assert.equal(home.constellationBorderBottom,"0px");
  assert.ok(home.principleHeaders.every(item=>item.heading&&item.number&&item.toggle&&item.borderTop==="0px"));
  assert.equal(home.controlsInHeader,true);
  assert.equal(home.seeAllIsLast,true);
  assert.equal(home.standaloneHeaderCta,false);
  assert.equal(home.rail.lastHref,"/experiments");
  assert.equal(home.loaderActivePointerEvents,"none");

  const firstPrinciple=page.locator(".principle-node__trigger").first();
  await firstPrinciple.click();
  const panel=page.locator(".principle-node.is-active .principle-node__panel");
  await panel.waitFor({state:"visible"});
  const panelColumns=await panel.evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length);
  if(viewport.width===430)assert.equal(panelColumns,1);else assert.equal(panelColumns,2);

  await page.locator("#homeExperiments").scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(dir,"homepage-full.png"),fullPage:true});
  await page.locator("#homeExperiments").screenshot({path:path.join(dir,"homepage-experiments.png")});
  await page.locator(".principles-v38").screenshot({path:path.join(dir,"homepage-principles.png")});

  const nextControl=page.locator('[data-rail-next="homeExperimentRail"]');
  let controlClicks=0;
  while(!(await nextControl.isDisabled())&&controlClicks<12){
    await nextControl.click();controlClicks+=1;await page.waitForTimeout(450);
  }
  assert.ok(controlClicks>0&&controlClicks<12,`${viewport.name} rail next control did not settle`);
  assert.equal(await nextControl.isDisabled(),true,`${viewport.name} rail next control did not disable at end`);
  const railResult=await page.locator("#homeExperimentRail").evaluate((rail,controlClicks)=>{
    const max=rail.scrollWidth-rail.clientWidth;
    const last=rail.lastElementChild.getBoundingClientRect();
    const rr=rail.getBoundingClientRect();
    const first=rail.firstElementChild.getBoundingClientRect();
    return {controlClicks,max,scrollLeft:rail.scrollLeft,lastVisible:last.left>=rr.left-1&&last.right<=rr.right+1,last:{left:last.left,right:last.right,width:last.width,height:last.height},first:{width:first.width,height:first.height},rail:{left:rr.left,right:rr.right}};
  },controlClicks);
  assert.ok(Math.abs(railResult.max-railResult.scrollLeft)<=2,`${viewport.name} rail did not reach max`);
  assert.equal(railResult.lastVisible,true);
  assert.ok(Math.abs(railResult.last.height-railResult.first.height)<=2,`${viewport.name} See all card height ${railResult.last.height} does not match ${railResult.first.height}`);
  await page.evaluate(()=>document.querySelector("#homeExperiments")?.scrollIntoView({block:"start"}));
  await page.waitForTimeout(100);
  await page.screenshot({path:path.join(dir,"homepage-experiments-end.png")});
  await page.locator("#homeExperimentRail > :last-child").screenshot({path:path.join(dir,"homepage-see-all-card.png")});

  await open(page,"/site/experiments");
  await page.locator("#experimentPageRail").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const experimentHero=await page.evaluate(()=>({
    h1:[...document.querySelectorAll("main h1")].filter(node=>node.getClientRects().length).map(node=>node.textContent.trim()),
    kicker:document.querySelector(".playground-hero-v32 .kicker")?.textContent.trim(),
    paragraph:document.querySelector(".playground-hero-v32 .lead-copy")?.textContent.trim(),
    art:Boolean(document.querySelector(".playground-hero-v32__art")),
    duplicateHeading:Boolean(document.querySelector(".experiment-index-v36__head")),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  }));
  assert.equal(experimentHero.h1.length,1);
  assert.equal(experimentHero.h1[0],"Different questions. Different stages.");
  assert.equal(experimentHero.kicker,"Experiment");
  assert.equal(experimentHero.paragraph,"Ongoing explorations outside client and product work. Small tests, facilitation experiments, and ideas I keep developing over time.");
  assert.equal(experimentHero.art,false);
  assert.equal(experimentHero.duplicateHeading,false);
  assert.ok(experimentHero.overflow<=1);
  await page.screenshot({path:path.join(dir,"experiments-full.png"),fullPage:true});

  await open(page,"/site/profile");
  const profile=await page.evaluate(()=>({
    label:document.querySelector(".profile-hero-v36__label")?.textContent.trim(),
    heroH1:document.querySelector(".profile-hero-v36 h1")?.textContent.trim()||"",
    valueHeading:document.querySelector(".profile-value-v44 h2")?.textContent.trim(),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
  }));
  assert.equal(profile.label,"SENIOR PRODUCT DESIGNER");
  assert.equal(profile.heroH1,"");
  assert.equal(profile.valueHeading,"Where I add value");
  assert.ok(profile.overflow<=1);
  await page.locator(".profile-hero-v36").screenshot({path:path.join(dir,"profile-hero.png")});

  report.viewports[viewport.name]={home,railResult,experimentHero,profile,errors,screenshots:{
    homepage:path.join(dir,"homepage-full.png"),
    experimentRailEnd:path.join(dir,"homepage-experiments-end.png"),
    seeAllCard:path.join(dir,"homepage-see-all-card.png"),
    experiments:path.join(dir,"experiments-full.png"),
    profile:path.join(dir,"profile-hero.png"),
  }};
  report.errors.push(...errors.map(error=>`${viewport.name}: ${error}`));
  await context.close();
}

// Exact one-click tests at desktop.
const context=await browser.newContext({viewport:{width:1419,height:900},reducedMotion:"reduce"});
const page=await context.newPage();const clickErrors=[];collectErrors(page,clickErrors);
async function assertDialogClick(route,selector,expectedId){
  await open(page,route);
  const trigger=page.locator(selector).first();
  assert.equal(await trigger.count(),1,`missing ${selector}`);
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const dialog=page.locator("#detailDialog");
  await dialog.waitFor({state:"visible"});
  const state=await page.evaluate(id=>({
    open:document.querySelector("#detailDialog")?.open,
    title:document.querySelector("#detailTitle")?.textContent.trim(),
    activeExperiment:document.querySelector("#detailDialog")?.classList.contains("is-experiment"),
    url:location.href,
    loaderPointer:getComputedStyle(document.querySelector(".portfolio-loader-v59")).pointerEvents,
    targetPresent:Boolean(document.querySelector(`#detailDialog [data-experiment="${id}"],#detailDialog [data-project="${id}"]`)),
  }),expectedId);
  assert.equal(state.open,true);
  assert.ok(state.title);
  assert.equal(state.loaderPointer,"none");
  return state;
}
report.oneClick.payment=await assertDialogClick("/site/work",'[data-project="payment"]',"payment");
await page.locator("#detailClose").click();
await open(page,"/site/");
await page.locator(".principle-node__trigger").first().click();
const principleCta=page.locator(".principle-node.is-active .principle-node__case-cta");
await principleCta.click();
await page.locator("#detailDialog").waitFor({state:"visible"});
report.oneClick.principleCase={title:await page.locator("#detailTitle").textContent(),url:page.url()};
await page.locator("#detailClose").click();
await open(page,"/site/work");
const daily=page.locator('a[data-public-work-route="/work/daily-hours"]').first();
assert.equal(await daily.count(),1);
await daily.scrollIntoViewIfNeeded();await daily.click();
await page.waitForURL(/\/work\/daily-hours$/);
await page.waitForTimeout(300);
const dailyVisibleText=(await page.locator("body").innerText()).trim();
assert.ok(dailyVisibleText.includes("Daily Hours"));
report.oneClick.dailyHours={url:page.url(),visibleDailyHours:dailyVisibleText.includes("Daily Hours"),title:await page.title()};
await open(page,"/site/");
const seeAll=page.locator('#homeExperimentRail a[href="/experiments"]').first();
await seeAll.scrollIntoViewIfNeeded();await seeAll.click();
await page.waitForURL(/\/experiments$/);
report.oneClick.seeAll={url:page.url(),title:await page.title()};
for(const id of ["weekly-design-session","food-testing-workshop","aja-creative-workshop"]){
  report.oneClick[id]=await assertDialogClick("/site/experiments",`button[data-experiment="${id}"]`,id);
}
await open(page,"/site/experiments");
await page.locator('button[data-experiment="weekly-design-session"]').first().click();
await page.locator("#detailDialog").waitFor({state:"visible"});
const originalTitle=await page.locator("#detailTitle").textContent();
const moreWork=page.locator('#detailRelatedRail button[data-experiment]').first();
await moreWork.waitFor({state:"visible"});
await page.locator("#detailRelated").screenshot({path:path.join(outputRoot,"1419","more-work-shared-cards.png")});
const relatedId=await moreWork.getAttribute("data-experiment");
await moreWork.click();
await page.waitForFunction(title=>document.querySelector("#detailTitle")?.textContent.trim()!==title.trim(),originalTitle);
report.oneClick.moreWork={relatedId,title:await page.locator("#detailTitle").textContent(),backVisible:await page.locator("#detailBack").isVisible()};
report.errors.push(...clickErrors.map(error=>`click: ${error}`));
assert.deepEqual(report.errors,[]);
await context.close();
await browser.close();
fs.writeFileSync(path.join(outputRoot,"report.json"),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
