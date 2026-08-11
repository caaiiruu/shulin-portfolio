import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const outputRoot = process.env.EVIDENCE_DIR || "/tmp/portfolio-engineering-qa";
const evidenceDir = path.join(outputRoot, "r1582-isolated");
fs.mkdirSync(evidenceDir, { recursive: true });

const failures = [];
const report = { baseUrl, gateA: {}, gateB: {}, gateC: { desktop1419: {}, mobile430: {} }, errors: [] };
const browser = await chromium.launch({ headless: true });
const parentUrl = `${baseUrl}/site/work/voucher`;
const stages = ["discover", "qualify", "activate", "redeem", "review"];

const twoFrames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const box = r => r && ({ x: r.x, y: r.y, width: r.width, height: r.height, right: r.x + r.width, bottom: r.y + r.height });

async function isolated(name, viewport, task) {
  const context = await browser.newContext({
    viewport,
    hasTouch: viewport.width <= 430,
    isMobile: viewport.width <= 430,
  });
  const page = await context.newPage();
  const errors = { console: [], runtime: [], network: [] };
  page.on("console", message => { if (message.type() === "error") errors.console.push(message.text()); });
  page.on("pageerror", error => errors.runtime.push(error.message));
  page.on("requestfailed", request => errors.network.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ""}`));
  try {
    const value = await task(page, path.join(evidenceDir, name));
    report.errors.push({ case: name, ...errors });
    if (errors.console.length || errors.runtime.length || errors.network.length) failures.push(`${name}: console/runtime/network ${errors.console.length}/${errors.runtime.length}/${errors.network.length}`);
    return value;
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    return { pass: false, error: error.message };
  } finally {
    await context.close();
  }
}

async function openParent(page) {
  const response = await page.goto(parentUrl, { waitUntil: "networkidle" });
  if (!response?.ok()) throw new Error(`parent HTTP ${response?.status()}`);
  await page.locator("#voucherImpactSection").waitFor({ state: "visible" });
}

async function stableTarget(page, locator) {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate(node => node.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" }));
  await twoFrames(page);
  const rect = box(await locator.boundingBox());
  if (!rect || rect.width < 1 || rect.height < 1) throw new Error("target has zero box");
  const visible = await locator.evaluate(node => {
    const r = node.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2)));
    return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight && !!hit && (hit === node || node.contains(hit) || hit.contains(node));
  });
  if (!visible) throw new Error(`target not interactable: ${JSON.stringify(rect)}`);
  return rect;
}

async function tooltipCase(label, index, viewport = { width: 1419, height: 900 }) {
  return isolated(`tooltip-${label}`, viewport, async (page, shot) => {
    await openParent(page);
    const triggers = page.locator("#voucherImpactSection .outcome-metric .info-tooltip__trigger");
    const count = await triggers.count();
    if (!count) throw new Error("canonical Outcome tooltip triggers missing");
    const resolvedIndex = index === "last" ? count - 1 : index === "middle" ? Math.floor(count / 2) : index;
    const trigger = triggers.nth(resolvedIndex);
    const triggerBox = await stableTarget(page, trigger);
    const panelId = await trigger.getAttribute("aria-controls");
    if (!panelId) throw new Error("aria-controls missing");
    const panel = page.locator(`#${panelId}`);
    if (viewport.width <= 430) await trigger.tap(); else await trigger.click();
    await panel.waitFor({ state: "visible" });
    await twoFrames(page);
    const measurement = await panel.evaluate(node => {
      const r = node.getBoundingClientRect();
      const cs = getComputedStyle(node);
      return {
        rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
        viewport: { width: innerWidth, height: innerHeight },
        contained: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight,
        wrapped: r.height > parseFloat(cs.lineHeight || "0") * 1.5,
        maxWidth: cs.maxWidth,
        whiteSpace: cs.whiteSpace,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        padding: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft],
      };
    });
    await page.screenshot({ path: `${shot}.png` });
    let outsideClose = null;
    if (viewport.width <= 430) {
      await page.mouse.click(4, 4);
      await panel.waitFor({ state: "hidden" });
      outsideClose = (await trigger.getAttribute("aria-expanded")) === "false";
    }
    const pass = measurement.contained && measurement.wrapped && measurement.overflowX <= 0 && (outsideClose ?? true);
    if (!pass) failures.push(`tooltip-${label}: ${JSON.stringify(measurement)} outsideClose=${outsideClose}`);
    return { triggerBox, ...measurement, outsideClose, pass };
  });
}

report.gateA.lineBox = await isolated("tooltip-line-box", { width: 1419, height: 900 }, async (page, shot) => {
  await openParent(page);
  const trigger = page.locator("#voucherImpactSection .outcome-metric .info-tooltip__trigger").first();
  await stableTarget(page, trigger);
  const measurement = await trigger.evaluate(node => {
    const icon = node.querySelector("svg") || node;
    const wrapper = node.closest(".inline-tooltip-tail") || node.parentElement;
    const textContainer = wrapper.parentElement;
    const n = node.getBoundingClientRect(), i = icon.getBoundingClientRect(), w = wrapper.getBoundingClientRect(), t = textContainer.getBoundingClientRect();
    const cs = getComputedStyle(textContainer), ns = getComputedStyle(node), ws = getComputedStyle(wrapper);
    const range = document.createRange(); range.selectNodeContents(textContainer);
    const lineRects = [...range.getClientRects()].filter(r => r.width > 0 && r.height > 0);
    const lineHeight = parseFloat(cs.lineHeight);
    const maxLineHeight = Math.max(...lineRects.map(r => r.height));
    return {
      textComputedLineHeight: lineHeight,
      textContainerHeight: t.height,
      triggerFlowHeight: w.height,
      triggerVisualHeight: n.height,
      iconVisualHeight: i.height,
      maxMeasuredLineHeight: maxLineHeight,
      extraLineBoxSpace: Math.max(0, maxLineHeight - lineHeight),
      verticalAlign: ns.verticalAlign,
      wrapperVerticalAlign: ws.verticalAlign,
      hitArea: { width: n.width, height: n.height },
    };
  });
  await trigger.locator("xpath=ancestor::*[contains(@class,'outcome-metric')][1]").screenshot({ path: `${shot}.png` });
  const pass = measurement.extraLineBoxSpace <= 0.5 && measurement.triggerFlowHeight <= measurement.textComputedLineHeight + 0.5 && measurement.hitArea.width >= 24 && measurement.hitArea.height >= 24;
  if (!pass) failures.push(`tooltip-line-box: ${JSON.stringify(measurement)}`);
  return { ...measurement, pass };
});
report.gateA.left = await tooltipCase("left", 0);
report.gateA.centre = await tooltipCase("centre", "middle");
report.gateA.right = await tooltipCase("right", "last");
report.gateA.longContent = await isolated("tooltip-long", { width: 1419, height: 900 }, async (page, shot) => {
  await openParent(page);
  const triggers = page.locator("#voucherImpactSection .outcome-metric .info-tooltip__trigger");
  const count = await triggers.count();
  let longest = 0, longestLength = -1;
  for (let i = 0; i < count; i++) {
    const id = await triggers.nth(i).getAttribute("aria-controls");
    const length = id ? await page.locator(`#${id}`).textContent().then(x => (x || "").trim().length) : -1;
    if (length > longestLength) { longest = i; longestLength = length; }
  }
  const trigger = triggers.nth(longest); await stableTarget(page, trigger);
  const id = await trigger.getAttribute("aria-controls"), panel = page.locator(`#${id}`);
  await trigger.click(); await panel.waitFor({ state: "visible" }); await twoFrames(page);
  const m = await panel.evaluate(node => { const r=node.getBoundingClientRect(),cs=getComputedStyle(node); return { textLength:(node.textContent||"").trim().length, rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}, contained:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight, wrapped:r.height>parseFloat(cs.lineHeight)*1.5, maxWidth:cs.maxWidth, overflowX:document.documentElement.scrollWidth-document.documentElement.clientWidth, padding:[cs.paddingTop,cs.paddingRight,cs.paddingBottom,cs.paddingLeft] }; });
  await page.screenshot({ path: `${shot}.png` });
  const pass=m.contained&&m.wrapped&&m.overflowX<=0; if(!pass)failures.push(`tooltip-long: ${JSON.stringify(m)}`); return {...m,pass};
});
report.gateA.mobile = await tooltipCase("mobile", 0, { width: 430, height: 932 });

report.gateB = await isolated("discover-pdp-evidence", { width: 1419, height: 900 }, async (page, shot) => {
  const response = await page.goto(`${parentUrl}?case=voucher&stage=discover`, { waitUntil: "networkidle" });
  if (!response?.ok()) throw new Error(`Discover HTTP ${response?.status()}`);
  await page.locator(".voucher-stage-hero").waitFor({ state: "visible" });
  const decision = page.locator(".voucher-r149-decision, .decision-card-v46").first();
  await decision.waitFor({ state: "visible" });
  const frame = decision.locator(".evidence-frame").first(), image = frame.locator("img").first();
  await image.waitFor({ state: "attached" });
  await image.evaluate(img => { img.loading = "eager"; return img.complete ? true : new Promise(resolve => { img.addEventListener("load", () => resolve(true), {once:true}); img.addEventListener("error", () => resolve(false), {once:true}); }); });
  await stableTarget(page, frame);
  const measurement = await image.evaluate(img => {
    const ir=img.getBoundingClientRect(), frame=img.closest(".evidence-frame"), fr=frame.getBoundingClientRect(), ics=getComputedStyle(img), fcs=getComputedStyle(frame);
    return { currentSrc:img.currentSrc||img.src, sourceBasename:(img.currentSrc||img.src).split("/").pop().replace(/\.[^.]+$/, ""), naturalWidth:img.naturalWidth, naturalHeight:img.naturalHeight, renderedWidth:ir.width, renderedHeight:ir.height, frameWidth:fr.width, frameHeight:fr.height, imageRadius:ics.borderRadius, frameRadius:fcs.borderRadius, overflow:fcs.overflow, opacity:ics.opacity, visibility:ics.visibility, display:ics.display, inset:{left:ir.left-fr.left,top:ir.top-fr.top,right:fr.right-ir.right,bottom:fr.bottom-ir.bottom} };
  });
  const frameBox = box(await frame.boundingBox());
  await decision.screenshot({ path: `${shot}-decision.png` });
  const liveFrameBox = box(await frame.boundingBox());
  await frame.screenshot({ path: `${shot}-edge.png` });
  const required="voucher-offer-stage-discover-pdp-before-shipped-01";
  const pass=measurement.sourceBasename.includes(required)&&measurement.naturalWidth>0&&measurement.naturalHeight>0&&measurement.renderedWidth>0&&measurement.renderedHeight>0&&Math.abs(measurement.inset.left)<1&&Math.abs(measurement.inset.right)<1&&measurement.imageRadius==="0px"&&measurement.overflow==="hidden";
  if(!pass)failures.push(`discover-pdp-evidence: ${JSON.stringify(measurement)}`);
  return {...measurement,frameBox,liveFrameBox,visibleScreenshot:true,pass};
});

async function footerCase(stage, viewport, group) {
  const label=`footer-${group}-${stage}`;
  return isolated(label, viewport, async (page, shot) => {
    const response=await page.goto(`${parentUrl}?case=voucher&stage=${stage}`,{waitUntil:"networkidle"});
    if(!response?.ok())throw new Error(`${stage} HTTP ${response?.status()}`);
    await page.locator(".voucher-stage-hero").waitFor({state:"visible"});
    const footer=page.locator(".child-stage-navigation").first(), root=page.locator(".dialog-scroll").first();
    await footer.waitFor({state:"visible"});
    await footer.evaluate(node=>node.scrollIntoView({block:"end",behavior:"auto"})); await twoFrames(page);
    const measurement=await footer.evaluate(node=>{const r=node.getBoundingClientRect(),root=node.closest(".dialog-scroll"),rr=root.getBoundingClientRect(),content=root.firstElementChild,cr=content?.getBoundingClientRect();const links=[...node.querySelectorAll("a,button")].filter(x=>getComputedStyle(x).display!=="none").map(x=>(x.textContent||x.getAttribute("aria-label")||"").trim()).filter(Boolean);return{footerBottomY:r.bottom,footerTopY:r.top,footerHeight:r.height,popupBottomY:rr.bottom,contentBottomY:cr?.bottom??rr.bottom,whitespace:Math.max(0,(cr?.bottom??rr.bottom)-r.bottom),viewportHeight:innerHeight,rootScrollTop:root.scrollTop,rootScrollHeight:root.scrollHeight,rootClientHeight:root.clientHeight,links,visible:r.width>0&&r.height>0&&r.bottom>rr.top&&r.top<rr.bottom};});
    const rootBox=box(await root.boundingBox());
    await root.screenshot({path:`${shot}.png`});
    const pass=measurement.visible&&measurement.links.length>0&&measurement.whitespace<=96&&measurement.rootScrollHeight-measurement.rootClientHeight-measurement.rootScrollTop<=2;
    if(!pass)failures.push(`${label}: ${JSON.stringify(measurement)}`); return {...measurement,rootBox,pass};
  });
}
for(const stage of stages) report.gateC.desktop1419[stage]=await footerCase(stage,{width:1419,height:900},"desktop1419");
for(const stage of stages) report.gateC.mobile430[stage]=await footerCase(stage,{width:430,height:932},"mobile430");

await browser.close();
report.failures=failures;
report.engineeringQa=failures.length?"FAIL":"PASS";
fs.writeFileSync(path.join(evidenceDir,"r1582-isolated-qa.json"),`${JSON.stringify(report,null,2)}\n`);
if(failures.length)throw new Error(failures.join("\n"));
console.log("R158.2 THREE-GATE ISOLATED CERTIFICATION PASS");
