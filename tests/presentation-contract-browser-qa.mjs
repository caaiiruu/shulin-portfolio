import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl=process.env.BASE_URL||"http://127.0.0.1:3000";
const evidenceRoot=process.env.EVIDENCE_DIR||"/tmp/r1833a-presentation-contract";
const content=JSON.parse(fs.readFileSync("public/site/content/portfolio-content.json","utf8"));
const contracts=content.implementationContracts.portfolioPresentation;
const primaryIds=Object.keys(content.projects);
const experimentRecords={...(content.experiments||{}),...(content.sideProjects||{})};
const experimentIds=Object.entries(experimentRecords)
  .filter(([,record])=>!String(record.contentStatus||"").includes("standalone-card-review"))
  .map(([id])=>id);
const viewports=[
  {name:"1419",width:1419,height:900},
  {name:"871",width:871,height:1024},
  {name:"430",width:430,height:932},
];
const failures=[];
const report={generatedAt:new Date().toISOString(),baseUrl,primary:{},experiments:{}};
const browser=await chromium.launch({headless:true});

const inspectDialog=()=>{
  const visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=="none"&&getComputedStyle(node).visibility!=="hidden"&&node.getClientRects().length);
  const dialog=document.querySelector("#detailDialog");
  const surface=document.querySelector("#programmeSurface");
  const sections=[...surface.children].filter(visible);
  const overviewBody=document.querySelector("#projectAtGlance");
  const infoValue=document.querySelector("#projectSignals strong");
  const summary=document.querySelector(".quick-view-v51--project .project-summary-v45");
  const infoGrid=document.querySelector("#projectSignals");
  const complexity=document.querySelector(".recruiter-complexity-grid");
  const outcomes=document.querySelector("#systemCaseOutcomesSection");
  const style=node=>node?getComputedStyle(node):null;
  const rect=node=>node?Object.fromEntries(["left","right","width"].map(key=>[key,Math.round(node.getBoundingClientRect()[key])])):null;
  return {
    open:Boolean(dialog?.open),
    horizontalOverflow:dialog?dialog.scrollWidth>dialog.clientWidth:false,
    slots:sections.map(node=>node.dataset.canonicalSectionId).filter(Boolean),
    components:sections.map(node=>({slot:node.dataset.canonicalSectionId||"",owner:node.dataset.componentOwner||node.dataset.caseStudyComponent||"",variant:node.dataset.evidenceVariant||"",source:node.dataset.semanticSource||""})),
    navigator:[...document.querySelectorAll("#projectSectionNav a")].filter(visible).map(node=>({label:node.textContent.trim(),target:node.getAttribute("href")?.slice(1)||"",targetExists:Boolean(document.querySelector(node.getAttribute("href")))})),
    forbiddenHeadings:[...dialog.querySelectorAll("h2,h3")].filter(visible).map(node=>node.textContent.trim()).filter(text=>/^(Contribution|Core contribution|Key Problems|Critical Problem|Business Impact)$/i.test(text)),
    blankSections:sections.filter(node=>!node.textContent.trim()&&!node.querySelector("img,video,svg")).length,
    overview:{
      body:overviewBody&&style(overviewBody)?{fontSize:style(overviewBody).fontSize,fontWeight:style(overviewBody).fontWeight,color:style(overviewBody).color,lineHeight:style(overviewBody).lineHeight}:null,
      info:infoValue&&style(infoValue)?{fontSize:style(infoValue).fontSize,fontWeight:style(infoValue).fontWeight,color:style(infoValue).color,lineHeight:style(infoValue).lineHeight}:null,
      dividers:[...document.querySelectorAll("#projectSignals > div")].filter(node=>style(node).borderBottomWidth!=="0px"||style(node).borderTopWidth!=="0px").length,
      summaryRect:rect(summary),
      infoGridRect:rect(infoGrid),
    },
    complexity:complexity?{variant:complexity.dataset.layoutVariant,columns:style(complexity).gridTemplateColumns,rect:rect(complexity)}:null,
    outcomes:outcomes?{semantic:outcomes.dataset.outcomeSemantic,owner:outcomes.dataset.componentOwner}:null,
  };
};

for(const viewport of viewports){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},isMobile:viewport.width===430,hasTouch:viewport.width===430});
  const page=await context.newPage();
  page.setDefaultNavigationTimeout(60000);
  const screenshotDir=path.join(evidenceRoot,viewport.name);
  fs.mkdirSync(screenshotDir,{recursive:true});
  for(const id of primaryIds){
    const response=await page.goto(`${baseUrl}/site/work/${id}`,{waitUntil:"networkidle"});
    await page.waitForFunction(()=>document.querySelector("#detailDialog")?.open);
    const result=await page.evaluate(inspectDialog);
    report.primary[id]??={};report.primary[id][viewport.name]=result;
    const prefix=`${viewport.name} Primary ${id}`;
    if(!response?.ok())failures.push(`${prefix}: HTTP ${response?.status()}`);
    if(!result.open)failures.push(`${prefix}: dialog did not open`);
    if(result.horizontalOverflow)failures.push(`${prefix}: horizontal overflow`);
    if(result.forbiddenHeadings.length)failures.push(`${prefix}: forbidden headings ${result.forbiddenHeadings.join(", ")}`);
    if(result.blankSections)failures.push(`${prefix}: ${result.blankSections} blank sections`);
    const orderIndexes=result.slots.map(slot=>contracts.archetypes.primary.canonicalOrder.indexOf(({"what-made-this-hard":"complexity","core-system-insight":"core-insight","key-design-decisions":"decisions","evidence":"evidence","outcomes":"outcomes","my-accountability":"ownership","continue-exploring":"related-work"})[slot]||slot));
    if(orderIndexes.some(index=>index<0)||orderIndexes.some((index,item)=>item&&index<orderIndexes[item-1]))failures.push(`${prefix}: non-contract order ${result.slots.join(" > ")}`);
    const navTargets=result.navigator.map(item=>item.target);
    if(new Set(navTargets).size!==navTargets.length||result.navigator.some(item=>!item.targetExists))failures.push(`${prefix}: invalid navigator targets`);
    if(result.navigator[0]?.label!=="Overview")failures.push(`${prefix}: required Overview navigator slot missing or out of order`);
    if(result.overview.dividers)failures.push(`${prefix}: InfoGrid divider remains`);
    if(result.overview.body&&result.overview.info&&JSON.stringify(result.overview.body)!==JSON.stringify(result.overview.info))failures.push(`${prefix}: Overview body semantic mismatch ${JSON.stringify(result.overview)}`);
    const approvedComplexity=contracts.approvedBaseline.semanticVariants.complexity.projects[id];
    const approvedOutcome=contracts.approvedBaseline.semanticVariants.outcomes.projects[id];
    if(result.complexity?.variant!==approvedComplexity)failures.push(`${prefix}: Complexity variant ${result.complexity?.variant} != ${approvedComplexity}`);
    if(result.outcomes?.semantic!==approvedOutcome)failures.push(`${prefix}: Outcome semantic ${result.outcomes?.semantic} != ${approvedOutcome}`);
    const expectedOutcomeOwner=approvedOutcome==="quantified"?"OutcomeMetric":"OutcomeStatement";
    if(result.outcomes?.owner!==expectedOutcomeOwner)failures.push(`${prefix}: Outcome owner ${result.outcomes?.owner} != ${expectedOutcomeOwner}`);
    if(viewport.width===1419&&result.overview.summaryRect&&result.overview.infoGridRect&&result.overview.summaryRect.width>=result.overview.infoGridRect.width*1.8)failures.push(`${prefix}: At a Glance summary lost governed compact span`);
    if(result.overview.summaryRect&&result.complexity?.rect&&Math.abs(result.overview.summaryRect.left-result.complexity.rect.left)>1)failures.push(`${prefix}: canonical left anchor drift ${result.overview.summaryRect.left} != ${result.complexity.rect.left}`);
    if(["dbs","bandzo","payment","ctbc-mortgage-self-service-app","voucher","booking","cathay-sit-online-account-opening","voucher-center","game-center"].includes(id))await page.screenshot({path:path.join(screenshotDir,`primary-${id}.png`),fullPage:true});
  }
  for(const id of experimentIds){
    await page.goto(`${baseUrl}/site/experiments`,{waitUntil:"networkidle"});
    const card=page.locator(`[data-experiment="${id}"]`).first();
    if(!await card.count()){failures.push(`${viewport.name} Experiment ${id}: public card missing`);continue}
    await card.click();
    await page.waitForFunction(()=>document.querySelector("#detailDialog")?.open);
    const result=await page.evaluate(inspectDialog);
    report.experiments[id]??={};report.experiments[id][viewport.name]=result;
    const prefix=`${viewport.name} Experiment ${id}`;
    if(result.horizontalOverflow)failures.push(`${prefix}: horizontal overflow`);
    if(result.blankSections)failures.push(`${prefix}: blank optional section`);
    if(result.forbiddenHeadings.length)failures.push(`${prefix}: Primary legacy heading leaked`);
    await page.screenshot({path:path.join(screenshotDir,`experiment-${id}.png`),fullPage:true});
  }
  await context.close();
}
await browser.close();

fs.mkdirSync(evidenceRoot,{recursive:true});
fs.writeFileSync(path.join(evidenceRoot,"report.json"),JSON.stringify(report,null,2));
assert.deepEqual(experimentIds.length,7,"Exactly seven public Experiment records must be contract-audited");
assert.deepEqual(failures,[],failures.join("\n"));
console.log(`R183.3A browser contract QA passed: ${primaryIds.length} Primary + ${experimentIds.length} Experiment records at 1419/871/430.`);
console.log(`Evidence: ${evidenceRoot}`);
