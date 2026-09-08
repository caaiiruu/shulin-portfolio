import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl=process.env.BASE_URL||"http://127.0.0.1:3000";
const outputRoot=process.env.EVIDENCE_DIR||"/tmp/r1839b-canonical-qa";
const projects=["voucher","voucher-center","game-center","dbs","booking","bandzo","taishin-p2p-marketplace-platform","cathay-mortgage-assistant","payment","cathay-sit-online-account-opening","cathay-sit-review-remediation-operations","ctbc-mortgage-self-service-app","booking-taxi-pickup-service-strategy"];
const viewports=[{name:"1419",width:1419,height:900},{name:"871",width:871,height:1024},{name:"430",width:430,height:932}];
const duplicateSupportSingle=new Set(["dbs","payment","cathay-mortgage-assistant"]);
const duplicateSupportExcluded=new Set(["cathay-sit-online-account-opening"]);
const legacySupportMerged=new Set(["voucher","booking","bandzo","taishin-p2p-marketplace-platform","ctbc-mortgage-self-service-app"]);
const focused=[
  ["voucher","#projectKeyIntervention","legacy-label-removed-transformation"],
  ["voucher",".contribution-block","voucher-contribution"],
  ["voucher-center",".contribution-block","voucher-center-contribution"],
  ["game-center",".contribution-block","game-center-contribution"],
  ["dbs",".contribution-block","dbs-deduplication"],
  ["payment",".contribution-block","payment-deduplication"],
  ["booking-taxi-pickup-service-strategy","#projectKeyIntervention","booking-taxi-transformation"],
  ["booking-taxi-pickup-service-strategy",".contribution-block","booking-taxi-contribution"],
];
const failures=[];
const report={generatedAt:new Date().toISOString(),baseUrl,projects,viewports:viewports.map(item=>item.width),combinations:0,canonicalScreenshots:[],focusedScreenshots:[],results:{},interactionSmoke:{}};
fs.mkdirSync(outputRoot,{recursive:true});
const content=JSON.parse(fs.readFileSync("public/site/content/portfolio-content.json","utf8"));
const browser=await chromium.launch({headless:true});

for(const viewport of viewports){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},hasTouch:viewport.width===430,isMobile:viewport.width===430});
  const page=await context.newPage();
  page.setDefaultNavigationTimeout(60000);
  const consoleErrors=[],runtimeErrors=[];
  page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text())});
  page.on("pageerror",error=>runtimeErrors.push(error.message));
  report.results[viewport.name]={};
  for(const project of projects){
    console.log(`Checking ${viewport.name} ${project}`);
    const response=await page.goto(`${baseUrl}/site/work.html?case=${project}`,{waitUntil:"networkidle"});
    try{await page.waitForSelector("#detailDialog[open]",{timeout:15000})}catch(error){throw new Error(`${viewport.name} ${project}: dialog timeout at ${page.url()} — ${error.message}`)}
    const legacySupport=content.projects[project].keyInterventionMap.supportingCopy.en;
    const result=await page.evaluate(({project,legacySupport})=>{
      const dialog=document.querySelector("#detailDialog"),scroll=dialog.querySelector(".dialog-scroll"),visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=="none"&&getComputedStyle(node).visibility!=="hidden"&&node.getClientRects().length);
      const transformation=[...dialog.querySelectorAll("#projectKeyIntervention")].filter(visible),contributions=[...dialog.querySelectorAll(".contribution-block")].filter(visible),accountability=[...dialog.querySelectorAll("#systemCaseAccountabilitySection,#voucherOwnershipSection")].filter(visible);
      const labels=transformation[0]?[...transformation[0].querySelectorAll(".key-intervention-map__label")].map(node=>node.textContent.trim().toUpperCase()):[];
      const body=dialog.innerText,contributionText=contributions.map(node=>node.innerText).join("\n"),supportNode=dialog.querySelector("#projectKeyInterventionSupporting"),contributionRect=contributions[0]?.getBoundingClientRect();
      const exactOccurrences=text=>text?body.split(text).length-1:0;
      return{
        title:[...dialog.querySelectorAll("#projectKeyIntervention .key-intervention-map__title")].filter(visible).map(node=>node.textContent.trim()),
        transformationCount:transformation.length,
        labels,
        transformationNodes:transformation[0]?.querySelectorAll(".key-intervention-map__node").length||0,
        supportHidden:Boolean(supportNode?.hidden),supportText:supportNode?.textContent.trim()||"",
        contributionCount:contributions.length,
        contributionHeadingCount:[...dialog.querySelectorAll("h2,h3")].filter(node=>visible(node)&&node.textContent.trim()==="Contribution").length,
        contributionWidth:contributionRect?.width||0,
        contributionHasLegacySupport:contributionText.includes(legacySupport),
        legacySupportOccurrences:exactOccurrences(legacySupport),
        accountabilityCount:accountability.length,
        accountabilityNestedInContribution:Boolean(contributions[0]?.querySelector("#systemCaseAccountabilitySection,#voucherOwnershipSection")),
        legacyLabel:/where i changed the system/i.test(body),
        horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        outcomesPresent:project==="voucher"
          ?[...dialog.querySelectorAll("#voucherImpactSection")].some(visible)
          :[...dialog.querySelectorAll("#systemCaseOutcomesSection")].some(visible),
        paymentProtected:project!=="payment"||Boolean(dialog.querySelectorAll("#systemCaseDecisionsSection .decision-card-v46").length===4&&dialog.querySelector("#systemCaseEvidenceSection")&&dialog.querySelector(".outcome-recognition-proof")),
        voucherProtected:project!=="voucher"||JSON.stringify([...dialog.querySelectorAll("#projectSectionNav a")].filter(visible).map(node=>node.textContent.trim()))===JSON.stringify(["Overview","Complexity","Solutions","Evidence","Outcomes","Ownership"]),
        taxiForbidden:project!=="booking-taxi-pickup-service-strategy"||["~7%","~150 rides","40+ countries","2 weeks"].filter(claim=>body.includes(claim)),
      };
    },{project,legacySupport});
    report.combinations+=1;report.results[viewport.name][project]=result;
    const prefix=`${viewport.name} ${project}`;
    if(!response?.ok())failures.push(`${prefix}: HTTP ${response?.status()}`);
    if(result.transformationCount!==1||result.transformationNodes!==3||JSON.stringify(result.labels)!==JSON.stringify(["BEFORE","SYSTEM CHANGE","AFTER"])||result.labels.includes("MY INTERVENTION"))failures.push(`${prefix}: invalid Transformation ${JSON.stringify(result)}`);
    if(JSON.stringify(result.title)!==JSON.stringify(["Transformation"]))failures.push(`${prefix}: Transformation title ${JSON.stringify(result.title)}`);
    if(!result.supportHidden||result.supportText)failures.push(`${prefix}: legacy support rendered inside Transformation`);
    if(result.contributionCount!==1||result.contributionHeadingCount!==1)failures.push(`${prefix}: Contribution count ${result.contributionCount}/${result.contributionHeadingCount}`);
    if(result.contributionWidth<280||result.contributionWidth>1282)failures.push(`${prefix}: Contribution width ${result.contributionWidth}`);
    if(result.accountabilityCount!==1||result.accountabilityNestedInContribution)failures.push(`${prefix}: Accountability separation failed`);
    if(result.legacyLabel)failures.push(`${prefix}: legacy label visible`);
    if(result.horizontalOverflow>1)failures.push(`${prefix}: horizontal overflow ${result.horizontalOverflow}`);
    if(duplicateSupportSingle.has(project)&&result.legacySupportOccurrences!==1)failures.push(`${prefix}: duplicate support did not resolve to one Contribution instance`);
    if(duplicateSupportExcluded.has(project)&&result.legacySupportOccurrences!==0)failures.push(`${prefix}: duplicate transformation support remained`);
    if(legacySupportMerged.has(project)&&result.legacySupportOccurrences!==1)failures.push(`${prefix}: unique legacy support not consolidated exactly once`);
    if(!result.outcomesPresent)failures.push(`${prefix}: governed Outcomes missing`);
    if(!result.paymentProtected||!result.voucherProtected||result.taxiForbidden.length)failures.push(`${prefix}: protected project contract failed ${JSON.stringify(result.taxiForbidden)}`);
    const screenshotPath=path.join(outputRoot,`${String(projects.indexOf(project)+1).padStart(2,"0")}-${project}-${viewport.name}.png`);
    await page.locator("#detailDialog .dialog-scroll").screenshot({path:screenshotPath});report.canonicalScreenshots.push(screenshotPath);
    if(viewport.name==="1419")for(const [focusProject,selector,label] of focused.filter(item=>item[0]===project)){
      const focusedPath=path.join(outputRoot,`focus-${label}.png`);await page.locator(selector).screenshot({path:focusedPath});report.focusedScreenshots.push(focusedPath);
    }
    await page.keyboard.press("Escape");await page.waitForFunction(()=>!document.querySelector("#detailDialog")?.open);
  }
  if(consoleErrors.length)failures.push(`${viewport.name}: console errors ${JSON.stringify(consoleErrors)}`);
  if(runtimeErrors.length)failures.push(`${viewport.name}: runtime errors ${JSON.stringify(runtimeErrors)}`);
  await context.close();
}

{
  const context=await browser.newContext({viewport:{width:1419,height:900}}),page=await context.newPage();
  await page.goto(`${baseUrl}/site/work.html`,{waitUntil:"networkidle"});
  await page.locator('[data-project="dbs"]').first().click();await page.waitForSelector("#detailDialog[open]");
  const opened=await page.locator("#detailDialog[open]").count();
  const nav=page.locator('#projectSectionNav a[href="#systemCaseDecisionsSection"]');await nav.click();
  const anchorReached=await page.evaluate(()=>location.hash==="#systemCaseDecisionsSection");
  const related=page.locator('#detailRelated [data-project]').first();const hasRelated=await related.count();if(hasRelated)await related.click();
  const relatedOpened=hasRelated?await page.locator("#detailDialog[open]").count():0;
  await page.goBack();await page.waitForTimeout(250);const backRestored=await page.locator("#detailDialog[open]").count();
  await page.goForward();await page.waitForTimeout(250);const forwardOpen=await page.locator("#detailDialog[open]").count();
  const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth));
  report.interactionSmoke={opened,anchorReached,hasRelated,relatedOpened,backRestored,forwardOpen,overflow};
  if(!opened||!anchorReached||!hasRelated||!relatedOpened||!backRestored||!forwardOpen||overflow>1)failures.push(`interaction smoke failed ${JSON.stringify(report.interactionSmoke)}`);
  await context.close();
}

await browser.close();
report.failures=failures;report.status=failures.length?"FAIL":"PASS";
fs.writeFileSync(path.join(outputRoot,"r1839b-browser-qa.json"),`${JSON.stringify(report,null,2)}\n`);
if(failures.length)throw new Error(failures.join("\n"));
console.log(`R183.9B BROWSER QA PASS — ${report.combinations}/39 combinations, ${report.canonicalScreenshots.length} canonical screenshots, ${report.focusedScreenshots.length} focused screenshots`);
