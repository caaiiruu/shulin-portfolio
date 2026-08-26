import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright";

// R159.3 acceptance is based on rendered geometry, computed style, interaction visibility, and fresh screenshots.
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const outputRoot = process.env.EVIDENCE_DIR || "/tmp/portfolio-engineering-qa";
const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1419", width: 1419, height: 900 },
  { name: "tablet-871", width: 871, height: 1024 },
  { name: "mobile-430", width: 430, height: 932 },
];
const primaryIds=['voucher','voucher-center','game-center','dbs','booking','bandzo','payment','cathay-sit-online-account-opening','taishin-p2p-marketplace-platform','cathay-mortgage-assistant','cathay-sit-review-remediation-operations','ctbc-mortgage-self-service-app','booking-taxi-pickup-service-strategy'];
const routes = ["/site/", "/site/work", "/site/experiments", ...primaryIds.map(id=>`/site/work/${id}`)];
const failures = [];
const report = { baseUrl, viewports: {} };
const browser = await chromium.launch({ headless: true });

for (const viewport of viewports) {
  const directory = path.join(outputRoot, "viewports", viewport.name);
  fs.mkdirSync(directory, { recursive: true });
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    hasTouch: viewport.width <= 430,
    isMobile: viewport.width <= 430,
  });
  const page = await context.newPage();
  await page.addInitScript(()=>{
    window.__r182Vitals={cls:0,lcp:0};
    new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__r182Vitals.cls+=entry.value}).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(list=>{const entries=list.getEntries();window.__r182Vitals.lcp=entries.at(-1)?.startTime||0}).observe({type:'largest-contentful-paint',buffered:true});
  });
  const consoleErrors = [];
  const runtimeErrors = [];
  const networkErrors = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", error => runtimeErrors.push(error.message));
  page.on("requestfailed", request => {
    const errorText=request.failure()?.errorText||"";
    if(errorText!=="net::ERR_ABORTED")networkErrors.push(`${request.method()} ${request.url()} ${errorText}`);
  });

  const routeResults = [];
  for (const [index, route] of routes.entries()) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.evaluate(()=>{if(window.__r182Vitals)window.__r182Vitals.cls=0});
    await page.waitForTimeout(100);
    const metrics = await page.evaluate(() => {
      const visible=node=>Boolean(node&&getComputedStyle(node).visibility!=='hidden'&&getComputedStyle(node).display!=='none'&&node.getClientRects().length);
      const interactive=[...document.querySelectorAll('a[href],button,input,select,textarea,[role="button"],[tabindex]')].filter(node=>visible(node)&&node.tabIndex>=0);
      const unnamed=interactive.filter(node=>!(node.getAttribute('aria-label')||node.getAttribute('aria-labelledby')||node.textContent.trim()||node.getAttribute('title'))).length;
      const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"]')].filter(visible).map(node=>Number(node.getAttribute('aria-level')||node.tagName[1]));
      const headingSkip=headings.some((level,index)=>index>0&&level>headings[index-1]+1);
      const resources=performance.getEntriesByType('resource');
      const sum=(pattern)=>resources.filter(x=>pattern.test(new URL(x.name).pathname)).reduce((total,x)=>total+(x.transferSize||x.encodedBodySize||0),0);
      const jsBytes=sum(/\.js$/),cssBytes=sum(/\.css$/),imageBytes=sum(/\.(png|jpe?g|webp|avif|gif|svg)$/i);
      const belowFoldEager=[...document.images].filter(img=>img.getBoundingClientRect().top>innerHeight*1.25&&img.loading!=='lazy').length;
      const smallTargets=innerWidth<=430?interactive.filter(node=>{if(node.matches('.info-tooltip__trigger'))return false;const r=node.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<24||r.height<24)}).length:0;
      return {
        clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
        horizontalOverflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
        bodyWidth:document.body.getBoundingClientRect().width,title:document.title,
        a11y:{h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length,headingSkip,unnamed,imagesWithoutAlt:[...document.images].filter(img=>visible(img)&&!img.hasAttribute('alt')).length,smallTargets},
        performance:{jsBytes,cssBytes,imageBytes,belowFoldEager,cls:window.__r182Vitals?.cls||0,lcp:window.__r182Vitals?.lcp||0,score:Math.max(0,100-(jsBytes>2500000?20:0)-(cssBytes>1000000?15:0)-(window.__r182Vitals?.cls>.1?20:0))}
      };
    });
    if (!response?.ok()) failures.push(`${viewport.name} ${route} HTTP ${response?.status()}`);
    if (metrics.horizontalOverflow) failures.push(`${viewport.name} ${route} horizontal overflow`);
    if(metrics.a11y.h1!==1||metrics.a11y.main!==1||metrics.a11y.headingSkip||metrics.a11y.unnamed||metrics.a11y.imagesWithoutAlt)failures.push(`${viewport.name} ${route} automated accessibility failed: ${JSON.stringify(metrics.a11y)}`);
    if(metrics.a11y.smallTargets)failures.push(`${viewport.name} ${route} deterministic touch targets below 24px: ${metrics.a11y.smallTargets}`);
    if(metrics.performance.score<80||metrics.performance.cls>.1||metrics.performance.jsBytes>2500000||metrics.performance.cssBytes>1000000||metrics.performance.belowFoldEager)failures.push(`${viewport.name} ${route} non-asset performance budget failed: ${JSON.stringify(metrics.performance)}`);
    await page.screenshot({ path: path.join(directory, `${index + 1}-${route.replace(/[^a-z0-9]+/gi, "-")}.png`), fullPage: true });
    routeResults.push({ route, status: response?.status(), metrics });
  }

  await page.goto(`${baseUrl}/site/work/taishin-p2p-marketplace-platform`,{waitUntil:"networkidle"});
  const taishinPresentation=await page.evaluate(()=>{
    const dialog=document.querySelector("#detailDialog"),scroll=dialog?.querySelector(".dialog-scroll");
    const visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=="none"&&node.getClientRects().length);
    const surface=[...dialog.querySelectorAll("#programmeSurface > *")].filter(visible);
    const headings=[...dialog.querySelectorAll("h2,h3")].filter(visible).map(node=>node.textContent.trim());
    return{
      title:dialog.querySelector("#detailTitle")?.textContent.trim(),
      tags:[...dialog.querySelectorAll("#detailTags > *")].filter(visible).map(node=>node.textContent.trim()),
      classificationVisible:visible(dialog.querySelector("#detailClassification")),
      navigator:[...dialog.querySelectorAll("#projectSectionNav a")].filter(visible).map(node=>node.textContent.trim()),
      sectionOrder:surface.map(node=>node.dataset.canonicalSectionId),
      decisionCount:dialog.querySelectorAll("#systemCaseDecisionsSection .decision-card-v46").length,
      evidenceCount:dialog.querySelectorAll("#systemCaseEvidenceSection .structured-evidence-v223__group").length,
      evidenceMedia:[...dialog.querySelectorAll("#systemCaseEvidenceSection .structured-evidence-v223__group .structured-evidence-v223__media img")].filter(visible).map(node=>({assetId:node.dataset.assetId,status:node.dataset.assetStatus,naturalWidth:node.naturalWidth})),
      atAGlance:dialog.querySelector("#projectAtGlance")?.textContent.trim(),
      atAGlanceLines:(()=>{const node=dialog.querySelector("#projectAtGlance"),style=getComputedStyle(node);return Math.round(node.getBoundingClientRect().height/parseFloat(style.lineHeight))})(),
      accountabilityGroups:dialog.querySelectorAll("#systemCaseAccountabilitySection .voucher-r149-accountability__primary").length,
      legacy:["Critical Problem","Business Impact","Taishin Research and Definition Model","Research and Specification Evidence","Ownership and Collaboration","Delivery and Measurement","Status and Disclosure","Continue Exploring"].filter(text=>headings.includes(text)),
      decisionTop:dialog.querySelector("#systemCaseDecisionsSection")?.offsetTop,
      evidenceTop:dialog.querySelector("#systemCaseEvidenceSection")?.offsetTop,
      text:dialog.innerText,
      overflow:Math.max(0,(scroll?.scrollWidth||0)-(scroll?.clientWidth||0)),
      overflowX:scroll?getComputedStyle(scroll).overflowX:null
    };
  });
  const expectedTaishinSections=["what-made-this-hard","my-contribution","core-system-insight","key-design-decisions","evidence-to-operating-model","outcomes","my-accountability","continue-exploring"];
  if(taishinPresentation.title!=="Third-party payment to a governed P2P marketplace"||taishinPresentation.title.startsWith("From "))failures.push(`${viewport.name} Taishin Hero mismatch: ${taishinPresentation.title}`);
  if(taishinPresentation.tags.length||taishinPresentation.classificationVisible)failures.push(`${viewport.name} Taishin Hero taxonomy leaked: ${JSON.stringify(taishinPresentation.tags)}`);
  if(JSON.stringify(taishinPresentation.navigator)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes","Ownership"]))failures.push(`${viewport.name} Taishin navigator mismatch: ${JSON.stringify(taishinPresentation.navigator)}`);
  if(JSON.stringify(taishinPresentation.sectionOrder)!==JSON.stringify(expectedTaishinSections)||!(taishinPresentation.decisionTop<taishinPresentation.evidenceTop))failures.push(`${viewport.name} Taishin IA mismatch: ${JSON.stringify(taishinPresentation)}`);
  if(taishinPresentation.decisionCount!==3||taishinPresentation.evidenceCount!==4||taishinPresentation.accountabilityGroups!==2)failures.push(`${viewport.name} Taishin shared primitive mismatch: ${JSON.stringify(taishinPresentation)}`);
  if(taishinPresentation.atAGlance!=="Co-led P2P marketplace UX definition, using 30 interviews to align fragmented flows into a shared bank–vendor model.")failures.push(`${viewport.name} Taishin At a Glance mismatch`);
  if(viewport.width===1419&&taishinPresentation.atAGlanceLines>3)failures.push(`${viewport.name} Taishin At a Glance exceeds three lines: ${taishinPresentation.atAGlanceLines}`);
  const expectedTaishinEvidence=["taishin-marketplace-evidence-research-synthesis-v1","taishin-marketplace-evidence-transaction-regulation-v1","taishin-marketplace-evidence-structure-v1","taishin-marketplace-evidence-delivery-alignment-v1"];
  if(JSON.stringify(taishinPresentation.evidenceMedia.map(item=>item.assetId))!==JSON.stringify(expectedTaishinEvidence)||taishinPresentation.evidenceMedia.some(item=>item.status!=="real-active"||item.naturalWidth<1))failures.push(`${viewport.name} Taishin asset-backed StructuredEvidence media mismatch: ${JSON.stringify(taishinPresentation.evidenceMedia)}`);
  if(taishinPresentation.legacy.length)failures.push(`${viewport.name} Taishin legacy leakage: ${JSON.stringify(taishinPresentation.legacy)}`);
  if(/GMV|revenue uplift|conversion uplift|adoption uplift|transaction growth|operational efficiency/.test(taishinPresentation.text))failures.push(`${viewport.name} Taishin unsupported outcome claim leaked`);
  if(!["hidden","clip"].includes(taishinPresentation.overflowX))failures.push(`${viewport.name} Taishin dialog horizontal containment failed: ${JSON.stringify(taishinPresentation)}`);
  if([1419,871,430].includes(viewport.width)){
    const targetDir=path.join(outputRoot,"r170-taishin",viewport.name);
    fs.mkdirSync(targetDir,{recursive:true});
    const checkpoints=[
      ["01-overview","#projectOverviewSection","#projectOverviewSection"],
      ["02-complexity","#systemCaseComplexitySection","#systemCaseComplexitySection"],
      ["03-decisions","#systemCaseDecisionsSection","#systemCaseDecisionsSection"],
      ["04-evidence-a","#systemCaseEvidenceSection .structured-evidence-v223__group:first-of-type","#systemCaseEvidenceSection"],
      ["05-evidence-b","#systemCaseEvidenceSection .structured-evidence-v223__group:last-of-type","#systemCaseEvidenceSection"],
      ["06-outcomes","#systemCaseOutcomesSection","#systemCaseOutcomesSection"],
      ["07-ownership","#systemCaseAccountabilitySection","#systemCaseAccountabilitySection"]
    ];
    const scroll=page.locator("#detailDialog .dialog-scroll").first();
    for(const [name,selector,expectedHref] of checkpoints){
      const target=page.locator(selector).first();
      if(!await target.count()){failures.push(`${viewport.name} Taishin checkpoint missing: ${name}`);continue}
      await scroll.evaluate((root,query)=>{const target=root.querySelector(query);if(target){const activation=Math.max(96,Math.min(160,root.clientHeight*.2));root.scrollTop=Math.max(0,root.scrollTop+target.getBoundingClientRect().top-root.getBoundingClientRect().top-activation+2)}},selector);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const activeHref=await page.locator("#projectSectionNav a[aria-current='location']").getAttribute("href");
      if(activeHref!==expectedHref)failures.push(`${viewport.name} Taishin navigator drift at ${name}: expected ${expectedHref}, got ${activeHref}`);
      await page.screenshot({path:path.join(targetDir,`${name}.png`),fullPage:false});
    }
    const deltaPresentation=await page.evaluate(()=>({visibleDecisionMapping:[...document.querySelectorAll("#systemCaseEvidenceSection .structured-evidence-v223__decision-link")].filter(node=>node.getClientRects().length).map(node=>node.textContent.trim()),accountabilityLabels:[...document.querySelectorAll("#systemCaseAccountabilitySection .voucher-r149-eyebrow")].filter(node=>node.getClientRects().length).map(node=>node.textContent.trim()),boundaryCount:(document.querySelector("#detailDialog")?.innerText.match(/Production launch and measured business outcomes are not verified in the available source record/g)||[]).length,text:document.querySelector("#detailDialog")?.innerText||""}));
    if(deltaPresentation.visibleDecisionMapping.length)failures.push(`${viewport.name} Taishin decision mapping metadata visible`);
    if(JSON.stringify(deltaPresentation.accountabilityLabels)!==JSON.stringify(["WHAT I OWNED","SHARED DECISIONS","PARTNER-OWNED BOUNDARY"]))failures.push(`${viewport.name} Taishin accountability labels mismatch: ${JSON.stringify(deltaPresentation.accountabilityLabels)}`);
    if(deltaPresentation.boundaryCount!==1)failures.push(`${viewport.name} Taishin claim boundary count mismatch: ${deltaPresentation.boundaryCount}`);
    if(/Buyer–seller trust depended|Implementation-ready marketplace specifications|I OWNED THE OUTCOME/.test(deltaPresentation.text))failures.push(`${viewport.name} Taishin source-tightening regression`);
    for(const projectId of ["payment","cathay-sit-review-remediation-operations","cathay-sit-online-account-opening","game-center","voucher-center"]){
      await page.goto(`${baseUrl}/site/work/${projectId}`,{waitUntil:"networkidle"});
      const root=page.locator("#detailDialog .dialog-scroll").first();
      for(const expectedHref of ["#projectOverviewSection","#systemCaseComplexitySection","#systemCaseDecisionsSection","#systemCaseEvidenceSection","#systemCaseOutcomesSection","#systemCaseAccountabilitySection"]){
        const target=page.locator(expectedHref).first();if(!await target.count())continue;
        await root.evaluate((scrollRoot,query)=>{const target=scrollRoot.querySelector(query);if(target){const activation=Math.max(96,Math.min(160,scrollRoot.clientHeight*.2));scrollRoot.scrollTop=Math.max(0,scrollRoot.scrollTop+target.getBoundingClientRect().top-scrollRoot.getBoundingClientRect().top-activation+2)}},expectedHref);
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const activeHref=await page.locator("#projectSectionNav a[aria-current='location']").getAttribute("href");
        if(activeHref!==expectedHref)failures.push(`${viewport.name} ${projectId} navigator drift: expected ${expectedHref}, got ${activeHref}`);
      }
      const sharedLeak=await page.evaluate(()=>({decision:[...document.querySelectorAll(".structured-evidence-v223__decision-link")].some(node=>node.getClientRects().length),outcomeOwnership:(document.querySelector("#detailDialog")?.innerText||"").includes("I OWNED THE OUTCOME")}));
      if(sharedLeak.decision||sharedLeak.outcomeOwnership)failures.push(`${viewport.name} ${projectId} shared presentation regression: ${JSON.stringify(sharedLeak)}`);
    }
  }

  await page.goto(`${baseUrl}/site/work/cathay-sit-review-remediation-operations`,{waitUntil:"networkidle"});
  const cathayPresentation=await page.evaluate(()=>{
    const dialog=document.querySelector("#detailDialog");
    const visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=="none"&&node.getClientRects().length);
    const surface=[...dialog.querySelectorAll("#programmeSurface > *")].filter(visible);
    const legacyHeadings=["Critical problem","Business impact","One journey — five stages","Key Intervention Map","Delivery proof","Initial strategies","Ownership and collaboration","Delivery and measurement"];
    return{
      title:dialog.querySelector("#detailTitle")?.textContent.trim(),
      problemTypes:[...dialog.querySelectorAll("#detailTags > *")].filter(visible).map(node=>node.textContent.trim()),
      classificationVisible:visible(dialog.querySelector("#detailClassification")),
      evidenceVariant:dialog.querySelector("[data-evidence-variant]")?.dataset.evidenceVariant,
      evidenceBlocks:[...dialog.querySelectorAll("#systemCaseEvidenceSection [data-evidence-block-id]")].filter(visible).map(node=>({id:node.dataset.evidenceBlockId,title:node.querySelector("h3")?.textContent.trim()})),
      evidenceAssets:[...dialog.querySelectorAll("#systemCaseEvidenceSection img")].map(image=>({src:image.getAttribute("src"),placeholder:image.dataset.assetStatus||null,complete:image.complete,naturalWidth:image.naturalWidth})),
      kpiStripVisible:visible(dialog.querySelector(".structured-evidence-v223__validation-metrics")),
      navigator:[...dialog.querySelectorAll("#projectSectionNav a")].filter(visible).map(node=>node.textContent.trim()),
      sectionOrder:surface.map(node=>node.dataset.canonicalSectionId),
      headings:surface.map(node=>node.querySelector("h2,h3")?.textContent.trim()),
      owners:surface.map(node=>node.dataset.componentOwner||null),
      legacy:legacyHeadings.filter(heading=>[...dialog.querySelectorAll("h2,h3")].some(node=>visible(node)&&node.textContent.trim()===heading)),
      decisionTop:dialog.querySelector("#systemCaseDecisionsSection")?.getBoundingClientRect().top,
      evidenceTop:dialog.querySelector("#systemCaseEvidenceSection")?.getBoundingClientRect().top,
      overflow:dialog.scrollWidth-dialog.clientWidth,
      text:dialog.innerText
    };
  });
  const expectedCathaySections=["what-made-this-hard","my-contribution","core-system-insight","key-design-decisions","evidence-to-operating-model","outcomes","my-accountability","continue-exploring"];
  if(cathayPresentation.title!=="Fragmented review knowledge to a shared remediation operating model"||cathayPresentation.title.startsWith("From "))failures.push(`${viewport.name} Cathay Hero presentation contract failed: ${cathayPresentation.title}`);
  if(cathayPresentation.problemTypes.length||cathayPresentation.classificationVisible)failures.push(`${viewport.name} Cathay Hero taxonomy must be empty: ${JSON.stringify(cathayPresentation.problemTypes)}`);
  if(cathayPresentation.evidenceVariant!=="ordered-visual-proofs"||cathayPresentation.kpiStripVisible)failures.push(`${viewport.name} Cathay Research Coverage primitive mismatch: ${JSON.stringify(cathayPresentation)}`);
  if(JSON.stringify(cathayPresentation.evidenceBlocks.map(block=>block.id))!==JSON.stringify(["research-coverage","operating-model","prioritisation","phased-direction"]))failures.push(`${viewport.name} Cathay Evidence block order/duplication mismatch: ${JSON.stringify(cathayPresentation.evidenceBlocks)}`);
  if(cathayPresentation.evidenceAssets.length!==4||cathayPresentation.evidenceAssets.some(image=>image.placeholder||!image.complete||!image.naturalWidth||!image.src?.includes("/site/assets/projects/cathay-review/")))failures.push(`${viewport.name} Cathay public-safe Evidence assets failed: ${JSON.stringify(cathayPresentation.evidenceAssets)}`);
  if(JSON.stringify(cathayPresentation.navigator)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes","Ownership"]))failures.push(`${viewport.name} Cathay navigator mismatch: ${JSON.stringify(cathayPresentation.navigator)}`);
  if(JSON.stringify(cathayPresentation.sectionOrder)!==JSON.stringify(expectedCathaySections)||!(cathayPresentation.decisionTop<cathayPresentation.evidenceTop))failures.push(`${viewport.name} Cathay rendered IA mismatch: ${JSON.stringify(cathayPresentation)}`);
  if(cathayPresentation.legacy.length)failures.push(`${viewport.name} Cathay legacy leakage: ${JSON.stringify(cathayPresentation.legacy)}`);
  if(/leaving applicants unclear|guiding applicants through remediation|RECOMMENDATION — NOT VERIFIED AS IMPLEMENTED/.test(cathayPresentation.text))failures.push(`${viewport.name} Cathay rejected framing leaked into rendered copy`);
  if(!cathayPresentation.text.includes("80%+")||!cathayPresentation.text.includes("routine case-flow coverage"))failures.push(`${viewport.name} Cathay routine case-flow coverage evidence missing`);
  if(cathayPresentation.overflow>0)failures.push(`${viewport.name} Cathay dialog horizontal overflow: ${cathayPresentation.overflow}`);

  await page.goto(`${baseUrl}/site/work/cathay-sit-online-account-opening`,{waitUntil:"networkidle"});
  const cathayOaPresentation=await page.evaluate(()=>{
    const dialog=document.querySelector("#detailDialog");
    const visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=="none"&&node.getClientRects().length);
    const surface=[...dialog.querySelectorAll("#programmeSurface > *")].filter(visible);
    const decisionFields=[...dialog.querySelectorAll("#systemCaseDecisionsSection .decision-card-v46")].map(card=>[...card.querySelectorAll(".decision-field-label-v58,dt")].map(label=>label.textContent.trim()));
    return{
      title:dialog.querySelector("#detailTitle")?.textContent.trim(),
      classificationVisible:visible(dialog.querySelector("#detailClassification")),
      tags:[...dialog.querySelectorAll("#detailTags > *")].filter(visible).map(node=>node.textContent.trim()),
      navigator:[...dialog.querySelectorAll("#projectSectionNav a")].filter(visible).map(node=>node.textContent.trim()),
      sectionOrder:surface.map(node=>node.dataset.canonicalSectionId),
      evidenceVariant:dialog.querySelector("#systemCaseEvidenceSection")?.dataset.evidenceVariant,
      evidenceHeadings:[...dialog.querySelectorAll("#systemCaseEvidenceSection .structured-evidence-v223__group h4")].filter(visible).map(node=>node.textContent.trim()),
      evidenceImages:[...dialog.querySelectorAll("#systemCaseEvidenceSection img")].filter(visible).map(image=>({src:image.currentSrc,placeholder:image.dataset.assetStatus||null})),
      outcomeValues:[...dialog.querySelectorAll("#systemCaseOutcomesSection .outcome-metric__value")].filter(visible).map(node=>node.textContent.trim()),
      outcomeIntro:dialog.querySelector("#systemCaseOutcomesSection>.voucher-r149-heading .voucher-r149-intro")?.textContent.trim(),
      outcomeChangeCount:dialog.querySelectorAll("#systemCaseOutcomesSection>.outcome-semantic-change").length,
      outcomeGroupTitleCount:dialog.querySelectorAll("#systemCaseOutcomesSection .outcome-semantic-group__title").length,
      outcomeGridAligned:dialog.querySelector("#systemCaseOutcomesSection .outcome-metric-grid")?.classList.contains("outcome-semantic-group__grid--aligned"),
      outcomeLabelWeights:[...dialog.querySelectorAll("#systemCaseOutcomesSection .outcome-metric__label")].map(node=>Number(getComputedStyle(node).fontWeight)),
      decisions:decisionFields,
      legacy:[...dialog.querySelectorAll("h2,h3")].filter(visible).map(node=>node.textContent.trim()).filter(text=>["Critical problem","Business impact","Multi-route transaction model","Delivery proof","Ownership and collaboration","Delivery and measurement"].includes(text)),
      text:dialog.innerText,
      overflow:dialog.scrollWidth-dialog.clientWidth
    };
  });
  const expectedOaSections=["what-made-this-hard","my-contribution","core-system-insight","key-design-decisions","evidence-to-operating-model","outcomes","my-accountability","continue-exploring"];
  if(cathayOaPresentation.title!=="Fragmented account-opening steps to a validated end-to-end flow")failures.push(`${viewport.name} Cathay OA Hero contract failed: ${cathayOaPresentation.title}`);
  if(cathayOaPresentation.classificationVisible||cathayOaPresentation.tags.length)failures.push(`${viewport.name} Cathay OA Hero taxonomy leaked: ${JSON.stringify(cathayOaPresentation.tags)}`);
  if(JSON.stringify(cathayOaPresentation.navigator)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes","Ownership"]))failures.push(`${viewport.name} Cathay OA navigator mismatch: ${JSON.stringify(cathayOaPresentation.navigator)}`);
  if(JSON.stringify(cathayOaPresentation.sectionOrder)!==JSON.stringify(expectedOaSections))failures.push(`${viewport.name} Cathay OA rendered IA mismatch: ${JSON.stringify(cathayOaPresentation.sectionOrder)}`);
  if(cathayOaPresentation.evidenceVariant!=="structured-html"||JSON.stringify(cathayOaPresentation.evidenceHeadings)!==JSON.stringify(["Synthesised the full account-opening journey","Defined one cross-device, multi-route account-opening model","Designed recovery as part of the application flow","Delivered development-ready UI specifications"]))failures.push(`${viewport.name} Cathay OA Evidence contract failed: ${JSON.stringify(cathayOaPresentation)}`);
  if(cathayOaPresentation.evidenceImages.length)failures.push(`${viewport.name} Cathay OA placeholder/decorative evidence leaked: ${JSON.stringify(cathayOaPresentation.evidenceImages)}`);
  if(JSON.stringify(cathayOaPresentation.outcomeValues)!==JSON.stringify(["1","6 stages","4 routes","3 contexts","1 month","Complete"]))failures.push(`${viewport.name} Cathay OA delivery coverage outcomes mismatch: ${JSON.stringify(cathayOaPresentation.outcomeValues)}`);
  if(cathayOaPresentation.outcomeIntro!=="One aligned account-opening model and a development-ready specification set."||cathayOaPresentation.outcomeChangeCount||cathayOaPresentation.outcomeGroupTitleCount||!cathayOaPresentation.outcomeGridAligned||cathayOaPresentation.outcomeLabelWeights.some(weight=>weight<700))failures.push(`${viewport.name} Cathay OA Payment-parity Outcome hierarchy failed: ${JSON.stringify(cathayOaPresentation)}`);
  if(cathayOaPresentation.decisions.length!==3||!cathayOaPresentation.decisions[1].includes("TRADE-OFF ACCEPTED")||!cathayOaPresentation.decisions[2].includes("RISK MANAGED"))failures.push(`${viewport.name} Cathay OA Decision fields mismatch: ${JSON.stringify(cathayOaPresentation.decisions)}`);
  if(cathayOaPresentation.legacy.length)failures.push(`${viewport.name} Cathay OA legacy leakage: ${JSON.stringify(cathayOaPresentation.legacy)}`);
  if(!cathayOaPresentation.text.includes("Post-launch performance was not available")||/\bshipped\b|conversion uplift|completion-rate uplift/i.test(cathayOaPresentation.text))failures.push(`${viewport.name} Cathay OA delivery boundary missing or overstated`);
  if(cathayOaPresentation.overflow>0)failures.push(`${viewport.name} Cathay OA dialog horizontal overflow: ${cathayOaPresentation.overflow}`);

  await page.goto(`${baseUrl}/site/work/booking`,{waitUntil:"networkidle"});
  const bookingCertification=await page.evaluate(async()=>{const dialog=document.querySelector("#detailDialog"),visibleHeadings=[...dialog.querySelectorAll("h2,h3")].filter(node=>{const style=getComputedStyle(node);return style.display!=="none"&&style.visibility!=="hidden"&&node.getClientRects().length}).map(node=>node.textContent.trim()),images=[...dialog.querySelectorAll("img")].filter(image=>image.alt);await Promise.all(images.map(image=>{image.loading="eager";if(image.complete)return true;return new Promise(resolve=>{image.addEventListener("load",()=>resolve(true),{once:true});image.addEventListener("error",()=>resolve(false),{once:true})})}));const required=["Fragmented booking touchpoints to a connected trip timeline","At a glance","What made this hard","Contribution","The booking journey became clearer when known trip context and market-specific pickup guidance worked as one system.","Design decisions","Evidence that shaped the decisions","Outcomes","My accountability","Related work"],legacy=["Why It Mattered","Business Impact","Research Strategy","Delivery and Measurement","Status and Disclosure"],outcomeCards=[...dialog.querySelectorAll("#systemCaseOutcomesSection .outcome-metric")],outcomes=outcomeCards.map(card=>({value:card.querySelector(".outcome-metric__value")?.textContent.trim(),label:(()=>{const node=card.querySelector(".outcome-metric__label")?.cloneNode(true);node?.querySelectorAll(".info-tooltip").forEach(tip=>tip.remove());return node?.textContent.trim()})()})),navigator=[...dialog.querySelectorAll("#projectSectionNav a")].map(node=>node.textContent.trim()),publicText=dialog.innerText,decisionFields=[...dialog.querySelectorAll("#systemCaseDecisionsSection .decision-card-v46")].map(card=>[...card.querySelectorAll(".decision-field-label-v58,dt")].map(label=>({label:label.textContent.trim(),copy:((label.tagName==="DT"?label.parentElement?.querySelector("dd"):label.nextElementSibling)?.textContent||"").trim()}))),flow=dialog.querySelector(".contribution-block .voucher-r149-flow"),flowNodes=[...dialog.querySelectorAll(".contribution-block .voucher-r149-flow article")],flowSupport=dialog.querySelector(".contribution-block>.voucher-r149-intro"),insight=dialog.querySelector(".core-system-insight-section"),insightTitle=dialog.querySelector(".core-system-insight-section h2"),insightVisual=dialog.querySelector(".core-system-insight-section .voucher-r149-foundation"),insightCaption=dialog.querySelector(".core-system-insight-section .voucher-r149-foundation__caption"),complexity=[...dialog.querySelectorAll(".recruiter-complexity-grid--featured-first>.recruiter-complexity-card")],outcomeGrid=dialog.querySelector("#systemCaseOutcomesSection .outcome-metric-grid"),quickView=dialog.querySelector(".quick-view-v51--project"),audienceNodes=[...dialog.querySelectorAll(".info-grid-v45__audience")],contributionSection=flow?.closest(".contribution-block");const rect=node=>{const r=node?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,center:r.left+r.width/2}:null},titleStyle=insightTitle?getComputedStyle(insightTitle):null;return{requiredOrder:required.map(text=>visibleHeadings.indexOf(text)),legacy:visibleHeadings.filter(text=>legacy.includes(text)),outcomes,navigator,publicText,decisionFields,evidenceImages:images.filter(image=>image.currentSrc.includes("/booking/")).map(image=>({src:image.currentSrc,complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight})),overflow:dialog.scrollWidth-dialog.clientWidth,contribution:{count:visibleHeadings.filter(text=>text==="Contribution").length,flow:rect(flow),nodes:flowNodes.map(rect),support:rect(flowSupport)},insight:{section:rect(insight),title:rect(insightTitle),titleLines:insightTitle&&titleStyle?Math.round(insightTitle.getBoundingClientRect().height/parseFloat(titleStyle.lineHeight)):null,visual:rect(insightVisual),captionAlign:insightCaption?getComputedStyle(insightCaption).textAlign:null},complexity:complexity.map(rect),complexityColumns:dialog.querySelector(".recruiter-complexity-grid--featured-first")?getComputedStyle(dialog.querySelector(".recruiter-complexity-grid--featured-first")).gridTemplateColumns:null,outcomeRhythm:{rowGap:parseFloat(getComputedStyle(outcomeGrid).rowGap)||0,cards:outcomeCards.map(rect),innerGaps:outcomeCards.map(card=>{const value=card.querySelector(".outcome-metric__value")?.getBoundingClientRect(),label=card.querySelector(".outcome-metric__label")?.getBoundingClientRect();return value&&label?label.top-value.bottom:null})},audience:{total:audienceNodes.length,inInfoGrid:audienceNodes.filter(node=>node.closest("#projectSignals")).length,inProgramme:audienceNodes.filter(node=>node.closest("#programmeSurface")).length,quickHeight:getComputedStyle(quickView).height,quickOverflow:Math.max(0,quickView.scrollHeight-quickView.clientHeight),contributionHasAudience:/Primary:|Secondary:/.test(contributionSection?.innerText||"")}}});
  if(bookingCertification.requiredOrder.some(index=>index<0)||bookingCertification.requiredOrder.some((index,position,array)=>position&&index<=array[position-1]))failures.push(`${viewport.name} Booking architecture order failed: ${JSON.stringify(bookingCertification.requiredOrder)}`);
  if(bookingCertification.legacy.length)failures.push(`${viewport.name} Booking legacy standalone sections visible: ${JSON.stringify(bookingCertification.legacy)}`);
  if(JSON.stringify(bookingCertification.outcomes)!==JSON.stringify([{value:"+~7%",label:"desktop conversion rate"},{value:"+~3%",label:"mobile conversion rate"},{value:"+~10%",label:"tablet conversion rate"},{value:"~150",label:"additional rides per day after launch"}]))failures.push(`${viewport.name} Booking outcomes mismatch: ${JSON.stringify(bookingCertification.outcomes)}`);
  if(/\b2-step\b|\b3-step\b|943,818|65\.48%/.test(bookingCertification.publicText))failures.push(`${viewport.name} Booking confidential/internal public text regression`);
  if(!bookingCertification.publicText.includes("6 of 7 analysed markets improved")||!bookingCertification.publicText.includes("Spain was the only analysed market to decline")||!bookingCertification.publicText.includes("40+ countries"))failures.push(`${viewport.name} Booking recruiter-first supporting outcome story missing`);
  if(JSON.stringify(bookingCertification.navigator)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes","Ownership"]))failures.push(`${viewport.name} Booking navigator mismatch: ${JSON.stringify(bookingCertification.navigator)}`);
  if(bookingCertification.evidenceImages.length!==8||bookingCertification.evidenceImages.some(image=>!image.complete||image.naturalWidth!==1600||image.naturalHeight!==900)||!bookingCertification.evidenceImages.some(image=>image.src.includes("ride-mix-public-01.svg"))||bookingCertification.evidenceImages.some(image=>image.src.includes("outcomes-cross-market")||image.src.includes("outcomes-post-launch")))failures.push(`${viewport.name} Booking evidence readiness/confidentiality failed: ${JSON.stringify(bookingCertification.evidenceImages)}`);
  if(bookingCertification.decisionFields.length!==3||bookingCertification.decisionFields.some(fields=>!fields.some(x=>x.label==="WHAT I DECIDED"&&x.copy)||!fields.some(x=>x.label==="WHY THIS CHOICE"&&x.copy)||!fields.some(x=>["TRADE-OFF ACCEPTED","WHAT THIS REQUIRED"].includes(x.label)&&x.copy)||!fields.some(x=>x.label==="OUTCOME"&&x.copy)))failures.push(`${viewport.name} Booking decision field completeness failed: ${JSON.stringify(bookingCertification.decisionFields)}`);
  if(bookingCertification.contribution.count!==1||!bookingCertification.contribution.flow||bookingCertification.contribution.nodes.length!==3||Math.abs(bookingCertification.contribution.nodes[1].center-bookingCertification.contribution.flow.center)>.75||Math.abs(bookingCertification.contribution.support.left-bookingCertification.contribution.flow.left)>.75)failures.push(`${viewport.name} Booking contribution alignment failed: ${JSON.stringify(bookingCertification.contribution)}`);
  if(viewport.width===1419&&(bookingCertification.insight.titleLines>5||bookingCertification.insight.title.width<700))failures.push(`${viewport.name} Booking Core System Insight headline width failed: ${JSON.stringify(bookingCertification.insight)}`);
  if(!bookingCertification.insight.visual||Math.abs(bookingCertification.insight.visual.center-bookingCertification.insight.section.center)>1||bookingCertification.insight.captionAlign!=="center")failures.push(`${viewport.name} Booking Core System Insight visual centring failed: ${JSON.stringify(bookingCertification.insight)}`);
  if(viewport.width>600&&Math.abs(bookingCertification.complexity[1].height-bookingCertification.complexity[2].height)>.75)failures.push(`${viewport.name} Booking complexity equal-height failed: ${JSON.stringify(bookingCertification.complexity)}`);
  if(viewport.width<=600&&bookingCertification.complexityColumns.split(" ").length!==1)failures.push(`${viewport.name} Booking complexity mobile stacking failed: ${bookingCertification.complexityColumns}`);
  if(viewport.width===430&&(bookingCertification.outcomeRhythm.rowGap!==32||bookingCertification.outcomeRhythm.cards.some((card,index,cards)=>index&&card.top-cards[index-1].bottom<31)||bookingCertification.outcomeRhythm.innerGaps.some(gap=>gap===null||gap>=32)))failures.push(`${viewport.name} Booking mobile Outcome group rhythm failed: ${JSON.stringify(bookingCertification.outcomeRhythm)}`);
  if(viewport.width!==430&&bookingCertification.outcomeRhythm.rowGap!==0)failures.push(`${viewport.name} Booking non-mobile Outcome rhythm changed: ${JSON.stringify(bookingCertification.outcomeRhythm)}`);
  if(bookingCertification.audience.total!==1||bookingCertification.audience.inInfoGrid!==1||bookingCertification.audience.inProgramme!==0||bookingCertification.audience.contributionHasAudience)failures.push(`${viewport.name} Booking Audience projection duplicated: ${JSON.stringify(bookingCertification.audience)}`);
  if(viewport.width===430&&(bookingCertification.audience.quickHeight==="100%"||bookingCertification.audience.quickOverflow>1))failures.push(`${viewport.name} Booking mobile Info Grid overflowed into Contribution: ${JSON.stringify(bookingCertification.audience)}`);
  if(bookingCertification.overflow>0)failures.push(`${viewport.name} Booking dialog horizontal overflow: ${bookingCertification.overflow}`);

  await page.goto(`${baseUrl}/site/work/ctbc-mortgage-self-service-app`,{waitUntil:"networkidle"});
  const ctbcCertification=await page.evaluate(()=>{
    const dialog=document.querySelector("#detailDialog");
    const text=dialog?.innerText||"";
    const order=[
      "Building one self-service mortgage application from fragmented application tasks",
      "At a glance",
      "What made this hard",
      "Contribution",
      "The scalable unit was the application state—not the screen.",
      "Design decisions",
      "Evidence that shaped the decisions",
      "Outcomes",
      "My accountability",
      "Related work"
    ].map(value=>text.indexOf(value));
    const decisionCards=[...dialog.querySelectorAll("#systemCaseDecisionsSection .decision-card-v46")];
    const decisionFields=decisionCards.map(card=>[...card.querySelectorAll(".decision-field-label-v58")].map(node=>node.textContent.trim()));
    const evidenceGroups=[...dialog.querySelectorAll("#systemCaseEvidenceSection .structured-evidence-v223__group")].map(group=>({
      headline:group.querySelector("h4")?.textContent.trim(),
      body:group.querySelector(".structured-evidence-v223__summary")?.textContent.trim(),
      link:group.querySelector(".structured-evidence-v223__decision-link")?.textContent.trim(),
      legacyLabels:[...group.querySelectorAll("li")].map(node=>node.textContent.trim())
    }));
    const outcomeCards=[...dialog.querySelectorAll("#systemCaseOutcomesSection .outcome-metric--qualitative")].map(card=>card.querySelector("h3")?.textContent.trim());
    const signals=[...dialog.querySelectorAll("#projectSignals>div")].map(node=>node.innerText.trim());
    const rect=node=>{if(!node)return null;const value=node.getBoundingClientRect();return{x:Number(value.x.toFixed(1)),right:Number(value.right.toFixed(1)),width:Number(value.width.toFixed(1))}};
    const edge=(name,rootSelector,contentSelector,edgeType)=>{
      const root=dialog.querySelector(rootSelector);
      return{name,edgeType,heading:rect(root?.querySelector(".case-study-section__header h2,.case-study-section__header h3,h2,h3")),content:rect(root?.querySelector(contentSelector))};
    };
    const geometry=[
      edge("At a Glance","#projectView",".quick-view-v51__body, .quick-view-v51__grid, .info-grid-v45","READING EDGE"),
      edge("Info Grid","#projectView","#projectSignals","EVIDENCE EDGE"),
      edge("What Made This Hard","[data-canonical-section-id='what-made-this-hard']", ".recruiter-complexity-grid","EVIDENCE EDGE"),
      edge("Contribution","#my-contribution", ".voucher-r149-flow","READING EDGE"),
      edge("Core System Insight","[data-canonical-section-id='core-system-insight']", ".voucher-r149-heading","READING EDGE"),
      edge("Design Decisions","[data-canonical-section-id='key-design-decisions']", ".voucher-stage-decision-list","EVIDENCE EDGE"),
      edge("Evidence","[data-canonical-section-id='evidence-to-operating-model']", ".structured-evidence-v223__groups","EVIDENCE EDGE"),
      edge("Outcomes","[data-canonical-section-id='outcomes']", ".outcome-qualitative-hierarchy","EVIDENCE EDGE"),
      edge("My Accountability","[data-canonical-section-id='my-accountability']", ".voucher-r149-accountability","EVIDENCE EDGE"),
      edge("Decision 01 Delivery Boundary","#systemCaseDecisionsSection .decision-card-v46:nth-child(1)", ".voucher-stage-decision__delivery-boundary","READING EDGE")
    ];
    const evidenceColumns=getComputedStyle(dialog.querySelector(".structured-evidence-v223__groups")).gridTemplateColumns.split(" ").length;
    const outcomeColumns=getComputedStyle(dialog.querySelector(".outcome-card-grid")).gridTemplateColumns.split(" ").length;
    return{
      order,
      text,
      decisionCount:decisionCards.length,
      decisionFields,
      deliveryBoundary:dialog.querySelector("#systemCaseDecisionsSection .voucher-stage-decision__delivery-boundary")?.innerText.trim(),
      evidenceGroups,
      outcomeHeadline:dialog.querySelector("#systemCaseOutcomesSection .outcome-semantic-change__title")?.textContent.trim(),
      outcomeCards,
      outcomeClosing:dialog.querySelector("#systemCaseOutcomesSection .outcome-semantic-closing")?.textContent.trim(),
      signals,
      geometry,
      evidenceColumns,
      outcomeColumns,
      problemTypesVisible:!document.querySelector(".modal-classification-v45")?.hidden,
      navigator:[...dialog.querySelectorAll("#projectSectionNav a")].map(node=>node.textContent.trim()),
      titleTransforms:[...dialog.querySelectorAll(".case-study-section__header h2,.structured-evidence-v223__group h4,.outcome-metric--qualitative h3,#projectSectionNav a")].map(node=>getComputedStyle(node).textTransform),
      semanticLabels:[...dialog.querySelectorAll(".decision-field-label-v58,.voucher-r149-eyebrow")].map(node=>({text:node.textContent.trim(),transform:getComputedStyle(node).textTransform})),
      overflow:(dialog?.scrollWidth||0)-(dialog?.clientWidth||0)
    };
  });
  if(ctbcCertification.order.some(index=>index<0)||ctbcCertification.order.some((index,position,array)=>position&&index<=array[position-1]))failures.push(`${viewport.name} CTBC architecture order failed: ${JSON.stringify(ctbcCertification.order)}`);
  if(ctbcCertification.problemTypesVisible)failures.push(`${viewport.name} CTBC recruiter-first Hero taxonomy must remain hidden`);
  if(!ctbcCertification.signals.some(signal=>signal.includes("0→1 Product"))||!ctbcCertification.signals.some(signal=>signal.includes("3 months"))||!ctbcCertification.signals.some(signal=>signal.includes("Mortgage applicants")&&signal.includes("Co-borrowers")&&signal.includes("Guarantors"))||ctbcCertification.signals.some(signal=>/Product|Engineering|Operations/.test(signal.replace("0→1 Product",""))))failures.push(`${viewport.name} CTBC Info Grid mismatch: ${JSON.stringify(ctbcCertification.signals)}`);
  if(ctbcCertification.decisionCount!==3||ctbcCertification.decisionFields.some(fields=>!["WHAT I DECIDED","WHY THIS CHOICE","CONSTRAINT MANAGED","OUTCOME"].every(label=>fields.includes(label))))failures.push(`${viewport.name} CTBC Decisions incomplete: ${JSON.stringify(ctbcCertification.decisionFields)}`);
  if(!ctbcCertification.deliveryBoundary?.includes("Further contextual routing options were not validated within the project scope."))failures.push(`${viewport.name} CTBC Delivery Boundary missing: ${ctbcCertification.deliveryBoundary}`);
  const expectedEvidence=[
    {headline:"Different readiness states required a state-driven journey",body:"Users entered with different information and dependencies, so one fixed sequence could not serve every application state.",legacyLabels:[]},
    {headline:"Interruption was part of the normal application journey",body:"Missing information or documents meant users needed to leave and return without losing progress.",legacyLabels:[]},
    {headline:"Multiple applicants still needed one coherent application",body:"Related applicants could contribute at different moments, but their input still had to remain within the same application.",legacyLabels:[]}
  ];
  if(JSON.stringify(ctbcCertification.evidenceGroups)!==JSON.stringify(expectedEvidence))failures.push(`${viewport.name} CTBC recruiter-compressed Evidence mismatch: ${JSON.stringify(ctbcCertification.evidenceGroups)}`);
  if(/OBSERVED|DESIGN IMPLICATION|SUPPORTS DECISION/.test(ctbcCertification.text))failures.push(`${viewport.name} CTBC legacy Evidence layers remain`);
  if(viewport.width===1419&&ctbcCertification.evidenceColumns!==3)failures.push(`${viewport.name} CTBC Evidence must scan in three columns: ${ctbcCertification.evidenceColumns}`);
  if(viewport.width===871&&ctbcCertification.evidenceColumns!==1)failures.push(`${viewport.name} CTBC Evidence tablet balance mismatch: ${ctbcCertification.evidenceColumns}`);
  if(ctbcCertification.outcomeHeadline!=null||JSON.stringify(ctbcCertification.outcomeCards)!==JSON.stringify(["One staged application model","Resumable application progress","Coordinated multi-party completion"])||!ctbcCertification.outcomeClosing?.includes("production launch and post-launch performance were not confirmed"))failures.push(`${viewport.name} CTBC contribution-led Outcomes mismatch: ${JSON.stringify(ctbcCertification)}`);
  if(!ctbcCertification.text.includes("Defined the product model behind the 0→1 mortgage journey")||!ctbcCertification.text.includes("Turned business and lending constraints into a buildable direction")||ctbcCertification.text.includes("Existing acquisition entry points")||ctbcCertification.text.includes("Production launch and post-launch measurement"))failures.push(`${viewport.name} CTBC ownership presentation mismatch`);
  if(/conversion|task success|completion rate/i.test(ctbcCertification.text))failures.push(`${viewport.name} CTBC invented metric detected`);
  if(ctbcCertification.titleTransforms.some(value=>value==="uppercase"))failures.push(`${viewport.name} content title incorrectly uppercased`);
  if(ctbcCertification.semanticLabels.some(item=>/[A-Za-z]/.test(item.text)&&item.transform!=="uppercase"&&item.text!==item.text.toUpperCase()))failures.push(`${viewport.name} semantic label casing contract failed`);
  if(ctbcCertification.overflow>0)failures.push(`${viewport.name} CTBC dialog horizontal overflow: ${ctbcCertification.overflow}`);
  if(viewport.width===430&&(ctbcCertification.evidenceColumns!==1||ctbcCertification.outcomeColumns!==1))failures.push(`${viewport.name} CTBC mobile stack mismatch: evidence=${ctbcCertification.evidenceColumns} outcomes=${ctbcCertification.outcomeColumns}`);

  const homepageState=()=>page.evaluate(()=>({scrollY:window.scrollY,hash:location.hash,hero:document.querySelector(".hero")?.getBoundingClientRect().bottom>0,selected:[...document.querySelectorAll(".domain-tab[aria-selected='true']")].map(n=>n.dataset.domain)}));
  await page.goto(`${baseUrl}/site/`,{waitUntil:"networkidle"});const fresh=await homepageState();
  assert(fresh.scrollY===0&&fresh.hero&&fresh.selected.length===0,"Fresh Homepage must open at Hero with neutral Domain state");
  await page.screenshot({path:path.join(directory,"homepage-fresh-entry.png"),fullPage:false});
  await page.reload({waitUntil:"networkidle"});const refresh=await homepageState();
  assert(refresh.scrollY===0&&refresh.selected.length===0,"Homepage refresh must stay neutral at Hero");
  await page.goto(`${baseUrl}/site/work.html`,{waitUntil:"networkidle"});await page.click(".brand");await page.waitForLoadState("networkidle");const internal=await homepageState();
  assert(internal.scrollY===0&&internal.selected.length===0,"Internal Homepage entry must stay neutral at Hero");
  await page.goto(`${baseUrl}/site/work.html`,{waitUntil:"networkidle"});await page.goBack({waitUntil:"networkidle"});const back=await homepageState();
  assert(back.scrollY===0&&back.selected.length===0,"Back must not synthesize Domain state");
  await page.goto(`${baseUrl}/site/#domains`,{waitUntil:"networkidle"});await page.waitForTimeout(300);const anchor=await homepageState();
  assert(anchor.hash==="#domains"&&anchor.selected.length===1,"Supported Domain anchor must select exactly one Domain");

  await page.goto(`${baseUrl}/site/work.html`,{waitUntil:"networkidle"});
  const projectCardGeometry=await page.evaluate(()=>["dbs","voucher","payment"].map(projectId=>{const card=document.querySelector(`[data-project="${projectId}"]`)?.closest(".work-card-v32"),frame=card?.querySelector("[data-frame-role='project-cover']"),image=frame?.querySelector("img"),title=card?.querySelector("h2"),company=card?.querySelector(".related-project-card__company-v135"),summary=card?.querySelector(".work-card-v32__content>p"),rect=frame?.getBoundingClientRect();return{projectId,frameWidth:rect?.width,frameHeight:rect?.height,frameRatio:rect?.width/rect?.height,naturalRatio:image?.naturalWidth/image?.naturalHeight,mediaAspect:frame?.dataset.mediaAspect,mediaFormat:frame?.dataset.mediaFormat,assetStatus:frame?.dataset.assetStatus,objectPosition:image?getComputedStyle(image).objectPosition:null,companyColor:company?getComputedStyle(company).color:null,neutralReference:summary?getComputedStyle(summary).color:null,companyTitleGap:title?parseFloat(getComputedStyle(title).marginTop):null,objectFit:image?getComputedStyle(image).objectFit:null,overflow:frame?getComputedStyle(frame).overflow:null}}));
  const dbs=projectCardGeometry.find(x=>x.projectId==="dbs"),voucherCard=projectCardGeometry.find(x=>x.projectId==="voucher");
  for(const x of [dbs,voucherCard]){assert(Math.abs(x.frameRatio-16/9)<.02,`${x.projectId} shared 16:9 frame failed`);assert(x.mediaFormat==="panoramic",`${x.projectId} source classification failed`);assert(x.objectFit==="contain",`${x.projectId} shared containment failed`)}
  const payment=projectCardGeometry.find(x=>x.projectId==="payment"),paymentSemanticRatio=payment.mediaAspect?.split("/").map(Number),paymentSemanticRatioValue=paymentSemanticRatio?.length===2?paymentSemanticRatio[0]/paymentSemanticRatio[1]:NaN;
  assert(payment.assetStatus==="real-active"&&Math.abs(paymentSemanticRatioValue-16/9)<.02&&payment.mediaFormat==="panoramic"&&payment.objectFit==="contain"&&Math.abs(payment.frameRatio-16/9)<.02,"Payment ProjectCard shared 16:9 contract failed");
  projectCardGeometry.forEach(x=>{assert(x.overflow==="hidden",`${x.projectId} overflow contract failed`);assert(x.companyColor===x.neutralReference,`${x.projectId} company metadata must be neutral`);assert(x.companyTitleGap===24,`${x.projectId} company/title gap must resolve to 24px`)});
  if(viewport.width===430)console.log(`R161.1 430 geometry ${JSON.stringify(projectCardGeometry)}`);
  await page.locator('[data-project="dbs"]').first().screenshot({path:path.join(directory,"project-card-dbs-ratio.png")});
  report.homepageEntry={fresh,refresh,internal,back,anchor};report.projectCardGeometry=projectCardGeometry;

  await page.goto(`${baseUrl}/site/work/voucher`, { waitUntil: "networkidle" });
  const r156 = await page.evaluate(() => ({
    permanentOutcomeNotes: document.querySelectorAll('.outcome-metric > small').length,
    permanentResearchNotes: document.querySelectorAll('.research-evidence-metric > small').length,
    tooltips: document.querySelectorAll('.info-tooltip__trigger').length,
    desktopEvidenceButtons: matchMedia('(min-width: 601px)').matches ? document.querySelectorAll('.decision-visual-v58 img[role="button"],[data-expandable-evidence][role="button"]').length : 0
  }));
  if (r156.permanentOutcomeNotes || r156.permanentResearchNotes) failures.push(`${viewport.name} permanent metric notes remain`);
  if (!r156.tooltips) failures.push(`${viewport.name} shared info tooltips missing`);
  if (r156.desktopEvidenceButtons) failures.push(`${viewport.name} desktop evidence lightbox affordance remains`);

  const initialFocus = await page.evaluate(() => ({
    tag: document.activeElement?.tagName || "",
    id: document.activeElement?.id || "",
    titleFocused: document.activeElement?.id === "detailTitle",
    scrollTop: document.querySelector(".dialog-scroll")?.scrollTop || 0,
  }));
  if (initialFocus.titleFocused) failures.push(`${viewport.name} popup title received initial focus`);

  await page.goto(`${baseUrl}/site/work/dbs`, { waitUntil: "networkidle" });
  const firstOpenDecisionCount=await page.locator("#projectDecisions .decision-card-v46:visible").count();
  if(firstOpenDecisionCount!==3)failures.push(`${viewport.name} DBS first-open decisions missing: ${firstOpenDecisionCount}`);
  await page.locator("#detailClose").click();
  await page.waitForFunction(()=>!document.querySelector("#detailDialog")?.open);
  await page.goto(`${baseUrl}/site/work/dbs`, { waitUntil: "networkidle" });
  const secondOpenDecisionCount=await page.locator("#projectDecisions .decision-card-v46:visible").count();
  if(secondOpenDecisionCount!==3)failures.push(`${viewport.name} DBS second-open decisions missing: ${secondOpenDecisionCount}`);

  const navigator=page.locator("#projectSectionNav");
  await navigator.waitFor({state:"visible"});
  const navigatorContract=await navigator.evaluate(node=>({
    floating:node.classList.contains("floating-navigator"),
    toggleVisible:node.querySelector("#projectSectionNavToggle") ? !node.querySelector("#projectSectionNavToggle").hidden : false,
    labels:[...node.querySelectorAll("a")].map(link=>link.textContent.trim()),
  }));
  if(!navigatorContract.floating)failures.push(`${viewport.name} Project navigator is not the shared FloatingNavigator`);
  if(navigatorContract.toggleVisible)failures.push(`${viewport.name} legacy Project navigator disclosure remains visible`);
  if(JSON.stringify(navigatorContract.labels)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes","Ownership"]))failures.push(`${viewport.name} Project navigator labels mismatch: ${JSON.stringify(navigatorContract.labels)}`);
  const navigatorInteractions={clicks:[],reverseClicks:[],repeated:false,keyboard:false,manualScroll:false,touch:viewport.width<=430?false:null};
  const certifyNavigatorClick=async(label,collection)=>{
    const link=navigator.getByRole("link",{name:label,exact:true});
    const before=await page.locator(".dialog-scroll").first().evaluate(root=>root.scrollTop);
    await link.click();
    const positions=[];let stableFrames=0;let previous=before;
    for(let frame=0;frame<60&&stableFrames<4;frame+=1){
      await page.waitForTimeout(20);
      const position=await page.locator(".dialog-scroll").first().evaluate(root=>root.scrollTop);
      positions.push(position);stableFrames=Math.abs(position-previous)<=1?stableFrames+1:0;previous=position;
    }
    const state=await link.evaluate(node=>{
      const root=document.querySelector(".dialog-scroll"),target=document.querySelector(node.getAttribute("href")),heading=target.querySelector("h2,h3")||target,rootRect=root.getBoundingClientRect(),headingRect=heading.getBoundingClientRect();
      return {current:node.getAttribute("aria-current"),before:null,after:root.scrollTop,headingTop:headingRect.top-rootRect.top,headingBottom:headingRect.bottom-rootRect.top,rootHeight:root.clientHeight};
    });
    state.before=before;state.positions=positions;collection.push({label,...state});
    if(state.current!=="location")failures.push(`${viewport.name} navigator ${label} click did not own active state`);
    if(label!=="Overview"&&state.after<=2)failures.push(`${viewport.name} navigator ${label} click left .dialog-scroll at the top`);
    if(Math.abs(state.after-state.before)>8&&new Set(positions.map(position=>Math.round(position))).size<3)failures.push(`${viewport.name} navigator ${label} did not expose intermediate smooth-scroll positions`);
    if(state.headingTop<0||state.headingBottom>state.rootHeight)failures.push(`${viewport.name} navigator ${label} heading is clipped: ${JSON.stringify(state)}`);
  };
  for(const label of ["Overview","Complexity","Decisions","Evidence","Outcomes","Ownership"])await certifyNavigatorClick(label,navigatorInteractions.clicks);
  for(const label of ["Outcomes","Evidence","Decisions","Complexity","Overview"])await certifyNavigatorClick(label,navigatorInteractions.reverseClicks);
  const outcomesLink=navigator.getByRole("link",{name:"Outcomes",exact:true});
  await outcomesLink.click();await outcomesLink.click();await page.waitForTimeout(80);
  navigatorInteractions.repeated=(await outcomesLink.getAttribute("aria-current"))==="location";
  if(!navigatorInteractions.repeated)failures.push(`${viewport.name} repeated navigator click left stale state`);
  const overviewLink=navigator.getByRole("link",{name:"Overview",exact:true});
  await overviewLink.focus();await overviewLink.press("Enter");await page.waitForTimeout(80);
  navigatorInteractions.keyboard=(await overviewLink.getAttribute("aria-current"))==="location" && !(await page.locator("#projectOverviewSection").evaluate(node=>node===document.activeElement));
  if(!navigatorInteractions.keyboard)failures.push(`${viewport.name} keyboard navigator activation or focus ownership failed`);
  const scrollRootForNav=page.locator(".dialog-scroll").first();
  await scrollRootForNav.hover();
  await page.mouse.wheel(0,2400);
  await page.waitForTimeout(180);
  const manualActive=await navigator.locator('a[aria-current="location"]').allTextContents();
  navigatorInteractions.manualScroll=manualActive.length===1&&manualActive[0]!=="Overview";
  if(!navigatorInteractions.manualScroll)failures.push(`${viewport.name} manual wheel did not synchronize visible section: ${JSON.stringify(manualActive)}`);
  if(viewport.width<=430){
    const decisionsLink=navigator.getByRole("link",{name:"Decisions",exact:true});
    const box=await decisionsLink.boundingBox();
    if(box){await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(80);navigatorInteractions.touch=(await decisionsLink.getAttribute("aria-current"))==="location";}
    if(!navigatorInteractions.touch)failures.push(`${viewport.name} touch navigator activation failed`);
  }

  await page.goto(`${baseUrl}/site/work/voucher`, { waitUntil: "networkidle" });

  const targetedDirectory = path.join(directory, "targeted");
  fs.mkdirSync(targetedDirectory, { recursive: true });
  const scrollDialogTarget = async target => {
    await target.evaluate(element => {
      const root=element.closest(".dialog-scroll");
      if(!root){element.scrollIntoView({block:"center",behavior:"auto"});return}
      const elementRect=element.getBoundingClientRect(),rootRect=root.getBoundingClientRect();
      const centredOffset=Math.max(0,(root.clientHeight-Math.min(elementRect.height,root.clientHeight))/2);
      root.scrollTop=Math.max(0,root.scrollTop+elementRect.top-rootRect.top-centredOffset);
    });
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  };
  const capture = async (name, selector) => {
    const target = page.locator(selector).first();
    if (!(await target.count()) || !(await target.isVisible())) {
      failures.push(`${viewport.name} targeted capture missing: ${name}`);
      return;
    }
    await scrollDialogTarget(target);
    const box=await target.boundingBox();
    if(!box||box.width<1||box.height<1){
      failures.push(`${viewport.name} targeted capture empty: ${name}`);
      return;
    }
    await target.screenshot({ path: path.join(targetedDirectory, `${name}.png`) });
  };
  const captureCloudEdges = async (name, selector) => {
    const target = page.locator(selector).first();
    const scrollRoot = page.locator(".dialog-scroll").first();
    if (!(await target.count()) || !(await target.isVisible()) || !(await scrollRoot.count())) {
      failures.push(`${viewport.name} cloud capture missing: ${name}`);
      return;
    }
    await target.evaluate(element => {
      const root = element.closest(".dialog-scroll");
      if (root) root.scrollTop = Math.max(0, element.offsetTop - 220);
    });
    await scrollRoot.screenshot({ path: path.join(targetedDirectory, `${name}-top.png`) });
    await target.evaluate(element => {
      const root = element.closest(".dialog-scroll");
      if (root) root.scrollTop = Math.max(0, element.offsetTop + element.offsetHeight - root.clientHeight + 220);
    });
    await scrollRoot.screenshot({ path: path.join(targetedDirectory, `${name}-bottom.png`) });
  };
  await page.goto(`${baseUrl}/site/work/cathay-sit-online-account-opening`, { waitUntil: "networkidle" });
  const oaDialogScroll=page.locator("#detailDialog .dialog-scroll").first();
  const captureOaDialogCheckpoint=async(name,target)=>{
    if(!(await target.count())||!(await target.isVisible())||!(await oaDialogScroll.count())){
      failures.push(`${viewport.name} Cathay OA dialog checkpoint missing: ${name}`);
      return;
    }
    await scrollDialogTarget(target);
    await oaDialogScroll.screenshot({path:path.join(targetedDirectory,`${name}.png`)});
  };
  if(await oaDialogScroll.count()){
    await oaDialogScroll.evaluate(node=>{node.scrollTop=0});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await oaDialogScroll.screenshot({path:path.join(targetedDirectory,"cathay-oa-01-hero-at-a-glance.png")});
  }else failures.push(`${viewport.name} Cathay OA dialog scroll owner missing`);
  for(const [name,selector] of [
    ["cathay-oa-02-complexity","#systemCaseComplexitySection"],
    ["cathay-oa-03-contribution",".contribution-block"],
    ["cathay-oa-04-core-system-insight","[data-canonical-section-id='core-system-insight']"],
    ["cathay-oa-05-decisions","#systemCaseDecisionsSection"],
    ["cathay-oa-06-evidence","#systemCaseEvidenceSection"],
    ["cathay-oa-07-outcomes","#systemCaseOutcomesSection"],
    ["cathay-oa-08-accountability","#systemCaseAccountabilitySection"],
    ["cathay-oa-09-related-work","[data-canonical-section-id='continue-exploring']"]
  ])await captureOaDialogCheckpoint(name,page.locator(selector).first());
  const oaDecisions=page.locator("#systemCaseDecisionsSection .decision-card-v46");
  for(let index=0;index<await oaDecisions.count();index+=1)await captureOaDialogCheckpoint(`cathay-oa-decision-${String(index+1).padStart(2,"0")}`,oaDecisions.nth(index));
  const oaEvidenceGroups=page.locator("#systemCaseEvidenceSection .structured-evidence-v223__group");
  for(let index=0;index<await oaEvidenceGroups.count();index+=1)await captureOaDialogCheckpoint(`cathay-oa-evidence-${String(index+1).padStart(2,"0")}`,oaEvidenceGroups.nth(index));
  const oaTooltipAudit=await page.evaluate(()=>({
    triggers:document.querySelectorAll('#detailDialog .info-tooltip__trigger').length,
    panels:[...document.querySelectorAll('#detailDialog .info-tooltip__panel')].map(node=>node.textContent.trim())
  }));
  if(oaTooltipAudit.triggers||oaTooltipAudit.panels.some(text=>!text))failures.push(`${viewport.name} Cathay OA meaningless or empty tooltip remains: ${JSON.stringify(oaTooltipAudit)}`);
  if(viewport.width===430){
    const eyebrowRoutes=[
      'cathay-sit-online-account-opening',
      'cathay-sit-review-remediation-operations',
      'payment',
      'dbs',
      'booking',
      'ctbc-mortgage-self-service-app',
      'voucher'
    ];
    for(const projectId of eyebrowRoutes){
      await page.goto(`${baseUrl}/site/work/${projectId}`,{waitUntil:'networkidle'});
      const eyebrow=page.locator('.modal-head-meta-v60');
      if(!(await eyebrow.count())||!(await eyebrow.isVisible())){failures.push(`mobile-430 ${projectId} Hero eyebrow missing`);continue}
      const measurement=await eyebrow.evaluate(node=>{const style=getComputedStyle(node),lineHeight=parseFloat(style.lineHeight),height=node.getBoundingClientRect().height;return{text:node.textContent.trim(),height,lineHeight,lines:lineHeight?Math.round(height/lineHeight):null,overflow:node.scrollHeight-node.clientHeight}});
      if(!measurement.text||measurement.lines===null||measurement.lines<1||measurement.lines>2||measurement.overflow>1)failures.push(`mobile-430 ${projectId} Hero eyebrow exceeds shared two-line contract: ${JSON.stringify(measurement)}`);
    }
  }

  await page.goto(`${baseUrl}/site/work/voucher`, { waitUntil: "networkidle" });
  for (const [name, selector] of [
    ["parent-contribution", ".contribution-block"],
    ["parent-core-system-insight", ".core-system-insight-section"],
    ["parent-outcomes", "#voucherImpactSection"],
    ["parent-research", "[data-component-owner='ResearchEvidenceMetric']"],
    ["parent-at-a-glance", "#projectOverviewSection"],
    ["r1592-research-metrics", ".research-evidence-metrics"],
    ["r1592-accountability", "[data-canonical-section-id='ownership-and-evidence']"],
    ["r1592-project-navigator", "#projectSectionNav"],
    ["parent-reusable-system", "[data-canonical-section-id='reusable-system']"],
    ["stage-discover", "[data-stage-card='discover']"],
    ["stage-qualify", "[data-stage-card='qualify']"],
    ["stage-activate", "[data-stage-card='activate']"],
    ["stage-redeem", "[data-stage-card='redeem']"],
    ["stage-review", "[data-stage-card='review']"],
  ]) await capture(name, selector);
  if (await page.locator(".project-system-change-v214__row:visible").count()) await capture("r1592-before-after", ".project-system-change-v214__row:visible");
  if (["desktop-1419", "tablet-871", "mobile-430"].includes(viewport.name)) {
    await captureCloudEdges("parent-core-system-insight-cloud", ".core-system-insight-section.case-study-cloud-emphasis");
  }

  const allTooltipTriggers=page.locator(".info-tooltip__trigger");
  const outcomeTooltipIndexes=await allTooltipTriggers.evaluateAll(nodes=>nodes.map((node,index)=>({node,index})).filter(({node})=>node.closest('[data-component-owner="OutcomeMetric"]')&&node.offsetWidth>0&&node.offsetHeight>0&&getComputedStyle(node).visibility!=="hidden").map(({index})=>index));
  const activateTooltip=async trigger=>{await trigger.evaluate(node=>node.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"}));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await trigger.click();};
  const firstTooltip=allTooltipTriggers.nth(outcomeTooltipIndexes[0]);
  const tooltipState={count:await allTooltipTriggers.count(),liveOutcomeCount:outcomeTooltipIndexes.length};
  if(outcomeTooltipIndexes.length!==4)failures.push(`${viewport.name} live Outcome tooltip count ${outcomeTooltipIndexes.length}`);
  if(outcomeTooltipIndexes.length){
    await activateTooltip(firstTooltip);
    tooltipState.outcomeClickOpen=await firstTooltip.getAttribute("aria-expanded");
    if(tooltipState.outcomeClickOpen!=="true")failures.push(`${viewport.name} Outcome tooltip did not open`);
    await activateTooltip(firstTooltip);
    tooltipState.outcomeSecondClickClosed=await firstTooltip.getAttribute("aria-expanded");
    if(tooltipState.outcomeSecondClickClosed!=="false")failures.push(`${viewport.name} Outcome tooltip did not toggle closed for touch/pointer`);
    await firstTooltip.focus();await firstTooltip.press("Enter");await firstTooltip.press("Escape");
    tooltipState.outcomeEscapeClosed=await firstTooltip.getAttribute("aria-expanded");
    if(tooltipState.outcomeEscapeClosed!=="false")failures.push(`${viewport.name} Outcome tooltip did not close with Escape`);
  }
  r156.initialFocus = initialFocus;
  r156.tooltipState = tooltipState;
  const r1592 = await page.evaluate(() => {
    const visible = node => Boolean(node && node.offsetWidth && node.offsetHeight && getComputedStyle(node).visibility !== 'hidden');
    const box = node => { const r=node.getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}; };
    const overviewTitle = [...document.querySelectorAll('#projectOverviewSection h2,#projectOverviewSection h3')].find(visible);
    const overviewBody = [...document.querySelectorAll('#projectOverviewSection p')].find(visible);
    const research = [...document.querySelectorAll('.research-evidence-metric')].filter(visible);
    const outcomesNode=document.querySelector('#voucherImpactSection');
    const accountabilityNode=document.querySelector('[data-canonical-section-id="ownership-and-evidence"]');
    const foundations = [...document.querySelectorAll('.voucher-r149-foundation')].filter(visible);
    const nav = document.querySelector('#projectSectionNav');
    const dialog = document.querySelector('.detail-dialog-v45[open]');
    const navRail = nav?.querySelector('.floating-navigator__rail');
    const navItems = [...document.querySelectorAll('#projectSectionNavLinks a')].filter(visible);
    const activeNav=navItems.find(node=>node.getAttribute('aria-current')==='location');
    const triggers=[...document.querySelectorAll('.info-tooltip__trigger')].filter(visible);
    const metricTypography=research.map(node=>{const value=node.querySelector(':scope>strong'),label=node.querySelector('.research-evidence-metric__label'),vs=getComputedStyle(value),ls=getComputedStyle(label);return {value:value?.textContent.trim(),valueStyle:[vs.fontFamily,vs.fontSize,vs.lineHeight,vs.fontWeight,vs.letterSpacing],labelStyle:[ls.fontFamily,ls.fontSize,ls.lineHeight,ls.fontWeight,ls.letterSpacing],box:box(node)}});
    return {
      overviewGap: overviewTitle && overviewBody ? overviewBody.getBoundingClientRect().top - overviewTitle.getBoundingClientRect().bottom : null,
researchValues: metricTypography.map(item=>item.value),
      metricTypography,
      accountabilityEdges: outcomesNode&&accountabilityNode ? {left:Math.abs(box(outcomesNode).left-box(accountabilityNode).left),right:Math.abs(box(outcomesNode).right-box(accountabilityNode).right),outcomes:box(outcomesNode),accountability:box(accountabilityNode)} : null,
      foundationBoxes: foundations.map(box),
      navShared: Boolean(nav?.classList.contains('floating-navigator')) && navItems.every(node => node.classList.contains('floating-navigator__item')),
      navVisual:activeNav?(()=>{const s=getComputedStyle(activeNav),nr=box(nav),dr=dialog?box(dialog):null,rs=navRail?getComputedStyle(navRail):null,ns=getComputedStyle(nav),items=navItems.map(item=>{const ir=box(item),range=document.createRange();range.selectNodeContents(item);const tr=range.getBoundingClientRect();const cs=getComputedStyle(item);return {alignItems:cs.alignItems,justifyContent:cs.justifyContent,horizontalCenterDelta:Math.abs((ir.left+ir.right)/2-(tr.left+tr.right)/2),verticalCenterDelta:Math.abs((ir.top+ir.bottom)/2-(tr.top+tr.bottom)/2)}});return {background:s.backgroundColor,color:s.color,radius:s.borderRadius,paddingInline:s.paddingInline,paddingBlock:s.paddingBlock,minHeight:s.minHeight,textDecoration:s.textDecorationLine,box:box(activeNav),shell:nr,dialog:dr,shellBottomInset:dr?dr.bottom-nr.bottom:null,shellWidth:nr.width,railScrollWidth:navRail?.scrollWidth||0,shellPaddingInline:ns.paddingInline,shellBorderInline:ns.borderLeftWidth,railWidth:navRail?box(navRail).width:null,railMaxWidth:rs?.maxWidth,items}})():null,
      tooltipBoxes:triggers.map(node=>box(node)),
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });
  const uniform=a=>a.length>0&&a.every(value=>JSON.stringify(value)===JSON.stringify(a[0]));
  if(r1592.overviewGap===null||Math.abs(r1592.overviewGap-8)>2)failures.push(`${viewport.name} At a glance rendered gap ${r1592.overviewGap}`);
if(r1592.researchValues.join('|')!=='2,857|93%|87%'||!uniform(r1592.metricTypography.map(x=>x.valueStyle))||!uniform(r1592.metricTypography.map(x=>x.labelStyle)))failures.push(`${viewport.name} research metric rendered typography mismatch`);
  if(r1592.tooltipBoxes.some(box=>Math.abs(box.width-box.height)>1||box.width>18||box.height>18))failures.push(`${viewport.name} Tooltip trigger is not a compact square: ${JSON.stringify(r1592.tooltipBoxes)}`);
  if(viewport.width===430){const boxes=r1592.metricTypography.map(x=>x.box);if(boxes.length!==3||boxes.some((b,i)=>i&&Math.abs(b.left-boxes[0].left)>2)||!(boxes[1].top>boxes[0].bottom&&boxes[2].top>boxes[1].bottom)||boxes.some(b=>b.width<200))failures.push(`${viewport.name} research metric rendered rows invalid: ${JSON.stringify(boxes)}`);const cards=r1592.foundationBoxes;if(cards.length!==4||cards.some((b,i)=>i&&Math.abs(b.left-cards[0].left)>2)||cards.some((b,i)=>i&&!(b.top>cards[i-1].bottom))||cards.some(b=>b.width<200))failures.push(`${viewport.name} reusable foundation rendered rows invalid: ${JSON.stringify(cards)}`);}
  if(r1592.accountabilityEdges&&(r1592.accountabilityEdges.left>2||r1592.accountabilityEdges.right>2))failures.push(`${viewport.name} accountability/outcomes visible edges differ: ${JSON.stringify(r1592.accountabilityEdges)}`);
  if(!r1592.navShared||!r1592.navVisual||r1592.navVisual.radius==='0px'||r1592.navVisual.background==='rgba(0, 0, 0, 0)'||r1592.navVisual.textDecoration!=='none'||r1592.navVisual.shellBottomInset<0||r1592.navVisual.shellWidth>r1592.navVisual.railScrollWidth+20||r1592.navVisual.items.some(x=>x.alignItems!=='center'||x.justifyContent!=='center'||x.horizontalCenterDelta>2||x.verticalCenterDelta>2))failures.push(`${viewport.name} project navigator rendered active state mismatch: ${JSON.stringify(r1592.navVisual)}`);
  if(r1592.horizontalOverflow)failures.push(`${viewport.name} R159.3 horizontal overflow`);
  await page.goto(`${baseUrl}/site/work/dbs`,{waitUntil:"networkidle"});
  const beforeAfter=await page.locator(".contribution-block .voucher-r149-flow > article:not(.contribution-block__intervention):visible").evaluateAll(nodes=>nodes.map(node=>({label:node.textContent.trim(),box:(()=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}})()})));
  if(beforeAfter.length!==2||beforeAfter.some(item=>!item.label))failures.push(`${viewport.name} shared ContributionBlock Before/After nodes mismatch: ${JSON.stringify(beforeAfter)}`);
  if(beforeAfter.length===2)await page.locator(".contribution-block .voucher-r149-flow").screenshot({path:path.join(targetedDirectory,"r1593-before-after-contribution-flow.png")});
  r1592.beforeSurfaces=beforeAfter;
  await page.goto(`${baseUrl}/site/work/voucher`,{waitUntil:"networkidle"});

  tooltipState.exclusive=false;
  if(outcomeTooltipIndexes.length>1){
    const first=allTooltipTriggers.nth(outcomeTooltipIndexes[0]),second=allTooltipTriggers.nth(outcomeTooltipIndexes[1]);
    await activateTooltip(first);await activateTooltip(second);
    const firstPanel=page.locator(`#${await first.getAttribute('aria-controls')}`);
    const secondPanel=page.locator(`#${await second.getAttribute('aria-controls')}`);
    tooltipState.exclusive=(await first.getAttribute('aria-expanded'))==='false'&&(await second.getAttribute('aria-expanded'))==='true'&&await firstPanel.isHidden()&&await secondPanel.isVisible();
    if(!tooltipState.exclusive)failures.push(`${viewport.name} Tooltip exclusive-open state failed`);
    await page.screenshot({path:path.join(targetedDirectory,'tooltip-exclusive-b-open-a-closed.png')});
    await second.press('Escape');
  }
  r156.r1592 = r1592;
  const r158 = { contribution: null, research: null, cloud: null, tooltips: [], anchors: {} };
  r158.contribution = await page.locator(".voucher-r149-flow").evaluate(flow => {
    const cards=[...flow.querySelectorAll(":scope>article")].map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,background:getComputedStyle(node).backgroundColor,color:getComputedStyle(node).color}});
    return {cards,oneRow:new Set(cards.map(card=>Math.round(card.y))).size===1,equalWidth:Math.max(...cards.map(x=>x.width))-Math.min(...cards.map(x=>x.width))<1,equalHeight:Math.max(...cards.map(x=>x.height))-Math.min(...cards.map(x=>x.height))<1};
  });
  r158.research = await page.locator(".research-evidence-metrics").evaluate(grid => {
    const values=[...grid.querySelectorAll(".research-evidence-metric>strong")].map(node=>{const r=node.getBoundingClientRect();return {text:node.textContent.trim(),y:r.y,color:getComputedStyle(node).color}});
    const labels=[...grid.querySelectorAll(".research-evidence-metric__label")].map(node=>node.getBoundingClientRect().y);
    return {values,labels,valueAligned:Math.max(...values.map(x=>x.y))-Math.min(...values.map(x=>x.y))<1,labelAligned:Math.max(...labels)-Math.min(...labels)<1};
  });
  r158.cloud = await page.locator(".core-system-insight-section.case-study-cloud-emphasis").first().evaluate(node=>{const r=node.getBoundingClientRect(),root=node.closest(".dialog-scroll").getBoundingClientRect();return {left:r.left,right:r.right,rootLeft:root.left,rootRight:root.right,leftDelta:Math.abs(r.left-root.left),rightDelta:Math.abs(r.right-root.right)}});
  const tooltipIndexes=[outcomeTooltipIndexes[0],outcomeTooltipIndexes[Math.floor(outcomeTooltipIndexes.length/2)],outcomeTooltipIndexes[outcomeTooltipIndexes.length-1]];
  for(const [label,index] of [["left",tooltipIndexes[0]],["centre",tooltipIndexes[1]],["right",tooltipIndexes[2]]]){
    const trigger=allTooltipTriggers.nth(index);await trigger.evaluate(node=>node.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"}));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const closed=await trigger.evaluate(node=>node.closest(".inline-tooltip-tail")?.getBoundingClientRect().height||node.parentElement.getBoundingClientRect().height);const panelId=await trigger.getAttribute("aria-controls");if(!panelId)throw new Error(`${viewport.name} tooltip ${label} missing aria-controls`);const panel=page.locator(`#${panelId}`);await activateTooltip(trigger);await panel.waitFor({state:"visible"});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));const visibleState=await panel.evaluate(node=>({hidden:node.hidden,display:getComputedStyle(node).display,visibility:getComputedStyle(node).visibility,opacity:getComputedStyle(node).opacity,hasBox:Boolean(node.offsetWidth&&node.offsetHeight)}));if(visibleState.hidden||visibleState.display==="none"||visibleState.visibility==="hidden"||visibleState.opacity==="0"||!visibleState.hasBox)failures.push(`${viewport.name} tooltip ${label} is not visually open: ${JSON.stringify(visibleState)}`);
    const measurement=await panel.evaluate((node)=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight,contained:r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,whiteSpace:getComputedStyle(node).whiteSpace}},null);const openHeight=await trigger.evaluate(node=>node.closest(".inline-tooltip-tail")?.getBoundingClientRect().height||node.parentElement.getBoundingClientRect().height);measurement.lineBoxDelta=Math.abs(openHeight-closed);measurement.label=label;r158.tooltips.push(measurement);if(!measurement.contained)failures.push(`${viewport.name} tooltip ${label} not viewport-contained`);if(measurement.lineBoxDelta>0.5)failures.push(`${viewport.name} tooltip ${label} line-box delta ${measurement.lineBoxDelta}`);await page.screenshot({path:path.join(targetedDirectory,`tooltip-${label}.png`)});await trigger.press("Escape");await panel.waitFor({state:"hidden"});if(await trigger.getAttribute("aria-expanded")!=="false")failures.push(`${viewport.name} tooltip ${label} did not close with Escape`);
  }
  for(const stage of ["discover","qualify","activate","redeem","review"]){
    await page.goto(`${baseUrl}/site/work/voucher`,{waitUntil:"networkidle"});
    const parentScroll=page.locator(".dialog-scroll").first(),link=page.locator(`a[data-stage="${stage}"]`).first();
    await link.evaluate(node=>node.scrollIntoView({block:'center',behavior:'auto'}));await parentScroll.evaluate((root,stageId)=>{const card=root.querySelector(`[data-stage-card="${stageId}"]`);root.scrollTop=Math.max(0,card.offsetTop-120)},stage);
    const before=await parentScroll.evaluate(root=>root.scrollTop);
    await Promise.all([
      page.waitForURL(url=>url.searchParams.get("stage")===stage),
      link.evaluate(node=>node.click())
    ]);
    await page.waitForLoadState("networkidle");
    await page.locator(".voucher-stage-hero").waitFor({state:"visible"});
    const back=page.locator("#detailBack").first();
    await back.waitFor({state:"visible"});
    if(viewport.name==="desktop-1419"||viewport.name==="mobile-430")await back.screenshot({path:path.join(targetedDirectory,`child-${stage}-back-left.png`)});
    const backLabel=await back.getAttribute("aria-label");
    const backIcon=back.locator('.icon-arrow').first();
    const backDirection=await backIcon.evaluate(node=>({canonical:node.classList.contains('icon-arrow--left'),rotation:getComputedStyle(node).getPropertyValue('--arrow-rotation').trim(),transform:getComputedStyle(node).transform}));
    if(!backDirection.canonical||backDirection.transform==='none'||!(()=>{const m=backDirection.transform.match(/matrix\(([^)]+)\)/)?.[1].split(',').map(Number);return m&&m[2]<-.9&&Math.abs(m[3])<.1})())failures.push(`${viewport.name} ${stage} child Back is not rendered LEFT: ${JSON.stringify(backDirection)}`);
    if(!/voucher.*offer.*overview/i.test(backLabel||""))failures.push(`${viewport.name} ${stage} overview control label mismatch`);
    await back.click();
    await page.waitForURL(url=>!url.searchParams.has("stage"));
    await page.locator(`[data-stage-card="${stage}"]`).waitFor({state:"visible"});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const restoredScroll=page.locator(".dialog-scroll").first();
    const after=await restoredScroll.evaluate(root=>root.scrollTop);
    const restoredAnchor=await page.locator(`[data-stage-card="${stage}"]`).evaluate((node)=>{const root=node.closest(".dialog-scroll"),nodeRect=node.getBoundingClientRect(),rootRect=root.getBoundingClientRect();return {stage:node.dataset.stageCard,offsetFromRoot:nodeRect.top-rootRect.top,visible:nodeRect.bottom>rootRect.top&&nodeRect.top<rootRect.bottom}});
    const delta=Math.abs(after-before);
    r158.anchors[stage]={before,after,delta,backSelector:"#detailBack",backLabel,restoredAnchor,pass:delta<=2&&restoredAnchor.visible};
    if(delta>2||!restoredAnchor.visible)failures.push(`${viewport.name} ${stage} parent anchor restoration delta ${delta}`);
  }
  r156.r158=r158;
  await page.goto(`${baseUrl}/site/work/voucher`,{waitUntil:"networkidle"});

  if (viewport.name === "desktop-1419" || viewport.name === "mobile-430") {
    for (const stage of ["discover", "qualify", "activate", "redeem", "review"]) {
      await page.goto(`${baseUrl}/site/work/voucher?case=voucher&stage=${stage}`, { waitUntil: "networkidle" });
      await capture(`child-${stage}-overview`, ".voucher-stage-hero");
      await captureCloudEdges(`child-${stage}-cloud`, ".voucher-stage-surface.case-study-cloud-emphasis");
      await capture(`child-${stage}-footer`, ".child-stage-navigation");
      if (stage === "discover") {
        const decisionGroups = page.locator(".voucher-stage-decision-list > .voucher-stage-decision-group:visible");
        const decisions = decisionGroups.locator(":scope > .voucher-r149-decision");
        if (await decisions.count() >= 2) {
          await scrollDialogTarget(decisions.nth(0));
          const evidenceImage=decisionGroups.nth(0).locator(":scope > .evidence-frame img").first();
          if(await evidenceImage.count()){
            await evidenceImage.evaluate(image=>{image.loading="eager";if(image.complete)return true;return new Promise(resolve=>{image.addEventListener('load',()=>resolve(true),{once:true});image.addEventListener('error',()=>resolve(false),{once:true})})});
            const imageState=await evidenceImage.evaluate(image=>{const ir=image.getBoundingClientRect(),evidence=image.closest('.evidence-frame').getBoundingClientRect(),content=image.closest('.voucher-stage-decision-group').getBoundingClientRect(),media=image.closest('.evidence-frame__media'),ms=getComputedStyle(media),ratio=ir.width/ir.height,intrinsic=image.naturalWidth/image.naturalHeight;return {complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,src:image.currentSrc||image.src,visible:Boolean(image.offsetWidth&&image.offsetHeight),edges:{left:Math.abs(content.left-evidence.left),right:Math.abs(content.right-evidence.right)},ratioDelta:Math.abs(ratio-intrinsic),image:{width:ir.width,height:ir.height},evidence:{width:evidence.width,height:evidence.height},mediaBackground:ms.backgroundColor,mediaPadding:ms.padding}});
            if(!imageState.complete||!imageState.naturalWidth||!imageState.visible||imageState.edges.left>2||imageState.edges.right>2||imageState.ratioDelta>.01||imageState.mediaPadding!=='0px')failures.push(`${viewport.name} Discover PDP rendered evidence geometry failed: ${JSON.stringify(imageState)}`);
          }else failures.push(`${viewport.name} Discover PDP evidence image missing`);
          await decisions.nth(0).screenshot({ path: path.join(targetedDirectory, "discover-decision-01.png") });
          await capture("discover-pdp-evidence", ".voucher-stage-decision-list > .voucher-stage-decision-group:first-child > .evidence-frame");
          await scrollDialogTarget(decisions.nth(1));
          await decisions.nth(1).screenshot({ path: path.join(targetedDirectory, "discover-decision-02.png") });
        } else failures.push(`${viewport.name} Discover decision captures missing`);
      }
    }
    for (const [name, route, text] of [
      ["booking-core-insight", "/site/work/booking-taxi-pickup-service-strategy", "Taxi pickup expansion could not be treated as one global product assumption"],
      ["cathay-oa-core-insight", "/site/work/cathay-sit-online-account-opening", "Self-service account opening only worked"],
      ["cathay-review-core-insight", "/site/work/cathay-sit-review-remediation-operations", "Review remediation needed a shared internal operating model"],
      ["dbs-regression", "/site/work/dbs", "Scaling the workflow required shared decision logic"],
    ]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      const target = page.getByText(text, { exact: false }).first();
      if (await target.count()) {
        const sectionTarget = target.locator("xpath=ancestor::section[1]");
        if (await sectionTarget.count()) {
          await sectionTarget.scrollIntoViewIfNeeded();
          await sectionTarget.screenshot({ path: path.join(targetedDirectory, `${name}.png`) });
        }
      } else failures.push(`${viewport.name} cross-project target missing: ${name}`);
    }
    await page.goto(`${baseUrl}/site/work/voucher`, { waitUntil: "networkidle" });
  }

  const parityRoutes=[["Voucher","/site/work/voucher"],["DBS","/site/work/dbs"],["Booking","/site/work/booking"],["CTBC","/site/work/ctbc-mortgage-self-service-app"]],sharedParity={};
  for(const [projectName,route] of parityRoutes){
    await page.goto(`${baseUrl}${route}`,{waitUntil:"networkidle"});
    const insight=page.locator('[data-component-owner="CoreSystemInsightSection"],[data-canonical-section-id="core-system-insight"]').first(),accountability=page.locator('[data-component-owner="SharedAccountability"],[data-canonical-section-id="my-accountability"],[data-canonical-section-id="ownership-and-evidence"]').first();
    if(!await insight.count()){failures.push(`${viewport.name} ${projectName} Core Insight missing`);continue}
    const ig=await insight.evaluate(node=>{const h=node.querySelector('.voucher-r149-heading'),e=node.querySelector('.voucher-r149-eyebrow'),t=h?.querySelector('h2'),b=h?.querySelector('.voucher-r149-intro'),r=h?.getBoundingClientRect(),nr=node.getBoundingClientRect(),s=x=>x?getComputedStyle(x):null,centerDelta=r?Math.abs(((r.left+r.right)/2)-((nr.left+nr.right)/2)):null;return{section:{left:nr.left,right:nr.right,width:nr.width},heading:{left:r?.left,right:r?.right,width:r?.width},eyebrowAlign:s(e)?.textAlign,titleAlign:s(t)?.textAlign,bodyAlign:s(b)?.textAlign,centerDelta,centered:centerDelta!==null&&centerDelta<=1,edgeSafe:r?r.left>=nr.left&&r.right<=nr.right:false}});
    if(!ig.centered||!ig.edgeSafe||[ig.eyebrowAlign,ig.titleAlign,ig.bodyAlign].some(v=>v!=="center"))failures.push(`${viewport.name} ${projectName} Core Insight parity failed: ${JSON.stringify(ig)}`);
    if(!await accountability.count()){failures.push(`${viewport.name} ${projectName} Accountability missing`);continue}
    const ag=await accountability.evaluate(node=>{const g=node.querySelector('.voucher-r149-accountability'),ps=[...node.querySelectorAll('.voucher-r149-accountability__primary')],bd=node.querySelector('.voucher-r149-accountability__boundary'),gr=g?.getBoundingClientRect(),rs=ps.map(x=>{const r=x.getBoundingClientRect();return{top:r.top,bottom:r.bottom,source:x.dataset.accountabilitySource,label:x.querySelector('.voucher-r149-eyebrow')?.textContent.trim()}}),mobile=innerWidth<=600;return{columns:getComputedStyle(g).gridTemplateColumns,primary:rs,boundary:Boolean(bd),boundaryBelow:!bd||bd.getBoundingClientRect().top>=Math.max(...rs.map(r=>r.bottom)),noOverflow:gr.left>=0&&gr.right<=innerWidth,mobileOrder:mobile?rs.every((r,i)=>i===0||r.top>=rs[i-1].bottom):null}});
    if(ag.primary.length!==2||ag.primary[0].source!=="I LED"||ag.primary[1].source!=="I CO-DECIDED"||!ag.boundaryBelow||!ag.noOverflow)failures.push(`${viewport.name} ${projectName} Accountability parity failed: ${JSON.stringify(ag)}`);
    if(viewport.width===871&&ag.columns.trim().split(/\s+/).length!==2)failures.push(`${viewport.name} ${projectName} Accountability tablet columns failed`);if(viewport.width===430&&!ag.mobileOrder)failures.push(`${viewport.name} ${projectName} Accountability mobile order failed`);
    sharedParity[projectName]={insight:ig,accountability:ag};
  }
  r156.sharedProjectDetailParity=sharedParity;await page.goto(`${baseUrl}/site/work/voucher`,{waitUntil:"networkidle"});
  await page.goto(`${baseUrl}/site/work`,{waitUntil:"networkidle"});
  const projectCardVisual=await page.locator(".work-card-v32__top").evaluateAll(nodes=>nodes.slice(0,5).map(top=>{const root=top.closest(".work-card-v32"),metadata=top.firstElementChild||top,title=root?.querySelector("h2"),context=metadata.querySelector(".company-context-v132"),cs=getComputedStyle(metadata),tr=title?.getBoundingClientRect(),cr=top.getBoundingClientRect();return {company:metadata.textContent.trim(),color:cs.color,neutral:(()=>{const probe=document.createElement("span");probe.style.color="var(--color-text-secondary)";document.body.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color})(),titleGap:tr?tr.top-cr.bottom:null,separator:context?getComputedStyle(context,"::before").marginInline:null}}));
  if(projectCardVisual.length<3||projectCardVisual.some(x=>x.color!==x.neutral||x.titleGap===null||Math.abs(x.titleGap-24)>.5))failures.push(`${viewport.name} ProjectCard rendered company hierarchy failed: ${JSON.stringify(projectCardVisual)}`);
  await page.screenshot({path:path.join(targetedDirectory,"r1593-project-cards.png"),fullPage:false});
  await page.goto(`${baseUrl}/site/`,{waitUntil:"networkidle"});
  await page.locator("#domains").scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  const domainShared=await page.locator(".related-project-card-v45--media-stack").evaluateAll(cards=>cards.slice(0,3).map(card=>{const media=card.querySelector(".related-project-card__visual-v45"),content=card.querySelector(".related-project-card__content-v1612"),company=card.querySelector(".related-project-card__top-v45"),title=card.querySelector(".related-project-card__title"),cr=card.getBoundingClientRect(),mr=media?.getBoundingClientRect(),xr=content?.getBoundingClientRect(),br=company?.getBoundingClientRect(),tr=title?.getBoundingClientRect();return{insetLeft:mr?mr.left-(cr.left+parseFloat(getComputedStyle(card).borderLeftWidth)):null,insetRight:mr?(cr.right-parseFloat(getComputedStyle(card).borderRightWidth))-mr.right:null,overlap:mr&&xr?Math.max(0,mr.bottom-xr.top):null,titleGap:br&&tr?tr.top-br.bottom:null,contentPadding:xr?getComputedStyle(content).paddingInline:null}}));
  if(domainShared.length<2||domainShared.some(x=>x.insetLeft===null||Math.abs(x.insetLeft)>.5||Math.abs(x.insetRight)>.5||x.overlap!==0||Math.abs(x.titleGap-24)>.5))failures.push(`${viewport.name} Domain ProjectCard media-stack geometry failed: ${JSON.stringify(domainShared)}`);
  const domainState=await page.evaluate(()=>({rail:[...document.querySelectorAll(".domain-tab")].map(x=>x.getAttribute("aria-selected")),floating:[...document.querySelectorAll("[data-domain-floating]")].map(x=>x.getAttribute("aria-pressed")),classes:[...document.querySelectorAll("[data-domain-floating]")].map(x=>x.classList.contains("floating-navigator__item"))}));
  if(domainState.classes.some(x=>!x))failures.push(`${viewport.name} Domain floating item canonical class missing: ${JSON.stringify(domainState)}`);
  await page.goto(`${baseUrl}/site/work/voucher`,{waitUntil:"networkidle"});
  const headerMetadata=await page.locator(".modal-head-meta-v60").evaluate(node=>{const company=node.querySelector(".company-name-v132"),separator=node.querySelector(".company-separator-v159"),context=node.querySelector(".company-context-v132"),rect=n=>{const r=n?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null},cs=getComputedStyle(node);const cr=rect(company),sr=rect(separator),xr=rect(context);return {company:company?.textContent.trim(),separator:separator?.textContent.trim(),context:context?.textContent.trim(),gap:cs.columnGap,padding:[company,separator,context].map(n=>n?getComputedStyle(n).padding:null),margins:[company,separator,context].map(n=>n?getComputedStyle(n).margin:null),pseudoContent:context?getComputedStyle(context,"::before").content:null,companyToSeparator:cr&&sr?sr.left-cr.right:null,separatorToContext:sr&&xr?xr.left-sr.right:null}});
  if(headerMetadata.context&&(!headerMetadata.separator||headerMetadata.gap!=="4px"||headerMetadata.padding.some(x=>x!=="0px")||headerMetadata.margins.some(x=>x!=="0px")||Math.abs(headerMetadata.companyToSeparator-4)>.75||Math.abs(headerMetadata.separatorToContext-4)>.75||!['none','normal'].includes(headerMetadata.pseudoContent)))failures.push(`${viewport.name} inline company glyph spacing ${JSON.stringify(headerMetadata)}`);
  await page.screenshot({path:path.join(targetedDirectory,"r1593-company-metadata.png"),fullPage:false});

  const links = page.locator("a[href]");
  const linkCount = await links.count();
  const destinations = [];
  for (let index = 0; index < Math.min(linkCount, 40); index += 1) {
    const href = await links.nth(index).getAttribute("href");
    if (href) destinations.push(href);
  }
  const interactive = page.locator("a[href*='stage='], a.programme-stage-case__cta").first();
  let interaction = { available: false };
  if (await interactive.count()) {
    const href = await interactive.getAttribute("href");
    await page.goto(new URL(href, baseUrl).href, { waitUntil: "networkidle" });
    interaction = { available: true, href, resultingUrl: page.url() };
    if (page.url() === `${baseUrl}/site/work/voucher`) failures.push(`${viewport.name} CTA did not navigate`);
  }

  report.viewports[viewport.name] = {
    width: viewport.width,
    height: viewport.height,
    routes: routeResults,
    consoleErrors,
    runtimeErrors,
    networkErrors,
    discoveredDestinations: destinations,
    interaction,
    r157Targeted: r156,
    r159Navigator: { contract: navigatorContract, interactions: navigatorInteractions },
    ctbcReadingEdges: ctbcCertification.geometry,
  };
  await page.goto(`${baseUrl}/site/work/booking-taxi-pickup-service-strategy`,{waitUntil:"networkidle"});
  const r171Presentation=await page.evaluate(()=>{
    const dialog=document.querySelector("#detailDialog"),visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=="none"&&node.getClientRects().length);
    const surface=[...dialog.querySelectorAll("#programmeSurface > *")].filter(visible);
    return{
      title:dialog.querySelector("#detailTitle")?.textContent.trim(),
      taxonomy:[...dialog.querySelectorAll("#detailTags > *")].filter(visible).map(node=>node.textContent.trim()),
      navigator:[...dialog.querySelectorAll("#projectSectionNav a")].filter(visible).map(node=>node.textContent.trim()),
      order:surface.map(node=>node.dataset.canonicalSectionId),
      decisionTop:dialog.querySelector("#systemCaseDecisionsSection")?.getBoundingClientRect().top,
      evidenceTop:dialog.querySelector("#systemCaseEvidenceSection")?.getBoundingClientRect().top,
      decisionCount:dialog.querySelectorAll("#systemCaseDecisionsSection .voucher-stage-decision-group").length,
      evidenceCount:dialog.querySelectorAll("#systemCaseEvidenceSection .structured-evidence-v223__group").length,
      decisionMetadataVisible:[...dialog.querySelectorAll(".structured-evidence-v223__decision-link")].some(node=>visible(node)),
      text:dialog.innerText,
      overflowX:getComputedStyle(dialog.querySelector(".dialog-scroll")).overflowX
    };
  });
  const r171Order=["what-made-this-hard","my-contribution","core-system-insight","key-design-decisions","evidence-to-operating-model","outcomes","my-accountability"];
  if(r171Presentation.title!=="Uncertain expansion to a lower-risk taxi pickup experiment"||r171Presentation.taxonomy.length||JSON.stringify(r171Presentation.navigator)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes","Ownership"])||JSON.stringify(r171Presentation.order.map(id=>id).filter(id=>r171Order.includes(id)))!==JSON.stringify(r171Order)||!(r171Presentation.decisionTop<r171Presentation.evidenceTop)||r171Presentation.decisionCount!==3||r171Presentation.evidenceCount!==4)failures.push(`${viewport.name} R171 composition mismatch: ${JSON.stringify(r171Presentation)}`);
  if(r171Presentation.decisionMetadataVisible||/Critical Problem|Business Impact|Ownership and Collaboration|Delivery and Measurement|Status and Disclosure|Continue Exploring/.test(r171Presentation.text))failures.push(`${viewport.name} R171 legacy or metadata leak`);
  if(/~7%|150 rides|2-week|two-week|40\+ countries|conversion uplift|revenue uplift|experiment success|market-wide rollout/i.test(r171Presentation.text))failures.push(`${viewport.name} R171 main Booking contamination`);
  if(!["hidden","clip"].includes(r171Presentation.overflowX))failures.push(`${viewport.name} R171 horizontal containment failed`);
  if([1419,871,430].includes(viewport.width)){
    const targetDir=path.join(outputRoot,"r171-booking-taxi",viewport.name);fs.mkdirSync(targetDir,{recursive:true});
    const checkpoints=[["01-overview","#projectOverviewSection","#projectOverviewSection"],["02-complexity","#systemCaseComplexitySection","#systemCaseComplexitySection"],["03-decisions","#systemCaseDecisionsSection","#systemCaseDecisionsSection"],["04-evidence-a","#systemCaseEvidenceSection .structured-evidence-v223__group:first-of-type","#systemCaseEvidenceSection"],["05-evidence-b","#systemCaseEvidenceSection .structured-evidence-v223__group:last-of-type","#systemCaseEvidenceSection"],["06-outcomes","#systemCaseOutcomesSection","#systemCaseOutcomesSection"],["07-ownership","#systemCaseAccountabilitySection","#systemCaseAccountabilitySection"]];
    const scroll=page.locator("#detailDialog .dialog-scroll").first();
    for(const [name,selector,expectedHref] of checkpoints){
      const target=page.locator(selector).first();if(!await target.count()){failures.push(`${viewport.name} R171 checkpoint missing: ${name}`);continue}
      await scroll.evaluate((root,query)=>{const target=root.querySelector(query);if(target){const activation=Math.max(96,Math.min(160,root.clientHeight*.2));root.scrollTop=Math.max(0,root.scrollTop+target.getBoundingClientRect().top-root.getBoundingClientRect().top-activation+2)}},selector);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const activeHref=await page.locator("#projectSectionNav a[aria-current='location']").getAttribute("href");
      if(activeHref!==expectedHref)failures.push(`${viewport.name} R171 navigator drift at ${name}: expected ${expectedHref}, got ${activeHref}`);
      await page.screenshot({path:path.join(targetDir,`${name}.png`),fullPage:false});
    }
  }

  await page.goto(`${baseUrl}/site/work/cathay-mortgage-assistant`,{waitUntil:"networkidle"});
  const r172Presentation=await page.evaluate(()=>{
    const dialog=document.querySelector("#detailDialog"),visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=="none"&&node.getClientRects().length);
    const surface=[...dialog.querySelectorAll("#programmeSurface > *")].filter(visible);
    return{
      title:dialog.querySelector("#detailTitle")?.textContent.trim(),
      context:dialog.querySelector("#detailContext")?.textContent.trim(),
      atAGlance:dialog.querySelector("#projectAtGlance")?.textContent.trim(),
      atAGlanceLines:(()=>{const node=dialog.querySelector("#projectAtGlance"),style=getComputedStyle(node);return Math.round(node.getBoundingClientRect().height/parseFloat(style.lineHeight))})(),
      taxonomy:[...dialog.querySelectorAll("#detailTags > *")].filter(visible).map(node=>node.textContent.trim()),
      navigator:[...dialog.querySelectorAll("#projectSectionNav a")].filter(visible).map(node=>node.textContent.trim()),
      order:surface.map(node=>node.dataset.canonicalSectionId),
      decisionTop:dialog.querySelector("#systemCaseDecisionsSection")?.getBoundingClientRect().top,
      evidenceTop:dialog.querySelector("#systemCaseEvidenceSection")?.getBoundingClientRect().top,
      decisionCount:dialog.querySelectorAll("#systemCaseDecisionsSection .voucher-stage-decision-group").length,
      evidenceCount:dialog.querySelectorAll("#systemCaseEvidenceSection .structured-evidence-v223__group").length,
      realEvidence:[...dialog.querySelectorAll("#systemCaseEvidenceSection img")].filter(node=>node.dataset.assetStatus==="real-active").length,
      timelineVisible:[...dialog.querySelectorAll("#projectSignals *")].filter(visible).some(node=>node.textContent.trim()==="Timeline"),
      timelineValue:[...dialog.querySelectorAll("#projectSignals > div")].find(node=>node.querySelector("small")?.textContent.trim()==="Timeline")?.querySelector("strong")?.textContent.trim(),
      infoGridOwner:dialog.querySelector("#projectSignals")?.classList.contains("info-grid-v45"),
      text:dialog.innerText,
      overflowX:getComputedStyle(dialog.querySelector(".dialog-scroll")).overflowX
    };
  });
  const r172Order=["what-made-this-hard","my-contribution","core-system-insight","key-design-decisions","evidence-to-operating-model","outcomes","my-accountability"];
  if(r172Presentation.title!=="Rigid tablet script to a flexible mortgage consultation system"||r172Presentation.taxonomy.length||JSON.stringify(r172Presentation.navigator)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes","Ownership"])||JSON.stringify(r172Presentation.order.filter(id=>r172Order.includes(id)))!==JSON.stringify(r172Order)||!(r172Presentation.decisionTop<r172Presentation.evidenceTop)||r172Presentation.decisionCount!==3||r172Presentation.evidenceCount!==5||r172Presentation.realEvidence!==5)failures.push(`${viewport.name} R172.2 composition mismatch: ${JSON.stringify(r172Presentation)}`);
  if(!r172Presentation.timelineVisible||r172Presentation.timelineValue!=="4 months"||!r172Presentation.infoGridOwner)failures.push(`${viewport.name} R172.4 verified Timeline/shared Info Grid mismatch: ${JSON.stringify(r172Presentation)}`);
  if(/Timeline unresolved|duration unavailable|Timeline pending|year-only fallback|2016-only rendering rationale/i.test(r172Presentation.text))failures.push(`${viewport.name} R172.4 stale Timeline blocker leak`);
  if(/Critical Problem|Consultation Model|Business Impact|Ownership and Collaboration|Delivery and Measurement|Continue Exploring/.test(r172Presentation.text))failures.push(`${viewport.name} R172.2 legacy metadata leak`);
  if(/adoption %|conversion|sales uplift|revenue uplift|time reduction|error reduction|training reduction|compliance improvement|3 months|6 months|1 year/i.test(r172Presentation.text))failures.push(`${viewport.name} R172.2 unsupported claim leak`);
  if(!["hidden","clip"].includes(r172Presentation.overflowX))failures.push(`${viewport.name} R172.2 horizontal containment failed`);
  if(!r172Presentation.context.startsWith("Cathay Life Insurance")||!r172Presentation.context.includes("Internal mortgage consultation"))failures.push(`${viewport.name} R172.3 company metadata mismatch: ${r172Presentation.context}`);
  if(r172Presentation.atAGlance!=="Led UX redesign of a launched mortgage consultation tool, replacing a fixed tablet script with scenario-led guidance validated across four core tasks.")failures.push(`${viewport.name} R172.3 At a Glance mismatch`);
  const r172SharedContainment=await page.evaluate(()=>{
    const nav=document.querySelector("#projectSectionNav"),rail=nav.querySelector(".floating-navigator__rail"),root=document.querySelector("#detailDialog .dialog-scroll");
    const bodyWidth=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),navRect=nav.getBoundingClientRect();
    root.scrollTop=root.scrollHeight;
    const finalNode=document.querySelector("#programmeSurface > :last-child"),finalRect=finalNode?.getBoundingClientRect(),rootRect=root.getBoundingClientRect();
    return {bodyWidth,viewportWidth:innerWidth,navLeft:navRect.left,navRight:navRect.right,railClientWidth:rail.clientWidth,railScrollWidth:rail.scrollWidth,railOverflow:getComputedStyle(rail).overflowX,finalBottom:finalRect?.bottom,navTop:navRect.top,rootBottom:rootRect.bottom};
  });
  if(r172SharedContainment.bodyWidth>r172SharedContainment.viewportWidth||r172SharedContainment.navLeft<0||r172SharedContainment.navRight>r172SharedContainment.viewportWidth)failures.push(`${viewport.name} R172.3 shared navigator viewport overflow: ${JSON.stringify(r172SharedContainment)}`);
  if(viewport.width===430&&(r172SharedContainment.railOverflow!=="auto"||r172SharedContainment.railScrollWidth<=r172SharedContainment.railClientWidth))failures.push(`${viewport.name} R172.3 shared navigator is not internally scrollable`);
  if(r172SharedContainment.finalBottom>r172SharedContainment.navTop)failures.push(`${viewport.name} R172.3 dialog bottom safe area is insufficient: ${JSON.stringify(r172SharedContainment)}`);
  if([1419,871,430].includes(viewport.width)){
    const targetDir=path.join(outputRoot,"r1722-cathay-mortgage",viewport.name);fs.mkdirSync(targetDir,{recursive:true});
    const checkpoints=[["00-hero","#projectDetailHeroVisual","#projectOverviewSection"],["01-overview","#projectOverviewSection","#projectOverviewSection"],["02-complexity","#systemCaseComplexitySection","#systemCaseComplexitySection"],["03-decisions","#systemCaseDecisionsSection","#systemCaseDecisionsSection"],["04-evidence-research","#systemCaseEvidenceSection .structured-evidence-v223__group:nth-of-type(1)","#systemCaseEvidenceSection"],["05-evidence-structure","#systemCaseEvidenceSection .structured-evidence-v223__group:nth-of-type(2)","#systemCaseEvidenceSection"],["06-evidence-validation","#systemCaseEvidenceSection .structured-evidence-v223__group:nth-of-type(3)","#systemCaseEvidenceSection"],["07-evidence-delivery","#systemCaseEvidenceSection .structured-evidence-v223__group:nth-of-type(4)","#systemCaseEvidenceSection"],["08-evidence-market-map","#systemCaseEvidenceSection .structured-evidence-v223__group:nth-of-type(5)","#systemCaseEvidenceSection"],["09-outcomes","#systemCaseOutcomesSection","#systemCaseOutcomesSection"],["10-ownership","#systemCaseAccountabilitySection","#systemCaseAccountabilitySection"]];
    const scroll=page.locator("#detailDialog .dialog-scroll").first();
    for(const [name,selector,expectedHref] of checkpoints){
      const target=page.locator(selector).first();if(!await target.count()){failures.push(`${viewport.name} R172.2 checkpoint missing: ${name}`);continue}
      await scroll.evaluate((root,query)=>{const target=root.querySelector(query);if(target){const activation=Math.max(96,Math.min(160,root.clientHeight*.2));root.scrollTop=Math.max(0,root.scrollTop+target.getBoundingClientRect().top-root.getBoundingClientRect().top-activation+2)}},selector);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const activeHref=await page.locator("#projectSectionNav a[aria-current='location']").getAttribute("href");
      if(activeHref!==expectedHref)failures.push(`${viewport.name} R172.2 navigator drift at ${name}: expected ${expectedHref}, got ${activeHref}`);
      await page.screenshot({path:path.join(targetDir,`${name}.png`),fullPage:false});
    }
  }

  const r1723RegressionProjects=[
    ["payment","/site/work/payment"],
    ["booking-taxi-strategy","/site/work/booking-taxi-pickup-service-strategy"],
    ["taishin","/site/work/taishin-p2p-marketplace-platform"],
    ["cathay-oa","/site/work/cathay-sit-online-account-opening"],
    ["cathay-review","/site/work/cathay-sit-review-remediation-operations"],
    ["cathay-mortgage","/site/work/cathay-mortgage-assistant"]
  ];
  for(const [projectId,route] of r1723RegressionProjects){
    await page.goto(`${baseUrl}${route}`,{waitUntil:"networkidle"});
    const sharedGeometry=await page.evaluate(()=>{
      const root=document.querySelector("#detailDialog .dialog-scroll"),nav=document.querySelector("#projectSectionNav"),rail=nav?.querySelector(".floating-navigator__rail");
      if(!root||!nav||!rail)return null;
      const verifyNode=node=>{const rootRect=root.getBoundingClientRect(),nodeRect=node.getBoundingClientRect(),navTop=nav.getBoundingClientRect().top;if(nodeRect.top<rootRect.top)root.scrollTop+=nodeRect.top-rootRect.top;if(node.getBoundingClientRect().bottom>navTop)root.scrollTop+=node.getBoundingClientRect().bottom-navTop+1;return node.getBoundingClientRect().top>=rootRect.top-1&&node.getBoundingClientRect().bottom<=nav.getBoundingClientRect().top+1};
      const captions=[...document.querySelectorAll("#detailDialog figcaption")];
      const captionClearance=captions.map(verifyNode);
      root.scrollTop=root.scrollHeight;
      const finalNode=document.querySelector("#programmeSurface > :last-child"),navRect=nav.getBoundingClientRect();
      const active=rail.querySelector('a[aria-current="location"]'),railRect=rail.getBoundingClientRect(),activeRect=active?.getBoundingClientRect();
      return {bodyWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),viewportWidth:innerWidth,navLeft:navRect.left,navRight:navRect.right,finalBottom:finalNode?.getBoundingClientRect().bottom,navTop:navRect.top,captionClearance,activeFullyVisible:!activeRect||(activeRect.left>=railRect.left&&activeRect.right<=railRect.right),railOverflow:getComputedStyle(rail).overflowX};
    });
    if(!sharedGeometry)failures.push(`${viewport.name} R172.3 ${projectId} shared owners missing`);
    else if(sharedGeometry.bodyWidth>sharedGeometry.viewportWidth||sharedGeometry.navLeft<0||sharedGeometry.navRight>sharedGeometry.viewportWidth||sharedGeometry.finalBottom>sharedGeometry.navTop||sharedGeometry.captionClearance.some(value=>!value)||!sharedGeometry.activeFullyVisible)failures.push(`${viewport.name} R172.3 ${projectId} shared regression: ${JSON.stringify(sharedGeometry)}`);
  }

  const r181Ids=['freelance-project-operations-tool','weekly-design-session','food-testing-workshop','aja-creative-workshop','capture-ideas','aha-creative-toolbox','hello-sabau'];
  await page.goto(`${baseUrl}/site/experiments`,{waitUntil:'networkidle'});
  const r181Dir=path.join(outputRoot,'r181-experiments',viewport.name);fs.mkdirSync(r181Dir,{recursive:true});
  await page.screenshot({path:path.join(r181Dir,'00-listing.png'),fullPage:true});
  const listing=await page.evaluate(()=>({ids:[...document.querySelectorAll('#experimentPageRail [data-experiment]')].map(node=>node.dataset.experiment),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,cards:[...document.querySelectorAll('#experimentPageRail [data-experiment]')].map(node=>{const style=getComputedStyle(node);return{radius:style.borderRadius,display:style.display,transform:style.transform}})}));
  if(JSON.stringify(listing.ids)!==JSON.stringify(r181Ids)||listing.overflow>1||listing.cards.some(card=>card.display!=="grid"||card.transform!=="none"))failures.push(`${viewport.name} R182.1 listing/order/shared-shell mismatch: ${JSON.stringify(listing)}`);
  for(const [index,id] of r181Ids.entries()){
    await page.locator(`#experimentPageRail [data-experiment="${id}"]`).click();
    await page.waitForSelector('#detailDialog[open]');
    const result=await page.evaluate(()=>{
      const dialog=document.querySelector('#detailDialog'),scroll=dialog?.querySelector('.dialog-scroll');
      const visible=node=>Boolean(node&&!node.hidden&&getComputedStyle(node).display!=='none'&&node.getClientRects().length);
      const info=[...dialog.querySelectorAll('#detailInfoExperiment>div')].map(node=>({label:node.querySelector('small')?.textContent.trim(),value:node.querySelector('strong')?.textContent.trim()}));
      const proofOwner=dialog.querySelector('#experimentLearning')?.closest('article');
      return{classificationVisible:visible(dialog.querySelector('#detailClassification')),navigatorVisible:visible(dialog.querySelector('#projectSectionNav')),question:dialog.querySelector('#experimentQuestion')?.textContent.trim(),galleryCount:dialog.querySelectorAll('#galleryThumbs button').length,proof:dialog.querySelector('#experimentLearning')?.textContent.trim(),proofCanonical:proofOwner?.classList.contains('outcome-metric--qualitative'),info,topPeriod:dialog.querySelector('#detailPeriod')?.textContent.trim(),overflow:Math.max(0,(scroll?.scrollWidth||0)-(scroll?.clientWidth||0)),headings:[...dialog.querySelectorAll('h3')].filter(visible).map(node=>node.textContent.trim())};
    });
    if(result.classificationVisible||result.navigatorVisible||!result.question||result.galleryCount!==3||!result.proof||!result.proofCanonical||result.topPeriod||JSON.stringify(result.info.map(item=>item.label))!==JSON.stringify(['Role','Scale','Audience','Timeline'])||result.info.some(item=>!item.value)||result.overflow>1||!result.headings.includes('What This Proved'))failures.push(`${viewport.name} R182.1 ${id} compact contract mismatch: ${JSON.stringify(result)}`);
    await page.locator('#detailDialog .dialog-scroll').screenshot({path:path.join(r181Dir,`${String(index+1).padStart(2,'0')}-${id}.png`)});
    await page.locator('#detailClose').click();
    await page.waitForSelector('#detailDialog[open]', { state: 'hidden' });
  }

  if (consoleErrors.length) failures.push(`${viewport.name} console errors: ${consoleErrors.length}`);
  if (runtimeErrors.length) failures.push(`${viewport.name} runtime errors: ${runtimeErrors.length}`);
  if (networkErrors.length) failures.push(`${viewport.name} network errors: ${networkErrors.length}`);
  await context.close();
}
await browser.close();

report.failures = failures;
report.engineeringQa = failures.length ? "FAIL" : "PASS";
report.humanVisualQa = "REQUIRED";
fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(path.join(outputRoot, "browser-qa.json"), `${JSON.stringify(report, null, 2)}\n`);
if (failures.length) throw new Error(failures.join("\n"));
console.log("R163.1 CTBC READING EDGES", JSON.stringify(Object.fromEntries(Object.entries(report.viewports).filter(([name])=>["desktop-1419","tablet-871","mobile-430"].includes(name)).map(([name,value])=>[name,value.ctbcReadingEdges]))));
console.log("ENGINEERING QA PASS");
console.log("Human visual review remains required.");
