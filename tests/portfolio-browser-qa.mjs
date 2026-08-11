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
    await interactive.click();
    await page.waitForLoadState("networkidle");
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
