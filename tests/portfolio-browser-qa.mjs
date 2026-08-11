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

  const targetedDirectory = path.join(directory, "targeted");
  fs.mkdirSync(targetedDirectory, { recursive: true });
  const capture = async (name, selector) => {
    const target = page.locator(selector).first();
    if (!(await target.count()) || !(await target.isVisible())) {
      failures.push(`${viewport.name} targeted capture missing: ${name}`);
      return;
    }
    await target.scrollIntoViewIfNeeded();
    await target.screenshot({ path: path.join(targetedDirectory, `${name}.png`) });
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

  const initialFocus = await page.evaluate(() => ({
    tag: document.activeElement?.tagName || "",
    id: document.activeElement?.id || "",
    titleFocused: document.activeElement?.id === "detailTitle",
    scrollTop: document.querySelector(".dialog-scroll")?.scrollTop || 0,
  }));
  if (initialFocus.titleFocused) failures.push(`${viewport.name} popup title received initial focus`);

  const firstTooltip = page.locator(".outcome-metric .info-tooltip__trigger").first();
  const tooltipState = { count: await page.locator(".info-tooltip__trigger").count() };
  if (await firstTooltip.count()) {
    await firstTooltip.click();
    tooltipState.outcomeClickOpen = await firstTooltip.getAttribute("aria-expanded");
    if (tooltipState.outcomeClickOpen !== "true") failures.push(`${viewport.name} Outcome tooltip did not open`);
    await firstTooltip.press("Escape");
    tooltipState.outcomeEscapeClosed = await firstTooltip.getAttribute("aria-expanded");
    if (tooltipState.outcomeEscapeClosed !== "false") failures.push(`${viewport.name} Outcome tooltip did not close with Escape`);
  }
  r156.initialFocus = initialFocus;
  r156.tooltipState = tooltipState;

  if (viewport.name === "desktop-1419" || viewport.name === "mobile-430") {
    for (const stage of ["discover", "qualify", "activate", "redeem", "review"]) {
      await page.goto(`${baseUrl}/site/work/voucher?case=voucher&stage=${stage}`, { waitUntil: "networkidle" });
      await capture(`child-${stage}-overview`, "#projectOverviewSection");
      if (stage === "discover") {
        const decisions = page.locator(".voucher-r149-decision, .decision-card-v46");
        if (await decisions.count() >= 2) {
          await decisions.nth(0).scrollIntoViewIfNeeded();
          await decisions.nth(0).screenshot({ path: path.join(targetedDirectory, "discover-decision-01.png") });
          await decisions.nth(1).scrollIntoViewIfNeeded();
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
