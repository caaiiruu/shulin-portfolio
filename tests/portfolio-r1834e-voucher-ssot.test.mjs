import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const content = JSON.parse(fs.readFileSync("public/site/content/portfolio-content.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("public/site/content/portfolio-asset-manifest.json", "utf8"));
const ledger = JSON.parse(fs.readFileSync("docs/portfolio-automation/execution-ledger.json", "utf8"));
const voucher = content.projects.voucher;
const authority = ledger.humanImplementationAuthorizations.find((item) => item.approvalId === "PA-20260828-VOUCHER-SSOT-R1834E");
const recoveryAuthority = ledger.humanImplementationAuthorizations.find((item) => item.approvalId === "PA-20260829-VOUCHER-R1834G1");

test("R183.4E keeps one atomic canonical Voucher content and asset revision", () => {
  assert.equal(content.contentVersion, "2026-08-29-r1836-project-detail-composition-consolidation");
  assert.equal(manifest.contentVersion, content.contentVersion);
  assert.equal(authority.canonicalContentOwner, "public/site/content/portfolio-content.json");
  assert.equal(authority.canonicalAssetOwner, "public/site/content/portfolio-asset-manifest.json");
  assert.equal(authority.status, "HUMAN_TRUTH_CANONICALISED");
  assert.equal(authority.visualAcceptance, "HUMAN_VISUAL_ACCEPTANCE_PENDING");
  assert.equal(authority.frozen, false);
});

test("R183.4E locks Hero, At a Glance and Info Grid authority", () => {
  assert.deepEqual(voucher.title, {
    en: "Fragmented voucher journeys to a reusable incentive ecosystem",
    zh: "從分散的優惠券旅程到可重用的獎勵生態系",
  });
  assert.equal(voucher.atAGlance.en, "Led multi-year product design across voucher discovery, qualification and redemption, turning fragmented campaign journeys into reusable incentive capabilities across 2022–2025, within a programme that reached ~125K digital redemptions in the final three weeks of 2023, +90.9% digital redemption-share change, ~167% add-to-cart uplift and 7× faster cross-team alignment.");
  assert.equal(voucher.atAGlance.zh, "主導 2022–2025 年跨優惠券探索、資格判定與兌換的多年產品設計，將分散的活動旅程轉化為可重用的獎勵能力；該計畫在 2023 年最後三週達到約 12.5 萬次數位兌換、+90.9% 數位兌換占比變化、約 167% 加入購物車提升，並將跨團隊對齊效率提升至 7 倍。");
  assert.match(voucher.atAGlance.en,/within a programme that reached/);
  assert.deepEqual({
    type: voucher.infoGrid.type.value,
    scope: voucher.infoGrid.scope.en,
    audience: [voucher.infoGrid.audience.primary.en, ...voucher.infoGrid.audience.secondary.en],
    timeline: voucher.infoGrid.timeline.dateRange.en,
  }, {
    type: "Incentive System",
    scope: "End-to-end incentive journey",
    audience: ["Customers", "Voucher Operations"],
    timeline: "2022–2025",
  });
});

test("R183.4G.1 locks the programme section model, Contribution and complexity payload", () => {
  assert.deepEqual(voucher.sectionOrder, ["hero", "overview", "complexity", "contribution", "core-system-insight", "journey-stage-solutions", "programme-research", "outcomes", "my-accountability", "related-work"]);
  assert.equal(voucher.publicContent.myContribution.standaloneSection, true);
  assert.equal(voucher.publicContent.myContribution.publicVisibility, "parent-visible");
  assert.equal(voucher.recruiterFirstPopup.contribution.title.en, "I turned fragmented incentive work into a reusable system that made rewards more visible, easier to act on and capable of driving repeated engagement across five shopping stages.");
  assert.deepEqual(voucher.whatMadeThisHard, [
    {title:{en:"Cross-channel rule fragmentation",zh:"跨通路規則分散"},description:{en:"Rules evolved separately across online, in-store and supplier-funded journeys, creating inconsistent terminology, states and exceptions.",zh:"線上、門市與供應商出資旅程各自發展規則，造成用語、狀態與例外處理不一致。"}},
    {title:{en:"Multi-party priorities",zh:"多方目標並存"},description:{en:"Customer value, supplier visibility, campaign goals and operational feasibility had to coexist within the same incentive model.",zh:"顧客價值、供應商曝光、活動目標與營運可行性，必須共存於同一套獎勵模型。"}},
    {title:{en:"Reuse depended on rule clarity",zh:"重用仰賴規則清晰"},description:{en:"Eligibility, claim, expiry, redemption and sponsorship logic had to be consistently defined before teams could safely reuse product patterns.",zh:"資格、領取、到期、兌換與出資邏輯必須先被一致定義，團隊才能安全重用產品模式。"}},
  ]);
});

test("R183.4G.1 locks one Core System Insight and the five-stage solution spine", () => {
  assert.deepEqual(voucher.publicContent.coreSystemInsight.insight, {
    en: "Value had to appear in the shopping journey—not outside it.",
    zh: "優惠價值必須出現在購物旅程中，而不是旅程之外。",
  });
  assert.deepEqual(voucher.publicContent.coreSystemInsight.whatThisChanged, {
    en: "Customers did not need more Vouchers. They needed value to appear in the right shopping context, with clear eligibility and a trustworthy path to application.",
    zh: "顧客需要的不是更多優惠券，而是讓價值在正確購物情境中出現，並具備清楚資格與可信任的套用路徑。",
  });
  assert.deepEqual(voucher.recruiterFirstPopup.stages.map((item) => item.id.toUpperCase()), ["DISCOVER", "QUALIFY", "ACTIVATE", "REDEEM", "REVIEW"]);
});

test("R183.4E locks four primary Outcomes and three parent research metrics", () => {
  const outcomes = voucher.recruiterFirstPopup.outcomes.metrics;
  assert.deepEqual(outcomes.map((item) => item.value), ["+90.9%", "+~167%", "~125K", "7× faster"]);
  assert.deepEqual(outcomes.map((item) => item.label.en), [
    "digital redemption-share change",
    "approximate add-to-cart uplift",
    "digital redemptions in the final three weeks",
    "cross-team alignment / recurring decision-cycle improvement",
  ]);
  assert.match(outcomes[0].qualifier,/relative change, not percentage points/);
  assert.match(outcomes[1].qualifier,/approximate/);
  assert.match(outcomes[2].qualifier,/2023 timeframe/);
  assert.deepEqual(voucher.recruiterFirstPopup.programmeResearch.metrics.map((item) => item.value), ["2,857", "93%", "87%"]);
  assert.deepEqual(voucher.recruiterFirstPopup.programmeResearch.supportingMetrics.map((item) => item.value), ["18", "15"]);
  assert.equal(voucher.recruiterFirstPopup.programmeResearch.aggregateParticipantCount, null);
});

test("R183.4E locks Voucher-specific accountability and approved lead asset", () => {
  const accountability = voucher.ownershipModel.accountabilityPresentation;
  assert.equal(accountability.intro.en, "A clear line between the system direction I owned and decisions delivered with partners.");
  assert.deepEqual([accountability.owned.title.en, accountability.owned.text.en], [
    "End-to-end incentive journey strategy",
    "Research synthesis, system framing, Voucher rules, interaction architecture, reusable component direction and recurring validation.",
  ]);
  assert.deepEqual([accountability.shared.title.en, accountability.shared.text.en], [
    "Cross-functional delivery and integration",
    "Prioritisation, feasibility, payment integration, Operations mapping and measurement with Product, Engineering, Payment, Marketing and Operations partners.",
  ]);
  const lead = manifest.items["voucher-hero-incentive-journey-public-v1"];
  assert.deepEqual([lead.publicPath, lead.width, lead.height, lead.sha256], [
    "/site/assets/projects/voucher/voucher-lead-visual-incentive-ecosystem-public-v1.jpg", 2048, 1152,
    "4a486dc375fb84c622940321c4bec2968856b1d8c20c80e69564d5331dd516a8",
  ]);
  assert.equal(crypto.createHash("sha256").update(fs.readFileSync(`public${lead.publicPath}`)).digest("hex"), lead.sha256);
});

test("R183.4E machine-blocks every Human-rejected public value", () => {
  assert.deepEqual(authority.outcomeContract, ["+90.9%", "+~167%", "~125K", "7× faster"]);
  assert.deepEqual(authority.parentResearchMetricContract, ["2,857", "93%", "87%"]);
  assert.equal(authority.whatMadeThisHardCount, 3);
  assert.equal(authority.standaloneContribution, "SUPERSEDED_BY_PA-20260829-VOUCHER-R1834G1");
  assert.equal(recoveryAuthority.standaloneContribution, "REQUIRED_EXACTLY_ONCE");
  assert.equal(recoveryAuthority.paymentStyleDecisionSpine, "FORBIDDEN");
  const publicContract = JSON.stringify({
    title: voucher.title,
    atAGlance: voucher.atAGlance,
    sectionOrder: voucher.sectionOrder,
    complexity: voucher.whatMadeThisHard,
    core: voucher.publicContent.coreSystemInsight,
    outcomes: voucher.recruiterFirstPopup.outcomes.metrics.map(({value,label}) => ({value,label})),
    research: voucher.recruiterFirstPopup.programmeResearch.metrics,
    audience: voucher.infoGrid.audience,
    lead: voucher.heroVisualBrief.assetId,
  });
  for (const rejected of [
    "From fragmented campaign logic to a reusable incentive system", "Critical Problem", "Business Impact",
    "Key Intervention Map", "Where I Changed the System", "Key Problems", "2 weeks → 2 days",
    "~1.5% → ~4%", "33 participants",
    "voucher-offer-work-card-primary-01.jpeg",
  ]) assert.equal(publicContract.includes(rejected), false, `rejected public value returned: ${rejected}`);
  assert.equal(voucher.recruiterFirstPopup.programmeResearch.metrics.some((item) => ["18", "15"].includes(item.value)), false);
  assert.equal(voucher.recruiterFirstPopup.programmeResearch.supportingMetrics.every((item) => item.visibility === "supporting-only"), true);
  assert.equal(authority.productionAuthorized, false);
  assert.equal(authority.mergeAuthorized, false);
});
