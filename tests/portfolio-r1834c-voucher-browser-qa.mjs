import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const outputRoot = process.env.EVIDENCE_DIR || "/tmp/portfolio-r1834c-voucher-qa";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
const expectedSections = ["what-made-this-hard", "my-contribution", "core-system-insight", "journey-stage-solutions", "programme-research", "validated-outcomes", "my-accountability", "continue-exploring"];
const expectedNavigator = ["Overview", "Complexity", "Solutions", "Evidence", "Outcomes", "Ownership"];
const rejectedCopy = ["Critical problem", "Business impact", "Key Intervention Map", "WHERE I CHANGED THE SYSTEM", "BEFORE\nFragmented voucher journeys"];

for (const viewport of [
  { name: "desktop-1419", width: 1419, height: 900 },
  { name: "tablet-871", width: 871, height: 1024 },
  { name: "mobile-430", width: 430, height: 932 },
]) {
  const context = await browser.newContext({ viewport, hasTouch: viewport.width === 430, isMobile: viewport.width === 430 });
  const page = await context.newPage();
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${baseUrl}/site/work/voucher`, { waitUntil: "networkidle" });
  const images = page.locator("#projectDetailHeroVisual img, #systemCaseEvidenceSection img");
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    await image.evaluate(node => { node.loading = "eager"; });
  }
  await page.waitForFunction(() => [...document.querySelectorAll("#projectDetailHeroVisual img, #systemCaseEvidenceSection img")].every(image => image.complete && image.naturalWidth > 0));

  const voucher = await page.evaluate(() => {
    const dialog = document.querySelector("#detailDialog");
    const lead = document.querySelector("#projectDetailHeroVisual img");
    return {
      title: document.querySelector("#detailTitle")?.textContent.trim(),
      atAGlance: document.querySelector("#projectAtGlance")?.textContent.trim(),
      timeline: document.querySelector("#projectSignals .info-grid-v45__timeline strong")?.textContent.trim(),
      audience: document.querySelector("#projectSignals .info-grid-v45__audience strong")?.textContent.trim(),
      sections: [...document.querySelectorAll("#programmeSurface > [data-canonical-section-id]")].map(node => node.dataset.canonicalSectionId),
      navigator: [...document.querySelectorAll("#projectSectionNavLinks a")].map(node => node.textContent.trim()),
      headings: [...dialog.querySelectorAll("h2,h3")].filter(node => node.getClientRects().length).map(node => node.textContent.trim()),
      text: dialog.innerText,
      decisions: document.querySelectorAll("#systemCaseDecisionsSection .decision-card-v46").length,
      stages: [...document.querySelectorAll("#voucherDecisionsSection [data-stage-card]")].map(node => node.dataset.stageCard.toUpperCase()),
      outcomes: [...document.querySelectorAll("#voucherImpactSection .outcome-metric__value")].map(node => node.textContent.trim()),
      research: [...document.querySelectorAll("#voucherEvidenceSection .research-evidence-metric strong")].map(node => node.textContent.trim()),
      accountability: document.querySelector("#voucherOwnershipSection")?.innerText || "",
      lead: lead ? { src: lead.getAttribute("src"), width: lead.naturalWidth, height: lead.naturalHeight, assetId: lead.closest("figure")?.dataset.assetId } : null,
      leadGeometry: lead ? (()=>{const figure=lead.closest("figure"),rect=figure.getBoundingClientRect(),style=getComputedStyle(figure),imageStyle=getComputedStyle(lead);return{ratio:rect.width/rect.height,objectFit:imageStyle.objectFit,componentOwner:figure.dataset.componentOwner}})() : null,
      overflow: document.querySelector("#detailDialog .dialog-scroll")?.scrollWidth - document.querySelector("#detailDialog .dialog-scroll")?.clientWidth,
    };
  });
  assert.equal(voucher.title, "Fragmented voucher journeys to a reusable incentive ecosystem");
  assert.match(voucher.atAGlance, /~125K digital redemptions in the final three weeks of 2023, \+90\.9% digital redemption-share change, ~167% add-to-cart uplift and 7× faster cross-team alignment/);
  assert.match(voucher.timeline, /2022–2025/);
  assert.match(voucher.audience, /Primary: Customers/);
  assert.match(voucher.audience, /Secondary: Voucher Operations/);
  assert.deepEqual(voucher.sections, expectedSections);
  assert.deepEqual(voucher.navigator, expectedNavigator);
  assert.equal(voucher.decisions, 0);
  assert.deepEqual(voucher.stages, ["DISCOVER", "QUALIFY", "ACTIVATE", "REDEEM", "REVIEW"]);
  assert.deepEqual(voucher.outcomes, ["+90.9%", "+~167%", "~125K", "7× faster"]);
  assert.deepEqual(voucher.research, ["2,857", "93%", "87%"]);
  assert.match(voucher.accountability, /A clear line between the system direction I owned and decisions delivered with partners/);
  assert.match(voucher.accountability, /End-to-end incentive journey strategy/);
  assert.match(voucher.accountability, /Cross-functional delivery and integration/);
  assert.deepEqual(voucher.lead, { src: "/site/assets/projects/voucher/voucher-lead-visual-incentive-ecosystem-public-v1.jpg?v=4a486dc375fb84c6", width: 2048, height: 1152, assetId: "voucher-hero-incentive-journey-public-v1" });
  assert.ok(Math.abs(voucher.leadGeometry.ratio - 16 / 9) < 0.02);
  assert.deepEqual([voucher.leadGeometry.objectFit, voucher.leadGeometry.componentOwner], ["contain", "ProjectDetailOverview"]);
  assert.ok(voucher.overflow <= 16);
  for (const copy of rejectedCopy) assert.doesNotMatch(voucher.text, new RegExp(copy, "i"));
  assert.ok(voucher.headings.includes("Contribution") && voucher.headings.includes("One journey — five stages") && !voucher.headings.includes("Design decisions") && voucher.headings.includes("My accountability") && voucher.headings.includes("Explore other projects"));
  fs.mkdirSync(outputRoot, { recursive: true });
  await page.locator("#detailDialog .dialog-scroll").screenshot({ path: path.join(outputRoot, `${viewport.name}-voucher-en.png`) });

  const toggle = page.locator("[data-lang-toggle]").first();
  await toggle.evaluate(node => node.click());
  const zh = await page.evaluate(() => ({ title: document.querySelector("#detailTitle")?.textContent.trim(), text: document.querySelector("#detailDialog")?.innerText || "" }));
  assert.equal(zh.title, "從分散的優惠券旅程到可重用的獎勵生態系");
  assert.match(zh.text, /2023 年最後三週達到約 12\.5 萬次數位兌換、\+90\.9% 數位兌換占比變化、約 167% 加入購物車提升，並將跨團隊對齊效率提升至 7 倍/);
  assert.match(zh.text, /貢獻/);
  assert.doesNotMatch(zh.text, /Primary: Customers|Secondary: Voucher Operations/);

  await page.locator("#detailDialog .dialog-scroll").screenshot({ path: path.join(outputRoot, `${viewport.name}-voucher-zh.png`) });

  await toggle.evaluate(node => node.click());
  for (const [stage, expectedDirections] of [["discover", ["next"]], ["activate", ["previous", "next"]], ["review", ["previous"]]]) {
    await page.goto(`${baseUrl}/site/work/voucher?case=voucher&stage=${stage}`, { waitUntil: "networkidle" });
    const navigation = await page.locator(".child-stage-navigation").evaluate(node => {
      const navRect = node.getBoundingClientRect();
      return {
        links: [...node.querySelectorAll("a")].map(link => ({ direction: link.dataset.stageDirection, text: link.textContent.trim(), left: link.getBoundingClientRect().left, right: link.getBoundingClientRect().right })),
        center: navRect.left + navRect.width / 2,
      };
    });
    assert.deepEqual(navigation.links.map(link => link.direction), expectedDirections);
    if (stage === "discover") assert.ok(navigation.links[0].left >= navigation.center);
    if (stage === "activate") assert.ok(navigation.links[0].right <= navigation.links[1].left);
    if (stage === "review") assert.ok(navigation.links[0].right <= navigation.center);
    assert.equal(navigation.links.some(link => /Return to Voucher|返回 Voucher/.test(link.text)), false);
    await page.locator(".child-stage-navigation a").first().focus();
    assert.ok(await page.locator(".child-stage-navigation a").first().evaluate(node => node === document.activeElement));
    if (viewport.name === "desktop-1419" || viewport.name === "mobile-430") await page.locator(".child-stage-navigation").screenshot({ path: path.join(outputRoot, `${viewport.name}-${stage}-navigation.png`) });
  }

  await page.goto(`${baseUrl}/site/work/payment`, { waitUntil: "networkidle" });
  const payment = await page.evaluate(() => ({
    title: document.querySelector("#detailTitle")?.textContent.trim(),
    decisions: document.querySelectorAll("#systemCaseDecisionsSection .decision-card-v46").length,
    evidence: document.querySelectorAll("#systemCaseEvidenceSection .voucher-r149-foundation").length,
    recognitionLinks: document.querySelectorAll(".outcome-recognition-proof__link[href]").length,
    quoteWidth: document.querySelector(".structured-evidence-quote blockquote")?.getBoundingClientRect().width,
    quoteCardWidth: document.querySelector(".structured-evidence-quote")?.getBoundingClientRect().width,
  }));
  assert.equal(payment.title, "Unifying App, cashier and self-checkout into one payment system");
  assert.equal(payment.decisions, 4);
  assert.equal(payment.evidence, 4);
  assert.equal(payment.recognitionLinks, 1);
  assert.ok(payment.quoteWidth > payment.quoteCardWidth * 0.8);
  assert.deepEqual(errors, []);
  await context.close();
}

await browser.close();
console.log("R183.4C Voucher presentation, stage navigation and frozen Payment browser QA: PASS");
