import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const site = new URL("../public/site/", import.meta.url);
const read = (relative) => fs.readFileSync(new URL(relative, site), "utf8");

test("serves the portfolio root through a server redirect", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, "/site/index.html");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-src https:\/\/www\.figma\.com/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("cross-origin-opener-policy"), "same-origin");
  assert.equal(response.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.match(response.headers.get("strict-transport-security") ?? "", /max-age=31536000/);
});
test("loads one fingerprinted stylesheet and runtime on every page", () => {
  for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
    const html = read(page);
    assert.equal(html.split("<link").length - 1, 1);
    assert.equal(html.split("<script").length - 1, 1);
    assert.match(html, /production[.][a-f0-9]{16}[.]css/);
    assert.match(html, /production[.][a-f0-9]{16}[.]js/);
    assert.match(html, /id="detailDialog"/);
  }
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  assert.equal(Object.keys(ssot.projects).length, 13);
  for (const [id, project] of Object.entries(ssot.projects)) {
    const html = read(`work/${id}.html`);
    assert.ok(html.includes(`<title>${project.title.en} — Shulin Chou</title>`));
    assert.ok(html.includes('name="description" content="'));
    assert.ok(html.includes(`rel="canonical" href="https://shulinchou.com/site/work/${id}"`));
    assert.ok(html.includes('property="og:title"'));
    assert.ok(html.includes('property="og:description"'));
    assert.ok(html.includes(`property="og:url" content="https://shulinchou.com/site/work/${id}"`));
    assert.ok(!html.includes("<title>Work — Shulin Chou</title>"));
    assert.ok(html.includes(`data-project-route-summary="${id}"`));
    assert.ok(html.includes(project.title.en));
    assert.ok(html.includes(project.criticalProblem.en));
  }
});

test("every popup trigger resolves to one canonical SSOT record", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
    const html = read(page);
    for (const id of [...html.matchAll(/data-project="([^"]+)"/g)].map((match) => match[1])) {
      assert.ok(ssot.projects[id], `${page}: unresolved project trigger ${id}`);
    }
    for (const id of [...html.matchAll(/data-experiment="([^"]+)"/g)].map((match) => match[1])) {
      assert.ok(ssot.experiments[id] || ssot.sideProjects[id], `${page}: unresolved exploration trigger ${id}`);
    }
  }
});

test("contains no retired popup IDs in active pages or related-work maps", () => {
  const active = [
    read("index.html"),
    read("work.html"),
    read("experiments.html"),
    read("profile.html"),
    read("assets/js/app.js"),
  ].join("\n");
  for (const retired of ["hours", "memory", "chat", "story", "ai-assistant"]) {
    assert.doesNotMatch(active, new RegExp(`(?:data-(?:project|experiment)="${retired}"|['"]${retired}['"]\\s*:)`), retired);
  }
});

test("hydrates all six domain selectors from the canonical SSOT without legacy static data", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const home = read("assets/js/home.js");
  assert.equal(ssot.contentDiscovery.domains.length, 6);
  assert.match(home, /DATA\.contentDiscovery\?\.domains/);
  assert.doesNotMatch(home, /DATA\.domains/);
  assert.match(home, /Integration Conflict: domain/);
  for (const domain of ssot.contentDiscovery.domains) {
    assert.ok(domain.summary.en && domain.summary.zh);
    assert.equal(domain.commonProblemPatterns.en.length, 3);
    assert.equal(domain.commonProblemPatterns.zh.length, 3);
    assert.equal(domain.howITypicallyAddressThem.en.length, 3);
    assert.equal(domain.howITypicallyAddressThem.zh.length, 3);
    assert.equal(domain.problemSpaces, undefined);
    assert.equal(domain.designResponses, undefined);
  }
});

test("keeps Voucher Center evidence and listing boundaries canonical", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const voucher = ssot.projects["voucher-center"];
  const serialized = JSON.stringify({ research: voucher.publicContent.researchChangedTheModel, decisions: voucher.publicContent.decisionNarrative.primaryDecisions, scope: voucher.publicContent.productScope });
  assert.deepEqual(voucher.problemTypes.en, ["Voucher discovery", "Claim-state clarity", "Campaign operations"]);
  assert.deepEqual(voucher.heroVisualBrief.problemSignal, { en: "Voucher discovery", zh: "優惠券探索" });
  assert.match(voucher.publicContent.phasedValidationPath.stages[0].boundary.en, /proposal-era modelled targets—not actual results/);
  assert.equal(voucher.flashVoucherEvidence.businessCase.status, "modelled-proposal-targets-not-achieved-outcomes");
  assert.equal(voucher.flashVoucherEvidence.businessCase.actualResult, undefined);
  assert.doesNotMatch(serialized, /9\s*\+\s*9|Applicable \/ Not applicable|Select all|Checkout research|Search decision/i);
  assert.equal(voucher.publicContent.decisionNarrative.primaryDecisions[0].title.en, "Separate participation from application");
  assert.equal(voucher.publicContent.decisionNarrative.primaryDecisions[1].title.en, "Preserve the target architecture without blocking launch");
  assert.deepEqual(voucher.publicContent.productScope.notShipped, ["Claim all", "Complete consolidated navigation"]);
  assert.match(voucher.publicContent.systemFoundation.ownership.en, /did not create the original Voucher Card system from scratch/);
  assert.match(voucher.publicContent.systemFoundation.evolution[0].title.en, /Original white Voucher Card/);
  assert.match(voucher.publicContent.systemFoundation.evolution[2].title.en, /Reusable Tangram component/);
  assert.equal(voucher.localizationStatus.traditionalChinese, "complete-no-runtime-fallback");
  for (const value of [voucher.title.zh, voucher.atAGlance.zh, ...voucher.problemTypes.zh]) {
    assert.doesNotMatch(value, /phased validation path|research changed the model/i);
  }
});

test("keeps every rendered project overview bilingual without English fallback in Chinese mode", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const unresolvedTimelineProjects = [];
  for (const [id, project] of Object.entries(ssot.projects)) {
    const info = project.infoGrid;
    assert.ok(info.type.value, `${id}: type.value is required`);
    assert.ok(info.scope.en && info.scope.zh, `${id}: bilingual scope is required`);
    assert.ok(info.audience.primary.en && info.audience.primary.zh, `${id}: bilingual primary audience is required`);
    assert.equal(info.audience.secondary.zh.length, info.audience.secondary.en.length, `${id}: audience secondary translations must align`);
    const timeline = info.timeline;
    if (!timeline.duration?.en) unresolvedTimelineProjects.push(id);
    else assert.ok(timeline.duration.zh, `${id}: timeline.duration.zh is required`);
  }
  assert.deepEqual(unresolvedTimelineProjects, ["cathay-mortgage-assistant"]);
  const app = read("assets/js/app.js");
  assert.match(app, /value\.secondary\?\.zh/);
  assert.match(app, /value\.duration/);
});

test("keeps every project Type consistent across canonical SSOT representations", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const allowed = new Set(["Internal System", "Incentive System", "Transaction System", "Marketplace Platform", "0→1 Product"]);
  for (const [id, project] of Object.entries(ssot.projects)) {
    const canonical = project.infoGrid?.type?.value;
    assert.ok(allowed.has(canonical), `${id}: unapproved Type ${canonical}`);
    assert.equal(project.infoGrid.type.visibility, "info-grid-only", `${id}: Type placement`);
  }
});

test("renders primary and secondary audiences as distinct semantic lines", () => {
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  assert.match(app, /split\(\/\\n\+\//);
  assert.match(app, /info-grid-v45__line/);
  assert.match(css, /\.info-grid-v45__line\{display:block\}/);
  assert.doesNotMatch(app, /replace\(\/\\s\+\(Secondary:/);
  assert.doesNotMatch(app, /\[\\u3400-\\u9fff\]\)\\s\+/);
});

test("keeps publicly rendered structured evidence bilingual", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const requiredPairs = Object.values(ssot.projects).flatMap((project) => [
    project.title,
    project.atAGlance,
    project.whyItMattered,
    project.businessImpact,
    project.infoGrid.scope,
  ]);
  for (const value of requiredPairs) {
    assert.equal(typeof value, "object");
    assert.ok(String(value.en ?? "").trim());
    assert.ok(String(value.zh ?? "").trim());
  }
});

test("normalizes every verified core contribution into the shared headline contract", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  for (const [id, project] of Object.entries(ssot.projects)) {
    const value = project.valueIBrought ?? project.publicContent?.myContribution?.summary ?? project.publicContent?.contribution?.summary ?? project.ownershipModel?.publicSummary;
    assert.ok(value, `${id}: valueIBrought is required`);
    if (value.headline) {
      assert.ok(value.headline.en && value.headline.zh, `${id}: bilingual headline is required`);
    } else {
      assert.ok(value.en && value.zh, `${id}: bilingual valueIBrought is required`);
    }
  }
  const app = read("assets/js/app.js");
  assert.match(app, /p\.publicContent\?\.myContribution\?\.summary/);
  assert.match(app, /\? \{headline:rawValueIBrought\}/);
});

test("reads ownership headings from the canonical project section label registry", () => {
  const app = read("assets/js/app.js");
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  assert.match(app, /projectSectionLabels\?\.\[key\]/);
  for (const key of ["ownershipAndCollaboration", "iLed", "coDecided", "partnerOwned"]) {
    assert.ok(ssot.localizationRegistry.projectSectionLabels[key].en);
    assert.ok(ssot.localizationRegistry.projectSectionLabels[key].zh);
  }
  assert.doesNotMatch(app, /projectDetailLabels\?\.\[key\]/);
});

test("uses canonical, unversioned production owners", () => {
  const build = fs.readFileSync(new URL("../scripts/build-production-assets.mjs", import.meta.url), "utf8");
  for (const owner of ["assets/css/tokens.css", "assets/css/base.css", "assets/js/runtime.js"]) assert.match(build, new RegExp(owner.replace(/[./]/g, "\\$&")));
  assert.doesNotMatch(build.match(/const cssSources = \[[\s\S]*?\];/)?.[0] ?? "", /v\d+\.css/);
  assert.doesNotMatch(build.match(/const jsSources = \[[\s\S]*?\];/)?.[0] ?? "", /v\d+\.js/);
  assert.match(build, /Canonical selector has multiple owners/);
  assert.match(build, /must use the single portfolio content owner/);
  assert.match(build, /content\/portfolio-content\.json/);
  assert.equal(fs.existsSync(new URL("assets/js/data.js", site)), false);
  assert.equal(fs.existsSync(new URL("assets/js/project-ssot.js", site)), false);
  assert.equal(fs.existsSync(new URL("content/search-suggestions.json", site)), false);
});

test("keeps one live registry owner per component", () => {
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const live = registry.components.filter((entry) => entry.status === "Live / Current Production");
  assert.equal(new Set(live.map((entry) => entry.component)).size, live.length);
  assert.equal(new Set(live.filter((entry) => entry.exclusiveOwner !== false).map((entry) => entry.cssOwner)).size, live.length);
  for (const entry of live) {
    assert.doesNotMatch(entry.cssOwner.split("/").at(-1), /v\d+/i);
    assert.equal(fs.existsSync(new URL(entry.cssOwner, site)), true);
    if (entry.contentOwner) assert.equal(fs.existsSync(new URL(entry.contentOwner, site)), true);
  }
});

test("keeps shared site chrome responsive, accessible, and singly owned", () => {
  const base = read("assets/css/base.css");
  const chrome = read("assets/css/components/site-chrome.css");
  const app = read("assets/js/app.js");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "SiteChrome");
  assert.equal(entry.cssOwner, "assets/css/components/site-chrome.css");
  assert.doesNotMatch(base, /(?:^|[\s>+~,.#:])(?:site-header\b|header-inner\b|brand\b|nav\b|lang-toggle\b|menu-toggle\b|menu-icon\b|mobile-menu\b|site-footer\b|contact-bar-v42(?:-|__|\b)|footer-meta-v42\b|is-locked\b)/m);
  for (const contract of [
    ".site-header {",
    ".home-page {",
    ".site-header--hero.is-scrolled",
    ".site-header--hero:has(.mobile-menu.is-open)",
    ".mobile-menu.is-open {",
    "max-height: calc(100dvh - var(--header-height))",
    ".mobile-menu a[aria-current=\"page\"]",
    ".mobile-menu [data-lang-toggle] {",
    "width: max-content",
    "justify-self: start",
    ".contact-bar-v42__action {",
    "@media (max-width: 900px)",
    "@media (max-width: 760px)",
    "@media (max-width: 430px)",
    "prefers-reduced-motion: reduce",
    "forced-colors: active",
  ]) assert.ok(chrome.includes(contract), contract);
  for (const contract of [
    "aria-current",
    "Close menu",
    "關閉選單",
    "event.key==='Escape'",
    "restoreFocus:true",
    "mobileMenuMedia.addEventListener('change'",
    "heroHeader.classList.toggle('is-scrolled'",
    "window.addEventListener('scroll',scheduleHeroHeaderSync,{passive:true})",
  ]) assert.ok(app.includes(contract), contract);
  assert.doesNotMatch(chrome, /!important|overflow-wrap:anywhere|word-break:break-all|#[a-f0-9]{3,8}\b/i);
  assert.doesNotMatch(chrome.match(/\.site-header--hero\s*\{[^}]*\}/)?.[0] ?? "", /position:\s*absolute/);
  assert.doesNotMatch(chrome.match(/\.mobile-menu \[data-lang-toggle\]\s*\{[^}]*\}/)?.[0] ?? "", /width:\s*100%/);
});

test("keeps global typography readable and singly owned by Foundation", () => {
  const base = read("assets/css/base.css");
  const foundation = read("assets/css/components/foundation.css");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "Foundation");
  assert.equal(entry.cssOwner, "assets/css/components/foundation.css");
  assert.doesNotMatch(base, /(?:^|\n)(?:html|body|h1|h2|h3|h4|h5|h6|p,li,dd|\.display|\.heading-[123]|\.lead-copy,\.body-copy)\s*\{/m);
  for (const contract of [
    ":where(h1,h2,h3,h4,h5,h6)",
    ":where(p,li,dd)",
    "overflow-wrap:normal",
    "word-break:normal",
    "max-width:var(--measure-body)",
    ".lead-copy,.body-copy",
    "@media(max-width:560px)",
  ]) assert.ok(foundation.includes(contract), contract);
  assert.doesNotMatch(foundation, /overflow-wrap:anywhere|word-break:break-all|#[a-f0-9]{3,8}\b/i);
  assert.doesNotMatch(foundation.match(/html\{[\s\S]*?h1\+p,h2\+p,h3\+p,h4\+p[^}]*\}/)?.[0] ?? "", /!important/);
});

test("keeps the project navigator outside the animated dialog scroll container", () => {
  const projectDetail = read("assets/css/components/project-detail-overview.css");
  const tokens = read("assets/css/tokens.css");
  assert.match(projectDetail, /\.pd-section-nav\{position:absolute/);
  assert.doesNotMatch(projectDetail, /\.pd-section-nav\{position:fixed/);
  for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
    const html = read(page);
    const scrollStart = html.indexOf('<div class="dialog-scroll">');
    const navStart = html.indexOf('<nav data-aria-key="aria.project-sections-');
    const scrollEnd = html.lastIndexOf("</div>\n</div>\n<nav data-aria-key=\"aria.project-sections-");
    assert.ok(scrollStart >= 0 && scrollEnd > scrollStart, `${page}: dialog scroll structure`);
    assert.ok(navStart > scrollEnd, `${page}: navigator must be a dialog child, not a scroll descendant`);
    assert.equal((html.match(/id="projectSectionNav"/g) ?? []).length, 1, `${page}: one navigator owner`);
  }
  for (const role of [
    "--type-page-title:", "--type-section-title:", "--type-subsection-title:",
    "--type-body:", "--type-meta:", "--type-eyebrow:", "--type-outcome-metric:",
    "--type-color-heading:", "--type-color-body:", "--type-color-meta:",
    "--type-color-eyebrow:", "--type-color-metric:",
  ]) assert.ok(tokens.includes(role), role);
});

test("uses only the three canonical semantic font weights", () => {
  const componentRoot = new URL("assets/css/components/", site);
  for (const file of fs.readdirSync(componentRoot).filter((name) => name.endsWith(".css"))) {
    const css = fs.readFileSync(new URL(file, componentRoot), "utf8");
    assert.doesNotMatch(css, /font-weight:\s*\d+/, file);
  }
  const tokens = read("assets/css/tokens.css");
  for (const token of ["--sys-weight-regular:", "--sys-weight-bold:", "--sys-weight-heavy:"]) {
    assert.ok(tokens.includes(token), token);
  }
});

test("keeps complete project decision content in the SSOT renderer", () => {
  const app = read("assets/js/app.js");
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const uiValues = Object.values(ssot.localizationRegistry.runtimeUiLabels).map((value) => value.en);
  for (const label of ["Type", "Scope", "Audience", "Timeline"]) assert.ok(uiValues.includes(label), label);
  for (const contract of ["p.type_pair", "p.scope_pair", "p.audience_pair", "p.timeline_pair", "detailPeriod"]) {
    assert.match(app, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  const overviewSignals = app.match(/const signalItems=\[[\s\S]*?\];/)?.[0] ?? "";
  assert.ok((overviewSignals.match(/ui\(/g) ?? []).length >= 4);
  assert.doesNotMatch(overviewSignals, /'Domain'/);
  assert.match(app, /safeText\(doc\.getElementById\('detailPeriod'\),''\)/);
  for (const retiredField of ["'My role'", "'Scale & reach'", "'Design strategy'"]) {
    assert.doesNotMatch(app, new RegExp(retiredField.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal(ssot.contentVersion, "2026-08-08-r147");
  assert.equal(Object.keys(ssot.projects).length, 13);
  for (const projectId of ["voucher", "dbs", "booking", "bandzo", "payment"]) {
    const value = ssot.projects[projectId].valueIBrought;
    assert.ok(value?.headline?.en && value?.headline?.zh, `${projectId} value headline`);
    assert.ok(value?.supportingStatement?.en && value?.supportingStatement?.zh, `${projectId} value supporting statement`);
    assert.ok(value.headline && value.supportingStatement, `${projectId} public value boundary`);
  }
  for (const [projectId, project] of Object.entries(ssot.projects)) assert.ok(project.valueIBrought, `${projectId} valueIBrought`);
  assert.ok(ssot.projects.dbs.problemTypes);
  for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
    const html = read(page);
    const title = html.indexOf('id="detailTitle"');
    const value = html.indexOf('id="projectValueHeadline"');
    const taxonomy = html.indexOf('id="detailClassification"');
    const glance = html.indexOf('id="projectAtGlance"');
    const signals = html.indexOf('id="projectSignals"');
    const why = html.indexOf('id="projectWhy"');
    const impact = html.indexOf('id="projectImpact"');
    const gallery = html.indexOf('id="sharedGallery"');
    assert.ok(title < taxonomy && taxonomy < value && value < glance && glance < signals && signals < why && why < impact && impact < gallery, page);
    assert.doesNotMatch(html, /id="detailInfo"/);
    assert.doesNotMatch(html, /id="quick(?:Responsibility|Scale|Decision)"/);
  }
});

test("renders the r85 hiring-evidence model through canonical shared components", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  assert.equal(Object.keys(ssot.projects).length, 13);
  assert.equal(Object.keys(ssot.projectDecisionRefs).length, 13);
  for (const [id, project] of Object.entries(ssot.projects)) {
    assert.ok(project.ownershipModel, `${id}: ownershipModel`);
    if (project.outcomeEvidenceModel) assert.ok(Array.isArray(project.outcomeEvidenceModel) || typeof project.outcomeEvidenceModel === "object", `${id}: outcomeEvidenceModel`);
    assert.ok(project.heroVisualBrief, `${id}: heroVisualBrief`);
    assert.ok(project.decisionNarrative?.primaryDecisions?.length, `${id}: canonical decisions`);
  }
  assert.equal(ssot.projectDecisionRefs.voucher.length, 11);
  for (const contract of [
    "p.decisionNarrative?.primaryDecisions",
    "p.ownershipModel",
    "p.outcomeEvidenceModel",
    "p.heroVisualBrief",
    "decision-ownership-v83",
  ]) assert.ok(app.includes(contract), contract);
});

test("preserves approved delivery and confidentiality metadata", () => {
  const app = read("assets/js/app.js");
  const overview = read("assets/css/components/project-detail-overview.css");
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  assert.ok(ssot.projects.voucher.publicContent);
  assert.match(JSON.stringify(ssot.projects.payment), /shipped-and-scaled/);
  assert.match(app, /function renderDeliveryStatus\(value\)/);
  assert.match(app, /renderDeliveryStatus\(localizedField\(item,'status'\)\)/);
  assert.doesNotMatch(app, /safeText\(detailStatus,isConfidential/);
  assert.match(overview, /\.detail-status\{[^}]*display:grid;[^}]*grid-template-columns:max-content max-content;[^}]*align-items:start/);
  assert.match(overview, /\.detail-status__chip\[data-state="shipped"\]/);
  assert.match(overview, /\.detail-status__label\{[^}]*padding-block:var\(--dimension-7px\);[^}]*line-height:1.4/);
  assert.match(overview, /\.detail-status__chip\{[^}]*padding:var\(--dimension-7px\) var\(--dimension-11px\);[^}]*line-height:1.4/);
});

test("renders outcome data types and never reuses locale-neutral ownership copy in Chinese", () => {
  const app = read("assets/js/app.js");
  const content = JSON.parse(read("content/portfolio-content.json"));
  assert.match(app, /localize\(item\.outcomeType\)/);
  assert.match(app, /localize\(item\.publicValue\)/);
  for (const [id, project] of Object.entries(content.projects)) {
    const ownership = project.ownershipModel || {};
    for (const field of ["ledByMe", "coDecided", "partnerOwned"]) for (const item of ownership[field] || []) {
      assert.equal(typeof item, "object", `${id}.${field} must be bilingual`);
      assert.ok(item.en && item.zh, `${id}.${field} requires en and zh`);
    }
    for (const item of (project.outcomeEvidenceModel || []).filter(item => item.publicUse !== "blocked")) {
      assert.ok(item.outcomeType?.zh, `${id} outcome requires a Chinese data type`);
      assert.ok(item.claim?.zh, `${id} outcome requires a Chinese public claim`);
    }
  }
});

test("keeps deep decision content concise and recruiter-scannable", () => {
  const app = read("assets/js/app.js");
  const labels = Object.values(JSON.parse(read("content/portfolio-content.json")).localizationRegistry.runtimeUiLabels).map((value) => value.en);
  for (const label of ["WHY THIS CHOICE", "WHAT I DECIDED", "TRADE-OFF ACCEPTED"]) assert.ok(labels.includes(label), label);
  assert.doesNotMatch(app, /'Alternative considered'/);
  assert.ok(app.indexOf("body.append(evidence)") > app.indexOf("body.append(element('h4'"));
  assert.match(app, /if\(tradeoffText\)/);
  assert.match(app, /if\(considerations\.childElementCount\)body\.append\(considerations\)/);
});

test("renders one accessible Principle Constellation from the migrated SSOT", () => {
  const html = read("index.html");
  const css = read("assets/css/components/homepage-evidence.css");
  const home = read("assets/js/home.js");
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  assert.equal((html.match(/data-principle-constellation/g) ?? []).length, 1);
  assert.equal((html.match(/principle-card-v48/g) ?? []).length, 0);
  assert.equal(ssot.designPrinciples.items.length, 4);
  assert.match(home, /DATA\.designPrinciples\?\.items/);
  for (const item of ssot.designPrinciples.items) {
    assert.ok(item.collapsed?.title?.en && item.collapsed?.title?.zh);
    assert.ok(item.collapsed?.value?.en && item.collapsed?.value?.zh);
    assert.ok(item.expanded?.howIWork?.en && item.expanded?.howIWork?.zh);
    assert.ok(item.expanded?.practice?.companyProduct?.en && item.expanded?.practice?.companyProduct?.zh);
    assert.ok(item.expanded?.practice?.summary?.en && item.expanded?.practice?.summary?.zh);
    for (const retired of ["title", "description", "value", "practiceExample"]) assert.equal(item[retired], undefined);
  }
  for (const contract of ["aria-expanded", "aria-controls", "role','region", "event.key==='Escape'", "root.dataset.activePrinciple", "document.addEventListener('portfolio:language',render)"]) assert.ok(home.includes(contract), contract);
  assert.match(css, /\.principle-constellation\s*\{[^}]*grid-template-columns:\s*repeat\(2/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)[\s\S]*?\.principle-constellation::before/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(css, /overflow-x\s*:\s*(?:auto|scroll)/);
});

test("renders verified Key Intervention Maps from the canonical SSOT only", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  const verifiedIds = [
    "voucher", "voucher-center", "game-center", "payment", "dbs", "booking", "bandzo",
    "cathay-sit-online-account-opening", "cathay-sit-review-remediation-operations",
    "ctbc-mortgage-self-service-app",
  ];
  for (const id of verifiedIds) {
    const map = ssot.projects[id].keyInterventionMap;
    assert.ok(map.status.startsWith("verified"), id);
    for (const field of ["sectionLabel", "before", "intervention", "after", "supportingCopy"]) {
      assert.ok(map[field]?.en && map[field]?.zh, `${id}.${field}`);
    }
  }
  for (const id of ["taishin-p2p-marketplace-platform", "cathay-mortgage-assistant", "booking-taxi-pickup-service-strategy"]) {
    assert.equal(ssot.projects[id].keyInterventionMap, undefined, id);
  }
  for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
    const html = read(page);
    const glance = html.indexOf('id="projectSignals"');
    const map = html.indexOf('id="projectKeyIntervention"');
    const why = html.indexOf('id="projectWhy"');
    assert.ok(glance < map && map < why, page);
    const intervention = html.match(/<section class="key-intervention-map"[\s\S]*?<\/section>/)?.[0] ?? "";
    assert.ok(
      intervention.indexOf('id="projectKeyInterventionFlow"') < intervention.indexOf('class="key-intervention-map__title"'),
      `${page}: the visual flow must remain text-free above; its section title belongs with supporting copy below`,
    );
    assert.ok(
      intervention.indexOf('class="key-intervention-map__title"') < intervention.indexOf('id="projectKeyInterventionSupporting"'),
      `${page}: the section title must directly precede supporting copy`,
    );
  }
  assert.match(app, /status\.startsWith\('verified'\)/);
  assert.match(app, /fields\.every/);
  assert.match(app, /\{en:'Before',zh:'原始狀態'\}/);
  assert.match(app, /\{en:'After',zh:'建立後'\}/);
  assert.doesNotMatch(app, /labels\.before\|\|\{en:'Before'/);
  assert.match(app, /connector\.setAttribute\('aria-hidden','true'\)/);
  assert.ok(app.indexOf("map.before,'is-before'") < app.indexOf("map.intervention,'is-intervention'"));
  assert.ok(app.indexOf("map.intervention,'is-intervention'") < app.indexOf("map.after,'is-after'"));
  assert.match(css, /\.key-intervention-map__flow\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css, /@media\(max-width:760px\)\{\.key-intervention-map__flow\{grid-template-columns:1fr/);
  assert.match(css, /\.key-intervention-map__supporting\{display:grid;gap:var\(--space-3\)/);
  assert.doesNotMatch(css.match(/\/\* Key Intervention Map[\s\S]*$/)?.[0] || "", /overflow-x\s*:\s*(?:auto|scroll)/);
  assert.match(app, /sharedGallery'\)\.hidden=isStage\|\|currentDetail\.type==='project'/);
  assert.match(app, /if\(sectionId==='executive-summary'\)return/);
  assert.match(app, /if\(sectionId==='system-evidence'\)/);
  assert.match(css, /\.project-system-change-v214__row\{[^}]*grid-template-columns:/);
  assert.match(css, /@media\(max-width:760px\)\{\.project-system-change-v214__row\{grid-template-columns:1fr/);
});

test("keeps domain selectors concise and card hover states inside their rails", () => {
  const home = read("assets/js/home.js");
  const domain = read("assets/css/components/domain-selector.css");
  const tokens = read("assets/css/tokens.css");
  assert.doesNotMatch(home, /element\('small','',localize\(item\.cardSubtitle\)\)/);
  assert.doesNotMatch(home, /tab\.querySelector\('small'\)/);
  assert.doesNotMatch(domain, /\.domain-tab__copy>small/);
  assert.match(tokens, /--work-card-hover-transform:\s*translateY\(var\(--dimension-neg-2px\)\)/);
  assert.doesNotMatch(tokens, /--work-card-hover-transform:[^;]*rotate/);
});

test("keeps project metadata on one line and global search in the active language", () => {
  const foundation = read("assets/css/components/foundation.css");
  const overview = read("assets/css/components/project-detail-overview.css");
  const app = read("assets/js/app.js");
  assert.doesNotMatch(foundation, /#detailContext:has\(\.company-name-v132\)\{display:grid/);
  assert.match(foundation, /\.company-context-v132::before\{content:"·"/);
  assert.match(overview, /\.modal-head-meta-v60\{[^}]*align-items:baseline;[^}]*flex-wrap:nowrap/);
  assert.match(overview, /\.modal-head-meta-v60 \.company-name-v132,.modal-head-meta-v60 \.company-context-v132\{[^}]*display:inline/);
  for (const contract of [
    "safeText(title,ui(",
    "input.placeholder=ui(",
    "clearSearch.setAttribute('aria-label',ui(",
    "renderSuggestions();",
    "if(!results.hidden&&input.value.trim())renderResults(input.value)",
  ]) assert.ok(app.includes(contract), contract);
  assert.doesNotMatch(app, /'Site search'/);
});

test("keeps the Hero composition and Domain anchor responsive contracts canonical", () => {
  const tokens = read("assets/css/tokens.css");
  const hero = read("assets/css/components/hero.css");
  const home = read("assets/js/home.js");
  assert.match(tokens, /--hero-title-size:\s*clamp\(5rem,\s*9vw,\s*9rem\)/);
  assert.match(tokens, /--domain-anchor-gap:\s*var\(--space-7\)/);
  assert.match(hero, /\.hero__cta\s*\{[^}]*border-radius:\s*var\(--radius-control\)/);
  assert.match(hero, /\.hero__cta-icon\s*\{[^}]*border-radius:\s*var\(--radius-icon\)/);
  assert.match(hero, /\.hero__cta:hover\s*\{[^}]*background:\s*var\(--portfolio-cyan-500\)[^}]*box-shadow:\s*var\(--hero-cta-shadow-hover\)/);
  for (const contract of [
    "const sectionContent=domainSection.querySelector('.domain-layout')||domainSection",
    "getPropertyValue('--domain-anchor-gap')",
    "contentTop-headerBottom-anchorGap",
    "if(shouldReanchor)",
    "requestAnimationFrame(()=>scrollToDomainStart())",
  ]) assert.ok(home.includes(contract), contract);
  assert.doesNotMatch(home, /stage\.scrollIntoView/);
});

test("keeps project-detail hierarchy line-free, aligned, and unnumbered", () => {
  const overview = read("assets/css/components/project-detail-overview.css");
  const tokens = read("assets/css/tokens.css");
  for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
    assert.doesNotMatch(read(page), /section-index-v45/);
  }
  assert.match(tokens, /--cmp-evidence-section-padding:clamp\(/);
  assert.match(overview, /\.project-signals-v45>div\{[^}]*background:var\(--color-surface\)/);
  assert.match(overview, /\.modal-classification-v45\{[^}]*align-items:start;[^}]*border-left:var\(--dimension-3px\) solid var\(--color-text-accent\)/);
  assert.match(overview, /\.modal-classification-v45__label\{[^}]*padding-block:var\(--dimension-4px\);[^}]*line-height:1.4/);
  assert.match(overview, /\.modal-tags>\*\{[^}]*display:inline-flex;[^}]*align-items:center;[^}]*font-weight:var\(--sys-weight-bold\)/);
  assert.doesNotMatch(overview, /\.modal-tags>\*\{[^}]*(?:border-radius|background):/);
  assert.doesNotMatch(overview, /\.project-signals-v45>div:nth-child\(2\)\{[^}]*grid-column:1\/-1/);
  assert.match(overview, /@media\(max-width:980px\)\{\.detail-commerce-v45\{grid-template-columns:1fr/);
  assert.match(overview, /\.programme-stage-case\{[^}]*width:100%;[^}]*max-width:none/);
  assert.match(overview, /\.programme-stage-case\{[^}]*grid-template-columns:var\(--dimension-32px\) minmax\(var\(--dimension-220px\),.68fr\) minmax\(0,1.32fr\)/);
  for (const columns of [2, 3, 4]) assert.match(overview, new RegExp(`\\.programme-stage-case__proof\\[data-columns="${columns}"\\]\\{grid-template-columns:repeat\\(${columns},minmax\\(0,1fr\\)\\)`));
  assert.doesNotMatch(overview, /\.programme-stage-case__facts\{/);
  assert.match(overview, /\.programme-stage-case__cta\{[^}]*border:0;[^}]*white-space:nowrap/);
  assert.match(overview, /\.modal-gallery-v45\.is-initiative-context \.gallery-stage-v45\{[^}]*height:clamp\(/);
  assert.match(overview, /\.voucher-accountability article\{[^}]*grid-template-rows:auto auto auto/);
  assert.match(overview, /\.voucher-foundation-gallery__change>div\{[^}]*grid-template-rows:auto auto/);
  assert.match(overview, /\.initiative-journey-v103__detail:not\(\.initiative-journey-v103__evidence\)\{[^}]*grid-column:2/);
  assert.match(overview, /\.initiative-journey-v103__evidence\{[^}]*grid-column:2/);
  assert.doesNotMatch(overview, /\.team-impact-item-v47::before/);
  assert.match(overview, /\.ownership-grid-v45 ul\{[^}]*list-style:none/);
  assert.match(overview, /\.ownership-grid-v45 li::before/);
});

test("preserves popup stack, close, and back behavior", () => {
  const app = read("assets/js/app.js");
  for (const contract of ["const detailStack=[]", "detailStack.push", "function returnToParentProject()", "function returnToPreviousDetail()", "currentDetail?.parentKey", "url.searchParams.delete('case')", "addEventListener('click',closeDialog)", "addEventListener('click',returnToPreviousDetail)"]) assert.ok(app.includes(contract), contract);
  assert.match(app, /continuesFromOpenDetail=dialog\.open&&currentDetail/);
  assert.match(app, /currentDetail\?\.type==='stage'\|\|currentDetail\?\.type==='initiative'/);
  assert.match(app, /detailCommerce\.hidden=isStage/);
});

test("supports the r85 Voucher programme without replacing sibling projects", () => {
  const data = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  const voucher = data.projects.voucher;
  assert.equal(voucher.projectModel.renderVariant, "programme-case-with-stage-evidence");
  assert.ok(voucher.programmeInitiatives);
  assert.match(app, /function renderProgrammeParent/);
  const labels = Object.values(data.localizationRegistry.runtimeUiLabels).map((value) => value.en);
  assert.ok(labels.includes("One journey—from research signals to product decisions"));
  assert.match(app, /'View related work →'/);
  assert.match(app, /'查看相關作品 →'/);
  for (const retired of ["Explore ${evidenceCount}", "view-stage-case-297e5a01", "label:stage.title||stage.label"]) assert.ok(!app.includes(retired), retired);
  assert.match(app, /label:stage\.label/);
  assert.match(app, /transformation:stage\.title/);
  assert.match(app, /value&&value\.trim\(\)\.toLocaleLowerCase\(\)!==shippedTitle\.trim\(\)\.toLocaleLowerCase\(\)/);
  assert.match(app, /cta\.dataset\.stage=stage\.id/);
  assert.doesNotMatch(app, /Detailed case and approved imagery are being prepared/);
  assert.match(app, /currentDetail\?\.type==='stage'/);
  assert.match(app, /url\.searchParams\.delete\('stage'\)/);
  assert.ok(labels.includes("One shared system behind all five journey stages"));
  assert.doesNotMatch(app, /Capability added:/);
  assert.ok(labels.includes("REPRESENTATIVE SHIPPED WORK"));
  assert.ok(labels.includes("DELIVERY STATUS"));
  assert.match(app, /'button button--dark programme-stage-case__cta'/);
  assert.doesNotMatch(css, /\.programme-stage-case[^}]*transform:translateY/);
  assert.match(css, /\.voucher-stage-summary article\.is-response\{[^}]*color:var\(--color-text-on-dark-primary\)/);
  assert.match(css, /\.voucher-stage-summary article\.is-response small\{color:var\(--color-text-on-dark-secondary\)/);
  assert.match(app, /\['Marketing','Consistent messaging'/);
  assert.doesNotMatch(app, /\['CRM \/ Marketing'/);
  assert.match(app, /role','tablist'/);
  assert.match(app, /ArrowLeft','ArrowRight/);
  assert.ok(labels.includes("My accountability"));
  assert.match(app, /const isProgrammeChild=currentDetail\?\.type==='initiative'\|\|isJourneyStage/);
  assert.doesNotMatch(app, /dataset\.stageBack/);
  assert.match(app, /type==='stage'/);
  assert.match(app, /deepLinkedStage/);
  assert.match(app, /deepLinkedInitiative&&DATA\.projects/);
  assert.ok(data.projects["voucher-center"]);
  assert.ok(data.projects["game-center"]);
  assert.match(css, /\.programme-surface-v103/);
  assert.match(css, /\.voucher-decision-journey__thesis/);
  assert.match(css, /\.programme-stage-cases/);
  assert.match(css, /\.programme-stage-case__proof/);
  assert.match(css, /\.voucher-foundation-gallery/);
  assert.match(css, /\.voucher-foundation-gallery__tab\[aria-selected="true"\]/);
  assert.match(css, /\.voucher-stage-summary/);
  assert.match(css, /\.voucher-stage-decision-list/);
  assert.match(app, /createDecisionCard/);
  assert.doesNotMatch(css, /\.voucher-stage-evidence-card/);
  assert.doesNotMatch(css, /\.stage-parent-link/);
  assert.doesNotMatch(css, /overflow-wrap:anywhere/);
});

test("preserves search interaction while using r85 as the active inventory", () => {
  const home = read("assets/js/home.js");
  const html = read("index.html");
  const content = JSON.parse(read("content/portfolio-content.json"));
  const search = read("assets/css/components/search.css");
  const cards = read("assets/css/components/project-card.css");
  for (const contract of ["let mode='idle'", "setWorkspace('matched',before)", "setMatcherState('loading',keep)", "pendingResultFocus=true"]) assert.ok(home.includes(contract), contract);
  const labels = Object.values(content.localizationRegistry.runtimeUiLabels).map((value) => value.en);
  for (const label of ["Why it fits", "Evidence"]) assert.ok(labels.includes(label), label);
  for (const contract of ["p.card_outcome", "localize(v)"]) assert.ok(home.includes(contract), contract);
  for (const contract of ["matcherSuggestions", "match-project-grid"]) assert.ok(html.includes(contract), contract);
  assert.ok(Object.values(content.localizationRegistry.staticPageCopy).some(value=>value.en==='Most relevant projects'));
  assert.equal(Object.keys(content.projects).length, 13);
  const publicExplorations = [...Object.values(content.sideProjects), ...Object.values(content.experiments)]
    .filter((item) => !String(item.contentStatus || "").includes("standalone-card-review"));
  assert.equal(publicExplorations.length, 6);
  const app = read("assets/js/app.js");
  assert.match(app, /const intentCatalog=list\(raw\.contentDiscovery\?\.queryIntentCatalog\)/);
  assert.match(app, /searchIndexV2:p\.searchIndexV2\|\|\{\}/);
  assert.match(app, /const searchEntities=query=>/);
  assert.match(app, /Number\(weights\.queryIntent\)\|\|85/);
  assert.match(app, /Number\(weights\.problemTag\)\|\|75/);
  assert.match(app, /Number\(weights\.capabilityTag\)\|\|55/);
  assert.match(app, /reasons\.map\(item=>item\.label\)/);
  assert.doesNotMatch(app, /profiles:\[\]|matcher:\{\}/);
  for (const project of Object.values(content.projects)) {
    assert.ok(project.searchIndexV2, "every canonical project must expose searchIndexV2");
    if (project.searchIndexV2.intentIds) assert.ok(project.searchIndexV2.intentIds.length >= 1, project.searchIndexV2.canonicalId);
    if (project.searchIndexV2.problemTags) assert.ok(project.searchIndexV2.problemTags.en.length >= 1, project.searchIndexV2.canonicalId);
  }
  assert.doesNotMatch(html, /How can we handle exceptions without slowing the main flow\?/);
  assert.doesNotMatch(html.match(/<section aria-labelledby="matchProjectsTitle"[\s\S]*?<\/section>/)?.[0] ?? "", /data-rail|carousel|rail-controls/);
  assert.doesNotMatch(search, /related-project-card/);
  assert.match(search, /\.chip\{[^}]*white-space:nowrap/);
  assert.match(html, /matcher-submit-arrow-v45 icon-arrow icon-arrow--right/);
  assert.doesNotMatch(search, /\.matcher-submit-arrow-v45::(?:before|after)/);
  assert.match(search, /\.matcher-chapter\{[\s\S]*?scroll-margin-top:calc\(-1 \* var\(--space-6\)\)/);
  assert.match(search, /@media\(max-width:560px\)[\s\S]*\.matcher-form\{grid-template-columns:minmax\(0,1fr\) var\(--dimension-44px\);min-height:var\(--dimension-52px\)/);
  assert.match(search, /@media\(max-width:560px\)[\s\S]*\.matcher-input\{min-height:var\(--dimension-44px\)/);
  assert.match(search, /@media\(max-width:560px\)[\s\S]*\.matcher-submit-v45\{[^}]*height:var\(--dimension-44px\);[^}]*border-radius:50%/);
  assert.match(cards, /\.match-project-grid \.related-project-card-v45/);
  assert.match(search, /@media\(max-width:900px\)[\s\S]*\.matcher-workspace,.matcher-workspace\.has-result\{grid-template-columns:1fr;gap:var\(--space-6\)/);
  assert.match(search, /@media\(max-width:900px\)[\s\S]*\.matcher-workspace\.has-result \.matcher-result\{padding-top:0\}/);
  for (const contract of ["const target=mode==='matched'?resultContent:noResult", "target.scrollIntoView({block:'start',behavior:'auto'})", "const desiredTop=Math.max(headerBottom,stickyBottom)+spacing"]) assert.ok(home.includes(contract), contract);
  assert.doesNotMatch(home, /syncQueryState|sessionStorage|portfolioMatcherState/);
  assert.doesNotMatch(html, /data-session-state|portfolioMatcherState/);
});

test("keeps Domain as one responsive, accessible owner", () => {
  const html = read("index.html");
  const home = read("assets/js/home.js");
  const base = read("assets/css/base.css");
  const domain = read("assets/css/components/domain-selector.css");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "DomainSelector");
  assert.equal(entry.contentOwner, "content/portfolio-content.json");
  assert.doesNotMatch(base, /(?:^|[\s>+~,.#:\[])\.domain(?:-|\b)/m);
  assert.doesNotMatch(html, /domainMobileSelect|domain-mobile-picker|data-rail="" id="domainChipRail"/);
  assert.doesNotMatch(home, /domainMobileSelect|desktopDomainMedia/);
  for (const contract of ["compactDomainMedia", "aria-hidden", "scheduleDomainFloatingNav", "scrollToDomainStart", "contentTop-headerBottom-anchorGap", "a[href=\"#domains\"]", "ArrowRight", "ArrowDown", "Home", "End"]) assert.ok(home.includes(contract), contract);
  assert.match(html, /class="page-shell domain-layout"><div class="domain-sidebar">[\s\S]*?id="domainChipRail"[\s\S]*?class="domain-stage"/);
  for (const contract of [".domain-sidebar{position:sticky", ".domain-selectors{display:flex", ".domain-content-v41{grid-template-columns:1fr", "safe-area-inset-bottom", "prefers-reduced-motion:reduce", "forced-colors:active"]) assert.ok(domain.includes(contract), contract);
  assert.doesNotMatch(domain, /!important|overflow-wrap:anywhere/);
});

test("keeps horizontal rails operable, visible, and singly owned", () => {
  const base = read("assets/css/base.css");
  const rail = read("assets/css/components/horizontal-rail.css");
  const tokens = read("assets/css/tokens.css");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "HorizontalRail");
  assert.equal(entry.cssOwner, "assets/css/components/horizontal-rail.css");
  assert.doesNotMatch(base, /\[data-rail\]|(?:^|[\s>+~,.#:])(?:rail-(?:button|controls|heading)\b|project-card-rail\b|no-match-project-list-v45\b|domain-project-list-v30\b|detail-related-rail-v45\b|experiment-index-rail-v36\b|profile-side-rail-v34\b|playground-grid\b|work-filter-v32\b)/m);
  for (const contract of ["[data-rail]{","scrollbar-width:thin","scroll-snap-stop:always","-webkit-mask-image:none",".rail-button:hover:not(:disabled)","@media(max-width:900px)","@media(max-width:600px)","@media(prefers-reduced-motion:reduce)","@media(forced-colors:active)"]) assert.ok(rail.includes(contract), contract);
  assert.match(rail, /--rail-edge:\s*var\(--space-2\)/);
  assert.match(rail, /\[data-rail\]\{[^}]*width:100%[^}]*max-width:100%[^}]*margin-inline:0[^}]*padding-inline:var\(--rail-edge\)/);
  for (const contract of [
    /--rail-visible-columns:\s*3/,
    /--rail-card-project:\s*calc\(\(100% - \(var\(--rail-visible-columns\) - 1\) \* var\(--rail-gap\)\) \/ var\(--rail-visible-columns\)\)/,
    /\.domain-project-list-v30\)\{display:grid;grid-auto-flow:column;grid-auto-columns:calc\(\(100% - var\(--rail-gap\)\)\/2\)/,
    /@media\(max-width:900px\)\{.*?--rail-visible-columns:2/,
    /@media\(max-width:600px\)\{.*?--rail-visible-columns:1/,
    /\.domain-project-list-v30\{grid-auto-columns:100%\}/
  ]) assert.match(rail.replace(/\s+/g," "), contract);
  assert.doesNotMatch(rail, /width:calc\(100% \+|margin-inline:calc\([^)]*\* -1\)/);
  for (const scroller of [".domain-floating-nav-v52__rail", ".domain-selectors", ".chip-rail", ".match-project-grid", ".modal-head-meta-v60", ".gallery-thumbs-v45", ".programme-chapters-v116", ".programme-journey-map-v106", ".programme-evolution-v106", ".voucher-foundation-gallery__tabs"]) assert.ok(rail.includes(scroller), scroller);
  assert.match(rail, /unobscured content edge/);
  assert.match(rail, /padding-block:var\(--experiment-card-state-safe-block\) var\(--space-8\)/);
  assert.match(rail, /\.domain-project-list-v30\)\{display:grid;grid-auto-flow:column;grid-auto-columns:/);
  assert.match(rail, /--rail-domain-pad-block-start:\s*var\(--space-3\)/);
  assert.match(rail, /--rail-domain-pad-block-end:\s*var\(--space-3\)/);
  assert.match(rail, /\.domain-project-list-v30\)\{[^}]*padding-block:var\(--rail-domain-pad-block-start\) var\(--rail-domain-pad-block-end\)/);
  assert.doesNotMatch(read("assets/css/components/domain-selector.css"), /\.domain-project-list-v30\{[^}]*(?:width|gap|grid-auto-columns)/);
  assert.match(tokens, /--interactive-state-safe-area:\s*var\(--space-4\)/);
  assert.match(tokens, /--experiment-card-state-safe-block:\s*var\(--space-6\)/);
  assert.doesNotMatch(rail, /!important|overflow-wrap:anywhere|word-break:break-all|scrollbar-width:none/);
});

test("uses one canonical SVG arrow system and consistent supplemental headings", () => {
  const base = read("assets/css/components/arrow-icon.css");
  const app = read("assets/js/app.js");
  const domain = read("assets/css/components/domain-selector.css");
  const selected = read("assets/css/components/selected-evidence.css");
  assert.equal(fs.existsSync(new URL("assets/img/arrow.svg", site)), true);
  assert.match(read("assets/img/arrow.svg"), /stroke-width="2"/);
  assert.match(base, /mask:url\("\/site\/assets\/img\/arrow\.svg"\)/);
  assert.match(base, /background-color:currentColor/);
  for (const direction of ["down","right","up","left","up-right","down-right","down-left","up-left"]) {
    assert.ok(base.includes(`.icon-arrow--${direction}`), direction);
  }
  assert.match(app, /function decorateDocumentArrows\(\)/);
  assert.match(app, /\[data-copy-key\][\s\S]*?decorateArrow\(node\)/);
  assert.match(app, /const arrowObserver=new MutationObserver/);
  assert.match(app, /node\.children\?\.length/);
  assert.match(domain, /\.domain-panel-v30--projects>h4\{[\s\S]*?text-transform:none/);
  assert.match(selected, /\.evidence-list__item:hover\{[^}]*border-radius:var\(--work-card-hover-radius\)[^}]*box-shadow:var\(--work-card-hover-shadow\)[^}]*transform:var\(--work-card-hover-transform\)/);
});

test("keeps popup navigation and related work in their canonical owners", () => {
  const base = read("assets/css/base.css");
  const shell = read("assets/css/components/popup-shell.css");
  const overview = read("assets/css/components/project-detail-overview.css");
  const app = read("assets/js/app.js");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const popup = registry.components.find((component) => component.component === "PopupShell");

  assert.equal(popup.cssOwner, "assets/css/components/popup-shell.css");
  assert.doesNotMatch(base, /\.(?:detail-related-v45)(?:-|__|\b)/);
  for (const contract of [
    ".detail-related-v45{",
    "@media(max-width:900px)",
    "@media(max-width:600px)",
  ]) assert.ok(overview.includes(contract), contract);
  for (const contract of [
    "env(safe-area-inset-top)",
    "var(--dialog-control-inset-block)",
    "var(--popup-control-inset-inline)",
    ".global-search-v114__close.modal-close",
    ".modal-back-v66[hidden]",
    "@media (prefers-reduced-motion: reduce)",
  ]) assert.ok(shell.includes(contract), contract);
  for (const contract of [
    "function returnToPreviousDetail()",
    "dialog?.addEventListener('cancel'",
    "rootInvoker?.focus()",
    "dialogTitle.focus({preventScroll:true})",
  ]) assert.ok(app.includes(contract), contract);
  assert.doesNotMatch(shell, /!important|overflow-wrap:anywhere|word-break:break-all/);
});

test("keeps the Work library filters readable and singly owned", () => {
  const base = read("assets/css/base.css");
  const work = read("assets/css/components/work-library.css");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "WorkLibrary");
  assert.equal(entry.cssOwner, "assets/css/components/work-library.css");
  assert.doesNotMatch(base, /(?:^|[\s>+~,.#:])\.(?:work-filter-(?:chip|shell|controls)|work-library-v(?:32|44)(?:-|__|\b)|work-archive-v33(?:-|__|\b))/m);
  for (const contract of [
    ".work-filter-chip {",
    ".work-filter-chip[aria-pressed=\"true\"]",
    ".work-filter-chip:focus-visible",
    "@media(max-width:700px)",
    "@media(max-width:380px)",
    "@media(prefers-reduced-motion:reduce)",
    "@media(forced-colors:active)",
  ]) assert.ok(work.includes(contract), contract);
  assert.doesNotMatch(work, /!important|overflow:hidden|overflow-wrap:anywhere|word-break:break-all|#[a-f0-9]{3,8}\b/i);
});

test("uses the SSOT-owned many-to-many Work filter mapping", () => {
  const data = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const filters = data.workIndex.workFilters;
  const allProjects = Object.keys(data.projects);
  assert.equal(filters[0].id, "all");
  assert.deepEqual(new Set(filters[0].projectIds), new Set(allProjects));
  for (const filter of filters) {
    assert.ok(filter.label.en && filter.label.zh);
    assert.ok(filter.projectIds.length > 0, filter.id);
    assert.equal(new Set(filter.projectIds).size, filter.projectIds.length, filter.id);
    filter.projectIds.forEach((id) => assert.ok(data.projects[id], `${filter.id}: ${id}`));
  }
  allProjects.forEach((id) => assert.ok(filters.some((filter) => filter.id !== "all" && filter.projectIds.includes(id)), id));
  assert.deepEqual(
    new Set(filters.find((filter) => filter.id === "zero").projectIds),
    new Set(["payment", "game-center", "ctbc-mortgage-self-service-app", "bandzo", "taishin-p2p-marketplace-platform", "cathay-mortgage-assistant", "booking-taxi-pickup-service-strategy"]),
  );
  assert.match(app, /workFilterIdsForProject/);
  assert.match(app, /dataset\.workCategories/);
  assert.doesNotMatch(app, /function workCategory\(/);
});

test("keeps Experiment as one responsive, recruiter-scannable owner", () => {
  const home = read("index.html");
  const html = read("experiments.html");
  const base = read("assets/css/base.css");
  const experiment = read("assets/css/components/experiment-card.css");
  const app = read("assets/js/app.js");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "ExperimentExperience");
  assert.equal(entry.contentOwner, "content/portfolio-content.json");
  assert.doesNotMatch(base, /(?:^|[\s>+~,#:])\.(?:experiment(?:-|\b)|poster(?:-|\b)|playground-hero(?:-|\b)|play-shape(?:-|\b)|play-line\b|shape-(?:circle|pill|small)\b)/m);
  assert.equal((html.match(/class="experiment-card-action"/g) ?? []).length, 4);
  assert.equal((html.match(/class="experiment-index-card-v38__learning"><small/g) ?? []).length, 3);
  assert.equal((home.match(/class="poster-action"/g) ?? []).length, 3);
  for (const contract of [".experiment-feature-card-v32{display:grid", ".experiment-index-card-v36{display:flex", ".quick-view-v51--experiment{grid-template-columns:1fr;gap:var(--space-4)", ".quick-view-v51--experiment>.info-grid-v45{grid-column:auto;grid-template-columns:repeat(2,minmax(0,1fr))", ".experiment-overview-v45__question,.experiment-overview-v45__build{min-width:0;padding:0;border-radius:0;background:transparent}", ".experiment-sequence-v45{display:grid", "@media(max-width:560px)", "prefers-reduced-motion:reduce"]) assert.ok(experiment.includes(contract), contract);
  assert.match(app, /ui\([^)]*\),prototypeText/);
  for (const contract of [".detail-experiment-card-v101{", ".detail-experiment-card-v101__question", ".detail-experiment-card-v101__learning", ".detail-experiment-card-v101:is(:hover,:focus-visible) .experiment-card-action", "--experiment-card-cta-hover-inverse"]) assert.ok(experiment.includes(contract), contract);
  assert.match(experiment, /\.motion-ready \[data-motion-reveal\]\.is-inview\.poster:nth-child\(odd\)[\s\S]*?transform:var\(--experiment-card-rest-odd\)/);
  assert.match(experiment, /\.motion-ready \[data-motion-reveal\]\.is-inview:is\(\.poster,.experiment-feature-card-v32,.experiment-index-card-v36,.detail-experiment-card-v101\):is\(:hover,:focus-visible\)\{transform:var\(--experiment-card-hover-transform\)\}/);
  assert.doesNotMatch(experiment, /\.detail-experiment-card-v101:hover\{[^}]*var\(--work-card-hover-transform\)/);
  assert.match(app, /type==='experiment'\?'detail-related-card-v45 detail-experiment-card-v101':'detail-related-card-v45'/);
  assert.match(app, /element\('p','detail-experiment-card-v101__question',localize\(item\.question\)\)/);
  assert.doesNotMatch(experiment, /!important|overflow-wrap:anywhere|word-break:break-all/);
});

test("keeps Profile as one truthful, responsive recruitment experience", () => {
  const html = read("profile.html");
  const base = read("assets/css/base.css");
  const profile = read("assets/css/components/profile-card.css");
  const interests = read("assets/css/components/profile-interest-mosaic.css");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "ProfileExperience");
  assert.equal(entry.cssOwner, "assets/css/components/profile-card.css");
  const profileCopy=Object.values(JSON.parse(read("content/portfolio-content.json")).localizationRegistry.staticPageCopy).map(value=>value.en);
  assert.ok(profileCopy.some(value=>value.includes('I turn complex rules into')));
  assert.ok(profileCopy.some(value=>value.includes('10+ years across regulated operations')));
  assert.ok(profileCopy.some(value=>value.includes('Explorations with verified recognition')));
  assert.equal((html.match(/class="experiment-index-card-v36(?:\s[^"]*)?"/g) ?? []).length, 4);
  assert.equal((html.match(/class="experiment-card-action"/g) ?? []).length, 4);
  assert.doesNotMatch(html, /profile-side-card-v34|not award claims/);
  assert.doesNotMatch(base, /(?:^|[\s>+~,#:])\.(?:profile-(?:hero-v36|value-v44|value-v55|chronology-v34|awards-v36|side-projects-v34|side-card-v34|side-card-v52|credentials-v55|interests-v39)(?:-|__|\b)|career-timeline-v34(?:-|__|\b)|timeline-evidence(?:-|__|\b)|award-list-v36(?:-|__|\b)|interest-(?:mosaic-v39|tile-v39)(?:-|__|\b))/m);
  for (const contract of ["@media (max-width: 1100px)", "@media (max-width: 760px)", "@media (max-width: 560px)", "prefers-reduced-motion: reduce", ".timeline-evidence-v34 {", ".profile-side-projects-v34__head {"]) assert.ok(profile.includes(contract), contract);
  for (const contract of ["@media (max-width: 900px)", "@media (max-width: 560px)", ".interest-tile-v39 a {"]) assert.ok(interests.includes(contract), contract);
  assert.doesNotMatch(profile + interests, /!important|overflow-wrap:anywhere|word-break:break-all/);
});

test("keeps responsive, keyboard, and reduced-motion contracts", () => {
  const css = read("assets/css/production." + read("index.html").match(/production\.([a-f0-9]{16})\.css/)?.[1] + ".css");
  for (const contract of ["focus-visible", "prefers-reduced-motion", "forced-colors", "scroll-snap-stop:always", "matcher-workspace.has-result"]) assert.ok(css.includes(contract), contract);
});

test("keeps tokenized canonical dimensions outside breakpoints", () => {
  const files = ["assets/css/base.css", ...fs.readdirSync(new URL("assets/css/components/", site)).filter((name) => name.endsWith(".css")).map((name) => `assets/css/components/${name}`)];
  const raw = /(?<![-\w])(?:\d+\.\d+|\d+|\.\d+)(?:px|rem|em|vw|vh|vmin|vmax|ch|ms|s|deg)\b/;
  for (const file of files) {
    const source = read(file).replace(/@media\s*\([^)]*(?:min|max)-(?:width|height)\s*:\s*\d+px[^)]*\)/g, "@media(verified-breakpoint)").replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(source, raw, file);
  }
});

test("preserves fractional negative design tokens without tenfold magnification", () => {
  const tokens = read("assets/css/tokens.css");
  assert.match(tokens, /--dimension-neg--045em:\s*-\.045em;/);
  assert.match(tokens, /--dimension-neg--055em:\s*-\.055em;/);
  assert.match(tokens, /--dimension-neg--8deg:\s*-\.8deg;/);
  assert.doesNotMatch(tokens, /--dimension-neg--045em:\s*-\.45em;/);
  assert.doesNotMatch(tokens, /--dimension-neg--8deg:\s*-8deg;/);
});

test("keeps the homepage Hero as one accessible, responsive owner", () => {
