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
const routes = ["/site/", "/site/work", "/site/work/booking", "/site/work/voucher", "/site/work/booking-taxi-pickup-service-strategy", "/site/work/cathay-sit-online-account-opening", "/site/work/cathay-sit-review-remediation-operations"];
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
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      bodyWidth: document.body.getBoundingClientRect().width,
      title: document.title,
    }));
    if (!response?.ok()) failures.push(`${viewport.name} ${route} HTTP ${response?.status()}`);
    if (metrics.horizontalOverflow) failures.push(`${viewport.name} ${route} horizontal overflow`);
    await page.screenshot({ path: path.join(directory, `${index + 1}-${route.replace(/[^a-z0-9]+/gi, "-")}.png`), fullPage: true });
    routeResults.push({ route, status: response?.status(), metrics });
  }

  await page.goto(`${baseUrl}/site/work/booking`,{waitUntil:"networkidle"});
  const bookingCertification=await page.evaluate(async()=>{const dialog=document.querySelector("#detailDialog"),visibleHeadings=[...dialog.querySelectorAll("h2,h3")].filter(node=>{const style=getComputedStyle(node);return style.display!=="none"&&style.visibility!=="hidden"&&node.getClientRects().length}).map(node=>node.textContent.trim()),images=[...dialog.querySelectorAll("img")].filter(image=>image.alt);await Promise.all(images.map(image=>{image.loading="eager";if(image.complete)return true;return new Promise(resolve=>{image.addEventListener("load",()=>resolve(true),{once:true});image.addEventListener("error",()=>resolve(false),{once:true})})}));const required=["Connecting the global taxi-booking journey","At a glance","What made this hard","Contribution","The booking journey became clearer when known trip context and market-specific pickup guidance worked as one system.","Design decisions","Evidence that shaped the decisions","Outcomes","My accountability","Related work"],legacy=["Why It Mattered","Business Impact","Research Strategy","Delivery and Measurement","Status and Disclosure"],outcomes=[...dialog.querySelectorAll(".outcome-metric")].map(card=>({value:card.querySelector(".outcome-metric__value")?.textContent.trim(),label:(()=>{const node=card.querySelector(".outcome-metric__label")?.cloneNode(true);node?.querySelectorAll(".info-tooltip").forEach(tip=>tip.remove());return node?.textContent.trim()})()})),navigator=[...dialog.querySelectorAll("#projectSectionNav a")].map(node=>node.textContent.trim()),publicText=dialog.innerText,decisionFields=[...dialog.querySelectorAll("#systemCaseDecisionsSection .decision-card-v46")].map(card=>[...card.querySelectorAll(".decision-field-label-v58,dt")].map(label=>({label:label.textContent.trim(),copy:((label.tagName==="DT"?label.parentElement?.querySelector("dd"):label.nextElementSibling)?.textContent||"").trim()}))),flow=dialog.querySelector(".contribution-block .voucher-r149-flow"),flowNodes=[...dialog.querySelectorAll(".contribution-block .voucher-r149-flow article")],flowSupport=dialog.querySelector(".contribution-block>.voucher-r149-intro"),insight=dialog.querySelector(".core-system-insight-section"),insightTitle=dialog.querySelector(".core-system-insight-section h2"),insightVisual=dialog.querySelector(".core-system-insight-section .voucher-r149-foundation"),insightCaption=dialog.querySelector(".core-system-insight-section .voucher-r149-foundation__caption"),complexity=[...dialog.querySelectorAll(".recruiter-complexity-grid--featured-first>.recruiter-complexity-card")];const rect=node=>{const r=node?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,center:r.left+r.width/2}:null},titleStyle=insightTitle?getComputedStyle(insightTitle):null;return{requiredOrder:required.map(text=>visibleHeadings.indexOf(text)),legacy:visibleHeadings.filter(text=>legacy.includes(text)),outcomes,navigator,publicText,decisionFields,evidenceImages:images.filter(image=>image.currentSrc.includes("/booking/")).map(image=>({src:image.currentSrc,complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight})),overflow:dialog.scrollWidth-dialog.clientWidth,contribution:{count:visibleHeadings.filter(text=>text==="Contribution").length,flow:rect(flow),nodes:flowNodes.map(rect),support:rect(flowSupport)},insight:{section:rect(insight),title:rect(insightTitle),titleLines:insightTitle&&titleStyle?Math.round(insightTitle.getBoundingClientRect().height/parseFloat(titleStyle.lineHeight)):null,visual:rect(insightVisual),captionAlign:insightCaption?getComputedStyle(insightCaption).textAlign:null},complexity:complexity.map(rect),complexityColumns:dialog.querySelector(".recruiter-complexity-grid--featured-first")?getComputedStyle(dialog.querySelector(".recruiter-complexity-grid--featured-first")).gridTemplateColumns:null}});
  if(bookingCertification.requiredOrder.some(index=>index<0)||bookingCertification.requiredOrder.some((index,position,array)=>position&&index<=array[position-1]))failures.push(`${viewport.name} Booking architecture order failed: ${JSON.stringify(bookingCertification.requiredOrder)}`);
  if(bookingCertification.legacy.length)failures.push(`${viewport.name} Booking legacy standalone sections visible: ${JSON.stringify(bookingCertification.legacy)}`);
  if(JSON.stringify(bookingCertification.outcomes)!==JSON.stringify([{value:"+~7%",label:"desktop conversion rate"},{value:"+~3%",label:"mobile conversion rate"},{value:"+~10%",label:"tablet conversion rate"},{value:"~150",label:"additional rides per day after launch"}]))failures.push(`${viewport.name} Booking outcomes mismatch: ${JSON.stringify(bookingCertification.outcomes)}`);
  if(/\b2-step\b|\b3-step\b|943,818|65\.48%/.test(bookingCertification.publicText))failures.push(`${viewport.name} Booking confidential/internal public text regression`);
  if(!bookingCertification.publicText.includes("6 of 7 analysed markets improved")||!bookingCertification.publicText.includes("Spain was the only analysed market to decline")||!bookingCertification.publicText.includes("40+ countries"))failures.push(`${viewport.name} Booking recruiter-first supporting outcome story missing`);
  if(JSON.stringify(bookingCertification.navigator)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes"]))failures.push(`${viewport.name} Booking navigator mismatch: ${JSON.stringify(bookingCertification.navigator)}`);
  if(bookingCertification.evidenceImages.length!==8||bookingCertification.evidenceImages.some(image=>!image.complete||image.naturalWidth!==1600||image.naturalHeight!==900)||!bookingCertification.evidenceImages.some(image=>image.src.includes("ride-mix-public-01.svg"))||bookingCertification.evidenceImages.some(image=>image.src.includes("outcomes-cross-market")||image.src.includes("outcomes-post-launch")))failures.push(`${viewport.name} Booking evidence readiness/confidentiality failed: ${JSON.stringify(bookingCertification.evidenceImages)}`);
  if(bookingCertification.decisionFields.length!==3||bookingCertification.decisionFields.some(fields=>!fields.some(x=>x.label==="WHAT I DECIDED"&&x.copy)||!fields.some(x=>x.label==="WHY THIS CHOICE"&&x.copy)||!fields.some(x=>["TRADE-OFF ACCEPTED","WHAT THIS REQUIRED"].includes(x.label)&&x.copy)||!fields.some(x=>x.label==="OUTCOME"&&x.copy)))failures.push(`${viewport.name} Booking decision field completeness failed: ${JSON.stringify(bookingCertification.decisionFields)}`);
  if(bookingCertification.contribution.count!==1||!bookingCertification.contribution.flow||bookingCertification.contribution.nodes.length!==3||Math.abs(bookingCertification.contribution.nodes[1].center-bookingCertification.contribution.flow.center)>.75||Math.abs(bookingCertification.contribution.support.left-bookingCertification.contribution.flow.left)>.75)failures.push(`${viewport.name} Booking contribution alignment failed: ${JSON.stringify(bookingCertification.contribution)}`);
  if(viewport.width===1419&&(bookingCertification.insight.titleLines>4||bookingCertification.insight.title.width<700))failures.push(`${viewport.name} Booking Core System Insight headline width failed: ${JSON.stringify(bookingCertification.insight)}`);
  if(!bookingCertification.insight.visual||Math.abs(bookingCertification.insight.visual.center-bookingCertification.insight.section.center)>1||bookingCertification.insight.captionAlign!=="center")failures.push(`${viewport.name} Booking Core System Insight visual centring failed: ${JSON.stringify(bookingCertification.insight)}`);
  if(viewport.width>600&&Math.abs(bookingCertification.complexity[1].height-bookingCertification.complexity[2].height)>.75)failures.push(`${viewport.name} Booking complexity equal-height failed: ${JSON.stringify(bookingCertification.complexity)}`);
  if(viewport.width<=600&&bookingCertification.complexityColumns.split(" ").length!==1)failures.push(`${viewport.name} Booking complexity mobile stacking failed: ${bookingCertification.complexityColumns}`);
  if(bookingCertification.overflow>0)failures.push(`${viewport.name} Booking dialog horizontal overflow: ${bookingCertification.overflow}`);

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
  const projectCardGeometry=await page.evaluate(()=>["dbs","voucher","payment"].map(projectId=>{const card=document.querySelector(`[data-project="${projectId}"]`)?.closest(".work-card-v32"),frame=card?.querySelector("[data-frame-role='project-cover']"),image=frame?.querySelector("img"),title=card?.querySelector("h2"),company=card?.querySelector(".related-project-card__company-v135"),summary=card?.querySelector(".work-card-v32__content>p"),rect=frame?.getBoundingClientRect();return{projectId,frameWidth:rect?.width,frameHeight:rect?.height,frameRatio:rect?.width/rect?.height,naturalRatio:image?.naturalWidth/image?.naturalHeight,mediaAspect:frame?.dataset.mediaAspect,mediaFormat:frame?.dataset.mediaFormat,objectPosition:image?getComputedStyle(image).objectPosition:null,companyColor:company?getComputedStyle(company).color:null,neutralReference:summary?getComputedStyle(summary).color:null,companyTitleGap:title?parseFloat(getComputedStyle(title).marginTop):null,objectFit:image?getComputedStyle(image).objectFit:null,overflow:frame?getComputedStyle(frame).overflow:null}}));
  const dbs=projectCardGeometry.find(x=>x.projectId==="dbs"),voucherCard=projectCardGeometry.find(x=>x.projectId==="voucher");
  const compactPanoramic=viewport.width<=560;
  assert(Math.abs(dbs.frameRatio-(compactPanoramic?5/3:20/9))<.02,"DBS ProjectCard responsive ratio failed");
  for(const x of [dbs,voucherCard]){assert(x.mediaFormat==="panoramic",`${x.projectId} panoramic classification failed`);assert(x.objectFit===(compactPanoramic?"cover":"contain"),`${x.projectId} responsive fit failed`)}
  if(!compactPanoramic)projectCardGeometry.filter(x=>x.projectId!=="payment"&&x.naturalRatio).forEach(x=>assert(Math.abs(x.frameRatio-x.naturalRatio)<.02,`${x.projectId} frame ratio mismatch`));
  const payment=projectCardGeometry.find(x=>x.projectId==="payment");assert(Math.abs(payment.frameRatio-16/10)<.02&&payment.mediaAspect==="16 / 10"&&payment.mediaFormat==="standard"&&payment.objectFit==="contain","Placeholder ProjectCard semantic ratio failed");
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
  if(JSON.stringify(navigatorContract.labels)!==JSON.stringify(["Overview","Complexity","Decisions","Evidence","Outcomes"]))failures.push(`${viewport.name} Project navigator labels mismatch: ${JSON.stringify(navigatorContract.labels)}`);
  const navigatorInteractions={clicks:[],repeated:false,keyboard:false,manualScroll:false,touch:viewport.width<=430?false:null};
  for(const label of ["Overview","Complexity","Decisions","Evidence","Outcomes"]){
    const link=navigator.getByRole("link",{name:label,exact:true});
    await link.click();
    await page.waitForTimeout(950);
    const current=await link.getAttribute("aria-current");
    navigatorInteractions.clicks.push({label,current});
    if(current!=="location")failures.push(`${viewport.name} navigator ${label} click did not own active state`);
  }
  const outcomesLink=navigator.getByRole("link",{name:"Outcomes",exact:true});
  await outcomesLink.click();await outcomesLink.click();await page.waitForTimeout(950);
  navigatorInteractions.repeated=(await outcomesLink.getAttribute("aria-current"))==="location";
  if(!navigatorInteractions.repeated)failures.push(`${viewport.name} repeated navigator click left stale state`);
  const overviewLink=navigator.getByRole("link",{name:"Overview",exact:true});
  await overviewLink.focus();await overviewLink.press("Enter");await page.waitForTimeout(950);
  navigatorInteractions.keyboard=(await overviewLink.getAttribute("aria-current"))==="location" && !(await page.locator("#projectOverviewSection").evaluate(node=>node===document.activeElement));
  if(!navigatorInteractions.keyboard)failures.push(`${viewport.name} keyboard navigator activation or focus ownership failed`);
  const scrollRootForNav=page.locator(".dialog-scroll").first();
  await scrollRootForNav.hover();
  await page.mouse.wheel(0,700);
  await page.waitForTimeout(150);
  navigatorInteractions.manualScroll=await navigator.locator('a[aria-current="location"]').count()===1;
  if(!navigatorInteractions.manualScroll)failures.push(`${viewport.name} manual wheel did not restore one scroll-spy owner`);
  if(viewport.width<=430){
    const decisionsLink=navigator.getByRole("link",{name:"Decisions",exact:true});
    const box=await decisionsLink.boundingBox();
    if(box){await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(950);navigatorInteractions.touch=(await decisionsLink.getAttribute("aria-current"))==="location";}
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
      ["booking-core-insight", "/site/work/booking-taxi-pickup-service-strategy", "The airport transfer journey became easier to trust"],
      ["cathay-oa-core-insight", "/site/work/cathay-sit-online-account-opening", "Self-service account opening only worked"],
      ["cathay-review-core-insight", "/site/work/cathay-sit-review-remediation-operations", "Review remediation needed a shared internal operating model"],
      ["dbs-regression", "/site/work/dbs", "Turning fragmented credit-exception handling"],
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

  await page.goto(`${baseUrl}/site/work`,{waitUntil:"networkidle"});
  const projectCardVisual=await page.locator(".work-card-v32__top").evaluateAll(nodes=>nodes.slice(0,5).map(top=>{const root=top.closest(".work-card-v32"),metadata=top.firstElementChild||top,title=root?.querySelector("h2"),context=metadata.querySelector(".company-context-v132"),cs=getComputedStyle(metadata),tr=title?.getBoundingClientRect(),cr=top.getBoundingClientRect();return {company:metadata.textContent.trim(),color:cs.color,neutral:(()=>{const probe=document.createElement("span");probe.style.color="var(--color-text-secondary)";document.body.append(probe);const color=getComputedStyle(probe).color;probe.remove();return color})(),titleGap:tr?tr.top-cr.bottom:null,separator:context?getComputedStyle(context,"::before").marginInline:null}}));
  if(projectCardVisual.length<3||projectCardVisual.some(x=>x.color!==x.neutral||x.titleGap===null||Math.abs(x.titleGap-24)>.5))failures.push(`${viewport.name} ProjectCard rendered company hierarchy failed: ${JSON.stringify(projectCardVisual)}`);
  await page.screenshot({path:path.join(targetedDirectory,"r1593-project-cards.png"),fullPage:false});
  await page.goto(`${baseUrl}/`,{waitUntil:"networkidle"});
  await page.locator("#domains").scrollIntoViewIfNeeded();
  await page.waitForTimeout(180);
  const domainShared=await page.locator(".related-project-card-v45--media-stack").evaluateAll(cards=>cards.slice(0,3).map(card=>{const media=card.querySelector(".related-project-card__visual-v45"),content=card.querySelector(".related-project-card__content-v1612"),company=card.querySelector(".related-project-card__top-v45"),title=card.querySelector(".related-project-card__title"),cr=card.getBoundingClientRect(),mr=media?.getBoundingClientRect(),xr=content?.getBoundingClientRect(),br=company?.getBoundingClientRect(),tr=title?.getBoundingClientRect();return{insetLeft:mr?mr.left-(cr.left+parseFloat(getComputedStyle(card).borderLeftWidth)):null,insetRight:mr?(cr.right-parseFloat(getComputedStyle(card).borderRightWidth))-mr.right:null,overlap:mr&&xr?Math.max(0,mr.bottom-xr.top):null,titleGap:br&&tr?tr.top-br.bottom:null,contentPadding:xr?getComputedStyle(content).paddingInline:null}}));
  if(domainShared.length<2||domainShared.some(x=>x.insetLeft===null||Math.abs(x.insetLeft)>.5||Math.abs(x.insetRight)>.5||x.overlap!==0||Math.abs(x.titleGap-24)>.5))failures.push(`${viewport.name} Domain ProjectCard media-stack geometry failed: ${JSON.stringify(domainShared)}`);
  const domainState=await page.evaluate(()=>({rail:[...document.querySelectorAll(".domain-tab")].map(x=>x.getAttribute("aria-selected")),floating:[...document.querySelectorAll("[data-domain-floating]")].map(x=>x.getAttribute("aria-pressed")),classes:[...document.querySelectorAll("[data-domain-floating]")].map(x=>x.classList.contains("floating-navigator__item"))}));
  if(domainState.classes.some(x=>!x))failures.push(`${viewport.name} Domain floating item canonical class missing: ${JSON.stringify(domainState)}`);
  await page.goto(`${baseUrl}/site/work/voucher`,{waitUntil:"networkidle"});
  const headerMetadata=await page.locator(".modal-head-meta-v60").evaluate(node=>{const company=node.querySelector(".company-name-v132"),separator=node.querySelector(".company-separator-v159"),context=node.querySelector(".company-context-v132"),rect=n=>{const r=n?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom}:null},cs=getComputedStyle(node),ss=separator?getComputedStyle(separator):null;const cr=rect(company),sr=rect(separator),xr=rect(context);return {company:company?.textContent.trim(),separator:separator?.textContent.trim(),context:context?.textContent.trim(),gap:cs.columnGap,padding:[company,separator,context].map(n=>n?getComputedStyle(n).padding:null),margins:[company,separator,context].map(n=>n?getComputedStyle(n).margin:null),pseudoContent:context?getComputedStyle(context,"::before").content:null,companyToSeparator:cr&&sr?sr.left-cr.right:null,separatorToContext:sr&&xr?xr.left-sr.right:null}});
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
  };
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
console.log("ENGINEERING QA PASS");
console.log("Human visual review remains required.");
