import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl=process.env.BASE_URL||"http://127.0.0.1:3000";
const browser=await chromium.launch({headless:true});
const failures=[];

const arrowState=async(locator)=>locator.evaluate(node=>{
  const arrow=node.matches(".icon-arrow")?node:node.querySelector(".icon-arrow");
  if(!arrow)return null;
  const matrix=getComputedStyle(arrow).transform;
  const semantic=node.closest("[data-cta-semantic]")?.dataset.ctaSemantic||null;
  return {matrix,semantic,classes:[...arrow.classList]};
});

for(const width of [1419,871,430]){
  const context=await browser.newContext({viewport:{width,height:width===1419?900:width===871?1024:932}});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  page.on("console",message=>{if(message.type()==="error")errors.push(message.text())});

  await page.goto(`${baseUrl}/`,{waitUntil:"networkidle"});
  const guide=page.locator(".hero__cta");
  const guideState=await arrowState(guide);
  if(guideState?.semantic!=="in-page-guide"||!guideState.classes.includes("icon-arrow--down")||guideState.matrix!=="matrix(1, 0, 0, 1, 0, 0)")failures.push(`${width} in-page guide semantic/icon mismatch: ${JSON.stringify(guideState)}`);

  const experimentCta=page.locator("#homeExperiments .experiment-index-card-v36 .experiment-card-action").first();
  const experimentState=await arrowState(experimentCta);
  if(experimentState?.semantic!=="navigation"||!experimentState.classes.includes("icon-arrow--right")||experimentState.matrix==="matrix(1, 0, 0, 1, 0, 0)")failures.push(`${width} View Experiment final arrow mismatch: ${JSON.stringify(experimentState)}`);

  await page.goto(`${baseUrl}/profile`,{waitUntil:"networkidle"});
  for(const label of ["Global rollout","Voucher ecosystem"]){
    const card=page.locator(".timeline-evidence-v34").filter({hasText:label}).first();
    if(!await card.count()){failures.push(`${width} missing ${label} rendered View Case branch`);continue}
    const state=await arrowState(card);
    if(state?.semantic!=="navigation"||!state.classes.includes("icon-arrow--right")||state.matrix==="matrix(1, 0, 0, 1, 0, 0)")failures.push(`${width} ${label} final arrow mismatch: ${JSON.stringify(state)}`);
  }
  const spotify=page.locator('a[href="https://open.spotify.com/track/1hi6Syd4iRkwvmZzvV4c6T"]');
  const spotifyState=await arrowState(spotify);
  if(spotifyState?.semantic!=="external"||!spotifyState.classes.includes("icon-arrow--up-right"))failures.push(`${width} Spotify external arrow mismatch: ${JSON.stringify(spotifyState)}`);

  await page.goto(`${baseUrl}/work`,{waitUntil:"networkidle"});
  const scroll=page.locator("#detailDialog .dialog-scroll");
  const openProject=async key=>{
    await page.locator(`[data-project="${key}"]`).first().click();
    await page.locator("#detailDialog[open]").waitFor({state:"visible"});
    await page.waitForTimeout(80);
  };
  for(const [first,second] of [["payment","dbs"],["dbs","booking"],["booking","bandzo"],["bandzo","payment"],["payment","voucher"]]){
    await openProject(first);
    await scroll.evaluate(node=>{node.scrollTop=Math.max(500,(node.scrollHeight-node.clientHeight)*.7)});
    assert.ok(await scroll.evaluate(node=>node.scrollTop)>100);
    await page.locator("#detailClose").click();
    await page.locator("#detailDialog").waitFor({state:"hidden"});
    await openProject(second);
    const top=await scroll.evaluate(node=>node.scrollTop);
    if(top>2)failures.push(`${width} fresh ${first} -> ${second} inherited scrollTop ${top}`);
    await page.locator("#detailClose").click();
    await page.locator("#detailDialog").waitFor({state:"hidden"});
  }

  await openProject("payment");
  const disclosure=page.locator("#projectSectionNavToggle");
  await disclosure.evaluate(node=>{node.hidden=false});
  const collapsedState=await arrowState(disclosure);
  if(collapsedState?.semantic!=="disclosure"||!collapsedState.classes.includes("icon-arrow--down")||collapsedState.matrix!=="matrix(1, 0, 0, 1, 0, 0)")failures.push(`${width} collapsed disclosure mismatch: ${JSON.stringify(collapsedState)}`);
  await disclosure.click();
  await page.waitForTimeout(250);
  const expandedState=await arrowState(disclosure);
  if(expandedState?.semantic!=="disclosure"||!expandedState.classes.includes("icon-arrow--up")||expandedState.matrix==="matrix(1, 0, 0, 1, 0, 0)")failures.push(`${width} expanded disclosure mismatch: ${JSON.stringify(expandedState)}`);
  await disclosure.click();
  await page.waitForTimeout(250);
  await scroll.evaluate(node=>{node.scrollTop=Math.max(500,(node.scrollHeight-node.clientHeight)*.6)});
  await page.waitForTimeout(320);
  const paymentTop=await scroll.evaluate(node=>node.scrollTop);
  const related=page.locator('#detailRelated [data-project]:not([data-project="payment"])').first();
  await related.click();
  await page.waitForTimeout(80);
  const relatedTop=await scroll.evaluate(node=>node.scrollTop);
  if(relatedTop>2)failures.push(`${width} explicit Related Work did not start at top: ${relatedTop}`);
  await page.goBack({waitUntil:"networkidle"});
  await page.waitForTimeout(80);
  const backTop=await scroll.evaluate(node=>node.scrollTop);
  if(backTop<Math.min(100,paymentTop*.2))failures.push(`${width} Back did not restore governed Payment position: ${backTop}/${paymentTop}`);
  await page.goForward({waitUntil:"networkidle"});
  await page.waitForTimeout(80);
  const forwardTop=await scroll.evaluate(node=>node.scrollTop);
  if(forwardTop>2)failures.push(`${width} Forward did not restore governed Related Work top: ${forwardTop}`);

  if(errors.length)failures.push(`${width} runtime errors: ${JSON.stringify(errors)}`);
  await context.close();
}

await browser.close();
assert.deepEqual(failures,[]);
console.log("R183.8F.2 rendered CTA semantics and popup scroll lifecycle PASS");
