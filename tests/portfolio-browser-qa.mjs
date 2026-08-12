import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const outputRoot = process.env.EVIDENCE_DIR || "/tmp/portfolio-engineering-qa";
const viewports = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1419", width: 1419, height: 900 },
  { name: "tablet-871", width: 871, height: 1024 },
  { name: "mobile-430", width: 430, height: 932 },
];
const routes = ["/site/", "/site/work", "/site/work/voucher", "/site/work/booking-taxi-pickup-service-strategy", "/site/work/cathay-sit-online-account-opening", "/site/work/cathay-sit-review-remediation-operations"];
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
  page.on("requestfailed", request => networkErrors.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ""}`));

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

  const navigator=page.locator("#projectSectionNav");
  await navigator.waitFor({state:"visible"});
  const navigatorContract=await navigator.evaluate(node=>({
    floating:node.classList.contains("floating-navigator"),
    toggleVisible:node.querySelector("#projectSectionNavToggle") ? !node.querySelector("#projectSectionNavToggle").hidden : false,
    labels:[...node.querySelectorAll("a")].map(link=>link.textContent.trim()),
  }));
  if(!navigatorContract.floating)failures.push(`${viewport.name} Project navigator is not the shared FloatingNavigator`);
  if(navigatorContract.toggleVisible)failures.push(`${viewport.name} legacy Project navigator disclosure remains visible`);
  if(JSON.stringify(navigatorContract.labels)!==JSON.stringify(["Overview","Complexity","Decisions","Impact"]))failures.push(`${viewport.name} Project navigator labels mismatch: ${JSON.stringify(navigatorContract.labels)}`);
  const navigatorInteractions={clicks:[],repeated:false,keyboard:false,manualScroll:false,touch:viewport.width<=430?false:null};
  for(const label of ["Overview","Complexity","Decisions","Impact"]){
    const link=navigator.getByRole("link",{name:label,exact:true});
    await link.click();
    await page.waitForTimeout(950);
    const current=await link.getAttribute("aria-current");
    navigatorInteractions.clicks.push({label,current});
    if(current!=="location")failures.push(`${viewport.name} navigator ${label} click did not own active state`);
  }
  const impactLink=navigator.getByRole("link",{name:"Impact",exact:true});
  await impactLink.click();await impactLink.click();await page.waitForTimeout(950);
  navigatorInteractions.repeated=(await impactLink.getAttribute("aria-current"))==="location";
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
    ["parent-reusable-system", "[data-canonical-section-id='reusable-system']"],
    ["stage-discover", "[data-stage-card='discover']"],
    ["stage-qualify", "[data-stage-card='qualify']"],
    ["stage-activate", "[data-stage-card='activate']"],
    ["stage-redeem", "[data-stage-card='redeem']"],
    ["stage-review", "[data-stage-card='review']"],
  ]) await capture(name, selector);
  if (["desktop-1419", "tablet-871", "mobile-430"].includes(viewport.name)) {
    await captureCloudEdges("parent-core-system-insight-cloud", ".core-system-insight-section.case-study-cloud-emphasis");
  }

  const firstTooltip = page.locator("#voucherImpactSection").first().locator(".info-tooltip__trigger").first();
  const tooltipState = { count: await page.locator(".info-tooltip__trigger").count() };
  if (await firstTooltip.count()) {
    await firstTooltip.click({force:true});
    tooltipState.outcomeClickOpen = await firstTooltip.getAttribute("aria-expanded");
    if (tooltipState.outcomeClickOpen !== "true") failures.push(`${viewport.name} Outcome tooltip did not open`);
    await firstTooltip.click({force:true});
    tooltipState.outcomeSecondClickClosed = await firstTooltip.getAttribute("aria-expanded");
    if (tooltipState.outcomeSecondClickClosed !== "false") failures.push(`${viewport.name} Outcome tooltip did not toggle closed for touch/pointer`);
    await firstTooltip.click({force:true});
    await firstTooltip.press("Escape");
    tooltipState.outcomeEscapeClosed = await firstTooltip.getAttribute("aria-expanded");
    if (tooltipState.outcomeEscapeClosed !== "false") failures.push(`${viewport.name} Outcome tooltip did not close with Escape`);
  }
  r156.initialFocus = initialFocus;
  r156.tooltipState = tooltipState;
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
  const tooltipTriggers=page.locator("#voucherImpactSection").first().locator(".info-tooltip__trigger");
  const tooltipIndexes=[0,Math.floor((await tooltipTriggers.count())/2),(await tooltipTriggers.count())-1];
  for(const [label,index] of [["left",tooltipIndexes[0]],["centre",tooltipIndexes[1]],["right",tooltipIndexes[2]]]){
    const trigger=tooltipTriggers.nth(index);await trigger.evaluate(node=>node.scrollIntoView({block:"center",inline:"nearest",behavior:"auto"}));await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const closed=await trigger.evaluate(node=>node.closest(".inline-tooltip-tail")?.getBoundingClientRect().height||node.parentElement.getBoundingClientRect().height);const panelId=await trigger.getAttribute("aria-controls");if(!panelId)throw new Error(`${viewport.name} tooltip ${label} missing aria-controls`);const panel=page.locator(`#${panelId}`);await trigger.click({force:true});await panel.waitFor({state:"visible"});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
    const measurement=await panel.evaluate((node)=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight,contained:r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,whiteSpace:getComputedStyle(node).whiteSpace}},null);const openHeight=await trigger.evaluate(node=>node.closest(".inline-tooltip-tail")?.getBoundingClientRect().height||node.parentElement.getBoundingClientRect().height);measurement.lineBoxDelta=Math.abs(openHeight-closed);measurement.label=label;r158.tooltips.push(measurement);if(!measurement.contained)failures.push(`${viewport.name} tooltip ${label} not viewport-contained`);if(measurement.lineBoxDelta>0.5)failures.push(`${viewport.name} tooltip ${label} line-box delta ${measurement.lineBoxDelta}`);await page.screenshot({path:path.join(targetedDirectory,`tooltip-${label}.png`)});await trigger.evaluate(node=>node.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true})));await panel.waitFor({state:"hidden"});if(await trigger.getAttribute("aria-expanded")!=="false")failures.push(`${viewport.name} tooltip ${label} did not close with Escape`);
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
    const backLabel=await back.getAttribute("aria-label");
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
        const decisions = page.locator(".voucher-r149-decision, .decision-card-v46");
        if (await decisions.count() >= 2) {
          await scrollDialogTarget(decisions.nth(0));
          const evidenceImage=decisions.nth(0).locator('img').first();
          if(await evidenceImage.count()){
            await evidenceImage.evaluate(image=>{image.loading="eager";if(image.complete)return true;return new Promise(resolve=>{image.addEventListener('load',()=>resolve(true),{once:true});image.addEventListener('error',()=>resolve(false),{once:true})})});
            const imageState=await evidenceImage.evaluate(image=>({complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,src:image.currentSrc||image.src}));
            if(!imageState.complete||!imageState.naturalWidth)failures.push(`${viewport.name} Discover PDP evidence failed to load: ${JSON.stringify(imageState)}`);
          }else failures.push(`${viewport.name} Discover PDP evidence image missing`);
          await decisions.nth(0).screenshot({ path: path.join(targetedDirectory, "discover-decision-01.png") });
          await capture("discover-pdp-evidence", ".voucher-r149-decision .evidence-frame");
          await scrollDialogTarget(decisions.nth(1));
          await decisions.nth(1).screenshot({ path: path.join(targetedDirectory, "discover-decision-02.png") });
        } else failures.push(`${viewport.name} Discover decision captures missing`);
      }
    }
    for (const [name, route, text] of [
      ["booking-core-insight", "/site/work/booking-taxi-pickup-service-strategy", "The airport transfer journey became easier to trust"],
      ["cathay-oa-core-insight", "/site/work/cathay-sit-online-account-opening", "Self-service account opening only worked"],
      ["cathay-review-core-insight", "/site/work/cathay-sit-review-remediation-operations", "Review remediation needed a shared internal operating model"],
      ["dbs-regression", "/site/work/dbs", "From fragmented exception handling"],
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
