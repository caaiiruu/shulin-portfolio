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
  const exclusive = live.filter((entry) => entry.exclusiveOwner !== false);
  assert.equal(new Set(exclusive.map((entry) => entry.cssOwner)).size, exclusive.length);
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

test("keeps one shared FloatingNavigator outside the scroll container at every viewport", () => {
  const projectDetail = read("assets/css/components/project-detail-overview.css");
  const tokens = read("assets/css/tokens.css");
  assert.doesNotMatch(projectDetail, /\.pd-section-nav:not\(\.floating-navigator\)/);
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
  assert.equal(ssot.contentVersion, "2026-08-12-r158");
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
  assert.doesNotMatch(app, /renderDeliveryStatus\(localizedField\(item,'status'\)\)/);
  assert.match(app, /if\(isStage\)[\s\S]*?renderDeliveryStatus\(''\)/);
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
  assert.match(foundation, /\.company-separator-v159\{[^}]*margin:0;[^}]*padding:0/);
  assert.doesNotMatch(foundation, /\.company-context-v132::before\{content:"·"/);
  assert.match(app, /element\('span','company-separator-v159','·'\)/);
  assert.match(overview, /\.modal-head-meta-v60\{[^}]*align-items:baseline;[^}]*flex-wrap:nowrap/);
  assert.match(overview, /\.modal-head-meta-v60 \.company-name-v132,.modal-head-meta-v60 \.company-separator-v159,.modal-head-meta-v60 \.company-context-v132\{[^}]*display:inline/);
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
  assert.match(overview, /\.project-signals-v45>div\{[^}]*border-bottom:var\(--dimension-1px\) solid var\(--color-border\)[^}]*background:transparent/);
  assert.match(overview, /\.modal-classification-v45\{[^}]*align-items:start;[^}]*border-left:var\(--dimension-3px\) solid var\(--color-border-strong\)/);
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

test("supports the recruiter-first Voucher programme without replacing sibling projects", () => {
  const data = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  const voucher = data.projects.voucher;
  assert.equal(voucher.projectModel.renderVariant, "programme-case-with-stage-evidence");
  assert.ok(voucher.programmeInitiatives);
  assert.equal(Object.keys(data.projects).length, 13);
  assert.match(app, /function renderProgrammeParent/);
  assert.match(app, /'View solution details'/);
  assert.match(app, /'查看解決方案細節'/);
  assert.match(app, /programme-stage-case__cta[^\n]*icon-arrow--right/);
  assert.doesNotMatch(app, /'View related work →'|'查看相關作品 →'/);
  assert.match(app, /const stageProjection=parent\.recruiterFirstPopup/);
  assert.match(app, /voucher-r149-decision-list voucher-stage-decision-list/);
  assert.match(app, /function createFeaturedDecisionGroup\(/);
  assert.match(app, /createDecisionCard\(model,index,\{projectKey,showVisual:showVisual&&Boolean\(model\.evidenceAssetId\)\}\)/);
  assert.match(app, /card\.querySelector\('\.decision-visual-v58\.evidence-frame'\)/);
  assert.match(app, /createFeaturedDecisionGroup\(decision,index,\{projectKey:key,showVisual:showDecisionVisuals/);
  assert.match(app, /'WHAT I DECIDED'/);
  assert.match(app, /currentDetail\?\.type==='stage'/);
  assert.match(app, /url\.searchParams\.delete\('stage'\)/);
  assert.match(css, /\.voucher-r149-stage/);
  assert.match(css, /\.voucher-stage-surface/);
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
  for (const contract of ["window.PORTFOLIO_RUNTIME_DATA", "p.search_evidence_pair", "p.what_this_proves", "localize(v)"]) assert.ok(home.includes(contract), contract);
  assert.doesNotMatch(home, /p\.card_outcome|p\.domain_proof/);
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
  for (const scroller of [".domain-selectors", ".chip-rail", ".match-project-grid", ".modal-head-meta-v60", ".gallery-thumbs-v45", ".programme-chapters-v116", ".programme-journey-map-v106", ".programme-evolution-v106", ".voucher-foundation-gallery__tabs"]) assert.ok(rail.includes(scroller), scroller);
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

test("keeps Voucher child stages canonical, deterministic, and shared", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  const stages = ssot.projects.voucher.recruiterFirstPopup.stages;
  assert.deepEqual(Object.fromEntries(stages.map((stage) => [stage.id, stage.decisions.length])), {
    discover: 2, qualify: 1, activate: 1, redeem: 1, review: 1,
  });
  const evidence = stages.flatMap((stage) => stage.decisions.map((decision) => decision.evidence.assetId));
  assert.deepEqual(evidence, [
    "voucher-offer-stage-discover-pdp-before-shipped-01",
    "voucher-offer-stage-discover-voucher-details-concept-eligibility-tracker-01",
    "voucher-offer-stage-qualify-voucher-details-eligibility-before-shipped-01",
    "voucher-offer-stage-activate-sec-campaign-entry-wallet-flow-shipped-01",
    "voucher-offer-stage-redeem-wallet-applicability-error-recovery-before-shipped-01",
    "voucher-offer-stage-review-payment-voucher-selection-review-shipped-01",
  ]);
  for (const stage of stages) for (const decision of stage.decisions) {
    for (const field of ["whatIDecided", "whyThisChoice", "whatThisRequired", "outcome"]) {
      assert.ok(decision[field].en && decision[field].zh, `${stage.id}: ${field}`);
    }
    assert.doesNotMatch(JSON.stringify(decision), /To be added|EFFECT/);
  }
  assert.match(app, /Stage links keep their native canonical href/);
  assert.doesNotMatch(app, /const stage=event\.target\.closest\('\[data-stage\]'\)/);
  assert.match(app, /nextUrl\.searchParams\.set\('stage',nextStage\.id\)/);
  assert.match(app, /voucher-stage-decision__grid/);
  assert.match(css, /\.voucher-stage-decision__grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:600px\)\{\.voucher-stage-decision__grid\{grid-template-columns:1fr\}/);
  assert.match(css, /\.voucher-r149-metrics,\.impact-evidence-v147__metrics\{grid-template-columns:1fr\}/);
  assert.match(app, /voucher-stage-surface case-study-cloud-emphasis core-system-insight-section/);
  assert.match(css, /\.case-study-cloud-emphasis::before,\.case-study-cloud-emphasis::after/);
  assert.doesNotMatch(css, /M553\.077 103\.851|M1727\.15 0C1714\.02/);
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
    "if(!dialog.open){setDialogOpenState(true)",
  ]) assert.ok(app.includes(contract), contract);
  assert.doesNotMatch(shell, /!important|overflow-wrap:anywhere|word-break:break-all/);
  assert.match(overview, /\.case-study-cloud-emphasis\{[^}]*var\(--portfolio-cloud-surface/);
  assert.doesNotMatch(overview.match(/\.voucher-r149-insight\{[^}]*\}/)?.[0] ?? "", /box-shadow|clip-path|dimension-100vw/);
  assert.match(overview, /\.detail-related-v45\{[^}]*gap:var\(--section-heading-content-gap\)/);
  assert.match(app, /querySelector\('#detailRelated \.kicker'\)\?\.remove\(\)/);
  assert.match(app, /controlsHead\.hidden=!scrollable/);
  assert.doesNotMatch(app, /scheduleProjectSectionFrame\(transaction,animate\)/);
  assert.match(app, /getBoundingClientRect\(\)\.top<=offset\+2/);
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
  const html = read("index.html");
  const base = read("assets/css/base.css");
  const hero = read("assets/css/components/hero.css");
  const transformation = read("assets/img/hero-transformation-system.svg");
  const resolvedArtwork = read("assets/img/hero-clarity-system.svg");
  assert.equal((html.match(/<section class="hero"/g) ?? []).length, 1);
  assert.equal((html.match(/hero-clarity-system\.svg/g) ?? []).length, 1);
  const heroCopy=Object.values(JSON.parse(read("content/portfolio-content.json")).localizationRegistry.staticPageCopy);
  assert.ok(heroCopy.some(value=>value.en==='Turn confusion into clear systems'&&value.zh==='把混亂轉化為清晰的系統'));
  assert.ok(heroCopy.some(value=>value.en==='Turn confusion<br>into'&&value.zh==='把混亂<br>轉化為'));
  assert.match(html, /data-copy-html-key="index\.turn-confusion-br-into-/);
  assert.match(read("assets/css/tokens.css"), /--hero-title-size-zh-wide:\s*clamp\(8\.75rem,\s*9\.8vw,\s*140pt\)/);
  assert.match(read("assets/css/tokens.css"), /--hero-title-scale-zh-compact:\s*\.96/);
  assert.match(read("assets/css/tokens.css"), /--hero-title-measure-zh:\s*3\.2em/);
  assert.match(hero, /html:lang\(zh\) \.hero__title,\s*html:lang\(zh\) \.hero__outcome\s*\{\s*font-size:var\(--hero-title-size-zh-wide\)/);
  assert.match(hero, /html:lang\(zh\) \.hero__title\{max-width:var\(--hero-title-measure-zh\)\}/);
  assert.match(hero, /@media \(max-width: 1100px\)[\s\S]*font-size:calc\(var\(--hero-title-size\) \* var\(--hero-title-scale-zh-compact\)\)/);
  assert.match(hero, /@media \(max-width: 1100px\)/);
  assert.match(hero, /@media \(max-width: 760px\)/);
  assert.match(hero, /translateX\(var\(--hero-transformation-shift-mobile\)\)/);
  assert.match(hero, /inset-inline-start:\s*var\(--hero-artwork-start-narrow\)/);
  assert.match(hero, /@media \(max-width: 430px\)/);
  assert.match(hero, /prefers-reduced-motion: reduce/);
  assert.match(hero, /@keyframes hero-hand-enter/);
  assert.match(transformation, /animation-duration:\s*4\.2s/);
  assert.match(transformation, /animation-delay:\s*\.9s/);
  assert.match(transformation, /7\.7%[\s\S]*15\.4%/);
  assert.match(resolvedArtwork, /viewBox="0 0 799 459"/);
  assert.match(resolvedArtwork, /M521\.997 233\.563/);
  assert.match(resolvedArtwork, /M585\.139 222\.155/);
  assert.match(resolvedArtwork, /\.hero-final-flame\{display:none\}/);
  assert.match(transformation, /\.hero-grip-reveal\s*\{\s*display:\s*none;/);
  assert.match(transformation, /attributeName="d"[\s\S]*keyTimes="0;0\.333;0\.667;1"/);
  assert.doesNotMatch(transformation, /hero-flame-frame/);
  assert.doesNotMatch(base, /(^|[\s>+~,:])\.hero(?=$|[\s>+~.#:[(]|-|__)/m);
});

test("keeps global search focus on the complete form frame", () => {
  const chrome = read("assets/css/components/site-chrome.css");
  assert.match(chrome, /\.global-search-v114__form:focus-within\s*\{[^}]*border-color:\s*var\(--color-focus\);[^}]*box-shadow:\s*var\(--shadow-focus\)/s);
  assert.match(chrome, /\.global-search-v114__input\s*\{[^}]*border:\s*0;[^}]*box-shadow:\s*none;/s);
  assert.match(chrome, /\.global-search-v114__input:focus,\s*\.global-search-v114__input:focus-visible\s*\{[^}]*outline:\s*0;[^}]*box-shadow:\s*none;/s);
  assert.match(read("assets/css/components/foundation.css"), /:not\(\[data-focus-managed\]\):focus-visible/);
  assert.match(read("assets/js/app.js"), /input\.dataset\.focusManaged='true'/);
  assert.match(chrome, /@media \(max-width: 600px\)[\s\S]*\.global-search-v114__form\s*\{[^}]*border:\s*var\(--dimension-2px\) solid var\(--color-border-strong\)/s);
  assert.doesNotMatch(chrome, /@media \(max-width: 600px\)[\s\S]*\.global-search-v114__input\s*\{[^}]*border:\s*var\(--dimension-2px\)/s);
});

test("keeps homepage evidence readable and singly owned across viewports", () => {
  const base = read("assets/css/base.css");
  const evidence = read("assets/css/components/homepage-evidence.css");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "HomepageEvidence");
  assert.equal(entry.cssOwner, "assets/css/components/homepage-evidence.css");
  assert.doesNotMatch(base, /\.(?:experience-(?:proof|metrics|orgs|org-group)|metric-(?:value|number|unit)|principle-(?:cards|card|evidence)|principles-v)/);
  for (const contract of [
    ".experience-metrics-v42 {",
    "grid-template-columns: repeat(4, minmax(0, 1fr))",
    ".experience-orgs-v44__list {",
    "flex-wrap: wrap",
    ".principle-node__trigger:focus-visible",
    "@media (max-width: 900px)",
    "@media (max-width: 700px)",
    "@media (max-width: 380px)",
    ".principle-constellation { grid-template-columns: 1fr; }",
    "prefers-reduced-motion: reduce",
  ]) assert.ok(evidence.includes(contract), contract);
  assert.doesNotMatch(evidence, /!important|overflow-wrap:anywhere|word-break:break-all|overflow-x:\s*auto/);
});

test("keeps supporting page openings responsive and singly owned", () => {
  const base = read("assets/css/base.css");
  const layout = read("assets/css/components/supporting-page-layout.css");
  const cards = read("assets/css/components/project-card.css");
  const registry = JSON.parse(read("docs/design-system/registry.json"));
  const entry = registry.components.find((component) => component.component === "SupportingPageLayout");
  assert.equal(entry.cssOwner, "assets/css/components/supporting-page-layout.css");
  assert.doesNotMatch(base, /(?:^|[\s>+~,.#:])(?:page-hero(?:-|\b))/m);
  for (const contract of [".page-hero{", ".page-hero-grid{", ".page-hero-grid>p{", "@media(max-width:900px)", "@media(max-width:560px)", "@media(max-width:360px)"]) assert.ok(layout.includes(contract), contract);
  assert.doesNotMatch(layout, /!important|backdrop-filter|word-break:break-all|overflow-wrap:anywhere/);
  assert.doesNotMatch(cards, /\.work-card-v32__action[^}]*border-top/);
});

test("keeps bundled CSS imagery deploy-safe", () => {
  const css = read("assets/css/components/editorial-section.css");
  const tokens = read("assets/css/tokens.css");
  const cloud = read("assets/img/experience-proof-cloud.svg");
  assert.match(tokens, /--experience-proof-cloud-shape: url\("\/site\/assets\/img\/experience-proof-cloud\.svg"\)/);
  assert.match(tokens, /--experience-proof-cloud-height: 17\.336vw/);
  assert.match(tokens, /--portfolio-cloud-surface: #f4efe8/);
  assert.match(css, /padding-top: calc\(var\(--experience-proof-cloud-height\) \+ var\(--experience-proof-pad-block-start\)\)/);
  assert.match(css, /background: var\(--experience-proof-surface\)/);
  assert.match(css, /mask: var\(--experience-proof-cloud-shape\) center top \/ 100% 100% no-repeat/);
  assert.doesNotMatch(css, /translateY\(calc\(var\(--experience-proof-cloud-height\) \* -1\)\)/);
  assert.match(css, /inset: 0 0 auto/);
  assert.match(css, /inset: var\(--experience-proof-cloud-height\) 0 0/);
  assert.match(cloud, /fill="#F4EFE8"/);
  assert.doesNotMatch(cloud, /(?:linear|radial)Gradient|url\(#/);
  assert.equal(fs.existsSync(new URL("assets/img/experience-proof-cloud.svg", site)), true);
  assert.doesNotMatch(css, /url\(["']?\.\.\//);
});

test("footer uses a bounded organic edge without clipping its content", () => {
  const tokens = read("assets/css/tokens.css");
  const css = read("assets/css/components/site-chrome.css");
  const edge = read("assets/img/footer-organic-edge.svg");
  assert.match(tokens, /--footer-organic-edge-shape: url\("\/site\/assets\/img\/footer-organic-edge\.svg"\)/);
  assert.match(tokens, /--footer-organic-edge-height: clamp\(/);
  assert.match(css, /\.site-footer::before\s*\{[^}]*height: calc\(var\(--footer-organic-edge-height\) \+ var\(--dimension-1px\)\)[^}]*mask: var\(--footer-organic-edge-shape\)/s);
  assert.doesNotMatch(css, /\.site-footer[^{]*\{[^}]*clip-path\s*:/s);
  assert.match(edge, /viewBox="0 0 1440 48"/);
});

test("does not keep versioned legacy owners beside canonical source", () => {
  for (const directory of ["assets/css", "assets/js"]) {
    const legacy = fs.readdirSync(new URL(`${directory}/`, site)).filter((name) => /-(?:v)?\d+\.(?:css|js)$/.test(name));
    assert.deepEqual(legacy, [], `${directory}: ${legacy.join(", ")}`);
  }
});

test("prevents narrow-column recruiter content and forced word breaking", () => {
  const overview = read("assets/css/components/project-detail-overview.css");
  const cards = read("assets/css/components/project-card.css");
  const tokens = read("assets/css/tokens.css");
  const app = read("assets/js/app.js");
  assert.match(overview, /\.info-grid-v45\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(overview, /@media\(max-width:600px\)[\s\S]*\.info-grid-v45\{grid-template-columns:1fr\}/);
  assert.match(overview, /\.modal-head-meta-v60\{[^}]*flex-wrap:nowrap[^}]*overflow-x:auto/);
  assert.match(overview, /\.modal-head-meta-v60 \.kicker\{display:contents\}/);
  assert.match(overview, /\.detail-period-v60:empty\{display:none\}/);
  assert.match(overview, /\.info-grid-v45>div\{[^}]*padding:var\(--space-3\) var\(--info-card-padding\) var\(--space-5\)/);
  assert.match(overview, /\.info-grid-v45 strong\{[^}]*margin-top:var\(--info-card-label-value-gap\)/);
  assert.match(overview, /\.project-signals-v45\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(overview, /@media\(max-width:600px\)[\s\S]*\.project-signals-v45\{grid-template-columns:1fr/);
  assert.match(overview, /\.quick-view-v51--project\{grid-template-columns:1fr;align-items:start\}/);
  assert.match(overview, /\.quick-view-v51--project>\*\{grid-column:1\}/);
  assert.match(overview, /\.modal-content-v45\{[^}]*overflow-wrap:normal;word-break:normal/);
  assert.match(overview, /\.decision-considerations-v46\{[^}]*grid-template-columns:1fr/);
  assert.match(overview, /\.decision-card-v46\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
  assert.match(overview, /\.decision-considerations-v46>div\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
  assert.match(overview, /\.decision-result-block-v58,[^{]*\{[^}]*border:0;[^}]*background:transparent/);
  assert.doesNotMatch(overview, /\.decision-result-block-v58\{[^}]*padding-left:/);
  assert.match(overview, /\.project-context-v45__hard ul\{[^}]*padding:0[^}]*list-style:none/);
  assert.match(overview, /\.ownership-section-v45>\.section-heading-v45\{[^}]*margin-bottom:0/);
  assert.match(overview, /\.ownership-section-v45 \.section-heading-v45\+\*\{margin-top:var\(--cmp-popup-subtitle-content-gap\)/);
  assert.match(tokens, /--color-surface-evidence-neutral: var\(--paper-50\)/);
  assert.match(tokens, /--color-surface-evidence-accent: var\(--paper-50\)/);
  assert.match(overview, /\.impact-grid-v45>article,\.ownership-section-v45,\.delivery-grid-v45 article\{background:transparent\}/);
  assert.match(tokens, /--color-surface-evidence-item: var\(--paper-0\)/);
  assert.match(overview, /\.ownership-grid-v45>article\{[^}]*border-radius:0;[^}]*background:transparent/);
  assert.match(overview, /\.team-impact-item-v47,\.recruiter-proof-item-v46\{[^}]*background:var\(--color-surface-evidence-item\)/);
  assert.match(overview, /\.detail-related-v45__head h3\{[^}]*font-size:var\(--cmp-popup-section-title-size\)/);
  assert.match(cards, /\.related-project-card-v45,.detail-related-card-v45\{display:grid;[^}]*grid-template-rows:auto minmax\(0,1fr\) auto/);
  assert.match(cards, /\.work-card-v32__action,.related-project-card__action,.detail-related-action-v46\{[^}]*margin-top:auto/);
  assert.match(cards, /\.global-search-v114__projects \.related-project-card__intro-v81\{[^}]*grid-template-rows:var\(--dimension-24px\) auto/);
  assert.match(cards, /\.global-search-v114__projects \.related-project-card__action\{[^}]*display:inline-flex;[^}]*white-space:nowrap/);
  assert.match(cards, /\.related-project-card__action-arrow\{[^}]*flex:0 0 auto/);
  assert.match(cards, /\.work-card-v32--compact \.work-artifact\{[^}]*box-sizing:border-box;[^}]*min-height:0;[^}]*height:var\(--project-card-media-block-mobile\)/);
  assert.match(cards, /\.work-card-v32--compact \.work-card-v32__content\{border-top:var\(--dimension-1px\) solid var\(--color-border\)\}/);
  assert.match(cards, /\.work-card-v32__content h2\{[^}]*min-width:0;max-width:min\(100%,var\(--dimension-24ch\)\)[^}]*overflow-wrap:break-word;word-break:normal/);
  assert.match(cards, /\.related-project-card-v45 :is\(h4,h5\),\.detail-related-card-v45 h4\{[^}]*max-width:min\(100%,var\(--dimension-24ch\)\)[^}]*overflow-wrap:break-word;word-break:normal/);
  assert.doesNotMatch(cards, /(?:work-card-v32__content h2|related-project-card-v45 :is\(h4,h5\))\{[^}]*word-break:keep-all/);
  assert.match(overview, /\.detail-dialog-v45 h1,\.detail-dialog-v45 h2,\.detail-dialog-v45 \.detail-title-v45\{[^}]*max-width:100%[^}]*word-break:normal;overflow-wrap:break-word/);
  assert.ok(
    cards.indexOf(".work-card-v32--compact .work-artifact{box-sizing:border-box") >
      cards.indexOf(".work-card-v32 .work-artifact{min-height:var(--project-card-media-block)"),
    "compact media reset must follow the general Work media rule"
  );
  assert.match(app, /related-project-card__action-label/);
  assert.match(app, /related-project-card__action-arrow/);
  assert.match(app, /function logicalRailMax\(rail\)/);
  assert.match(app, /last\.offsetLeft\+last\.offsetWidth\+paddingEnd-rail\.clientWidth/);
  assert.match(app, /anchors\.find\(anchor=>anchor>current\+2\)/);
  assert.match(app, /rail\.scrollTo\(\{left:target/);
  assert.doesNotMatch(app, /const max=Math\.max\(0,rail\.scrollWidth-rail\.clientWidth\)/);
  const signalItems = app.match(/const signalItems=\[[\s\S]*?\];/)?.[0] ?? "";
  for (const field of ["p.type", "p.timeline", "p.scope", "audience"]) assert.ok(signalItems.includes(field), field);
  assert.doesNotMatch(overview, /!important/, "Project detail owner must not depend on specificity overrides");
  assert.doesNotMatch(read("assets/css/base.css"), /(?:^|[\s>+~,.#:])(?:project-evidence-v45\b|decision-(?:section|list|card|number|body|result|considerations|evidence|field|visual)(?:-|__|\b))/, "Project detail selectors must not return to base.css");
  for (const file of ["project-card.css", "experiment-card.css", "profile-card.css"]) {
    const css = read(`assets/css/components/${file}`);
    assert.doesNotMatch(css, /overflow-wrap:anywhere|word-break:break-all/, file);
  }
});

test("provides recruiter anchor navigation and outcome metric hierarchy", () => {
  const app = read("assets/js/app.js");
  const overview = read("assets/css/components/project-detail-overview.css");
  for (const page of ["index.html", "work.html", "profile.html", "experiments.html"]) {
    const html = read(page);
    assert.match(html, /<nav data-aria-key="aria\.project-sections-[^"]+" class="pd-section-nav" hidden id="projectSectionNav">/);
    assert.doesNotMatch(html, /class="project-section-nav/);
    assert.doesNotMatch(html, /projectSectionNav[^>]*role="tablist"/);
  }
  assert.match(app, /const PROJECT_NAV_ITEMS=/);
  assert.match(app, /setAttribute\('aria-current','location'\)/);
  assert.match(app, /appendEvidenceValue\(card,value\)/);
  assert.doesNotMatch(overview, /\.pd-section-nav:not\(\.floating-navigator\)/);
  assert.match(overview, /\.case-study-section\{[^}]*border:0;[^}]*border-radius:0/);
  assert.doesNotMatch(overview, /\.case-study-section\{[^}]*border-top:/);
  assert.match(overview, /\.detail-commerce-v45\{[^}]*align-items:stretch/);
  assert.match(overview, /\.key-intervention-map__flow\{[^}]*min-height:var\(--dimension-220px\)/);
  assert.match(app, /classList\.add\('floating-navigator'\)/);
  assert.match(app, /classList\.add\('floating-navigator__rail'\)/);
  assert.match(app, /floating-navigator__item/);
  assert.doesNotMatch(overview, /\.pd-section-nav__toggle\{display:flex/);
  for (const page of ["index.html", "work.html", "profile.html", "experiments.html"]) assert.doesNotMatch(read(page), /[←→⌄]/);
  assert.doesNotMatch(overview, /\.project-section-nav/);
  assert.match(overview, /\.recruiter-proof-item-v46__metric-value\{[^}]*font-size:var\(--cmp-popup-outcome-metric-size\)/);
  assert.match(app, /function embeddedOutcomeMetric\(text\)/);
  assert.match(app, /\[~≈\]\?\\s\*\\d\[\\d,.\]\*/);
  assert.doesNotMatch(app, /\[\\d,.\]\+\\\+\?/);
  assert.match(app, /零〇一二兩三四五六七八九十百千萬/);
});

test("keeps recruiter-facing ownership concise and principle examples actionable", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const home = read("assets/js/home.js");
  assert.doesNotMatch(app, /safeText\(leadershipHeading,detailLabel\('partnerOwned'\)\)/);
  for (const item of ssot.designPrinciples.items) {
    assert.ok(ssot.projects[item.expanded.practice.projectId], item.id);
  }
  assert.match(home, /principle-node__case-cta/);
  for (const id of ["voucher", "dbs", "booking", "bandzo"]) {
    assert.ok(ssot.projects[id].infoGrid.audience.primary.zh);
    assert.equal(ssot.projects[id].infoGrid.audience.secondary.zh.length, ssot.projects[id].infoGrid.audience.secondary.en.length);
  }
});

test("keeps Search and Domain entity relationships resolvable", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const ids = new Set();
  for (const bucket of ["projects", "experiments", "sideProjects"]) {
    for (const [key, entity] of Object.entries(ssot[bucket] ?? {})) {
      const index = entity.searchIndexV2;
      assert.ok(index, `${bucket}.${key} searchIndexV2`);
      if (index.canonicalId) assert.equal(index.canonicalId, key);
      assert.ok(!ids.has(key), `duplicate canonicalId ${key}`);
      ids.add(key);
    }
  }
  for (const domain of ssot.contentDiscovery.domains) {
    for (const key of [...(domain.featuredProjectIds ?? []), ...(domain.supportingProjectIds ?? [])]) {
      assert.ok(ssot.projects[key], `${domain.id} -> ${key}`);
      assert.ok(app.includes("matchedDomains") && app.includes("domainIds:[...new Set"), `${key} -> ${domain.id} canonical projection`);
    }
  }
  assert.match(app, /const searchEntities=query=>/);
  assert.match(app, /appendExploration/);
});

test("keeps interactive prototypes in-site, lazy, and owned only by Voucher Center", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const overview = read("assets/css/components/project-detail-overview.css");
  const flow = ssot.interactiveFlowRegistry["voucher-center-discovery-ut-2024"];
  assert.equal(flow.ownerProjectId, "voucher-center");
  assert.equal(ssot.projects.voucher.publicContent.journeyChapters[0].interactiveFlowRef, undefined);
  assert.deepEqual(ssot.projectInteractiveFlowRefs["voucher-center"], [flow.id]);
  assert.equal(flow.evidenceRefs.length, 2);
  for (const path of flow.evidenceRefs) {
    assert.match(path, /^projects\.voucher-center\.publicContent\.whatResearchChanged\.proofStrip\[\d+\]$/);
  }
  assert.match(app, /function createInteractiveFlow\(flow,\{compact=false\}=\{\}\)/);
  assert.match(app, /function prototypeEmbedUrl\(prototypeUrl\)/);
  assert.match(app, /embed\.loading='lazy'/);
  assert.match(app, /embed\.setAttribute\('sandbox','allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-presentation'\)/);
  assert.match(app, /source\.searchParams\.set\('show-proto-sidebar','0'\)/);
  const labels = Object.values(ssot.localizationRegistry.runtimeUiLabels).map((value) => value.en);
  assert.ok(labels.includes("FINAL TESTED VERSION"));
  assert.ok(labels.includes("Loading prototype…"));
  assert.match(app, /list\(p\.interactive_flows\)\.forEach\(flow=>decisions\.appendChild\(createInteractiveFlow\(flow\)\)\)/);
  assert.ok(
    app.indexOf("list(p.interactive_flows).forEach") > app.indexOf("(p.decisions||[]).forEach"),
    "prototype must render after the complete decision list"
  );
  assert.doesNotMatch(app, /Open in Figma|在 Figma 開啟|window\.open\(flow\.prototypeUrl/);
  assert.match(app, /localize\(optional\.content\|\|\[decision\.tradeoff,decision\.tradeoff_zh\]\)/);
  assert.match(app, /item\.release2024\?\.status/);
  assert.match(overview, /\.interactive-flow-v195\{/);
  assert.match(overview, /\.interactive-flow-v195__actions\{display:flex;justify-content:center\}/);
  assert.match(overview, /\.interactive-flow-v195__loading\{/);
  assert.match(overview, /\.programme-stage-case__proof\{grid-column:1\/-1/);
  assert.doesNotMatch(overview, /\.interactive-flow-v195__external/);
  assert.doesNotMatch(overview, /!important/);
});

test("renders complex project sections as recruiter narratives, not flattened SSOT fields", () => {
  const app = read("assets/js/app.js");
  for (const section of ["product-evolution", "research-evolution", "future-direction", "visual-system-guardrail", "system-foundation"]) {
    assert.ok(app.includes(`sectionId==='${section}'`) || app.includes(`'${section}'`), section);
  }
  assert.match(app, /function renderNarrativeProjectSection\(sectionId,value\)/);
  assert.match(app, /project-story-v198__grid/);
  assert.doesNotMatch(app, /desktopLayoutIntent.*project-story-v198/s);
});

test("keeps downloads outside the blocking page-navigation loader", () => {
  const runtime = read("assets/js/runtime.js");
  const profile = read("profile.html");
  const tokens = read("assets/css/tokens.css");
  const chrome = read("assets/css/components/site-chrome.css");
  assert.match(profile, /download href="\/site\/assets\/docs\/Shulin-Chou-CV\.pdf"/);
  assert.match(runtime, /link\.hasAttribute\('download'\)\|\|link\.target==='_blank'/);
  assert.match(runtime, /\\\.\(\?:pdf\|zip\|docx\?\)/);
  assert.match(runtime, /safetyTimer=window\.setTimeout\(hide,8000\)/);
  assert.match(runtime, /countSequence=\[1,2,3,4,5,4,3,2\]/);
  assert.match(runtime, /show\(runtimeCopy\('loading'\)\)/);
  assert.match(runtime, /doc\.body\.setAttribute\('aria-busy','true'\)/);
  assert.match(runtime, /doc\.body\.removeAttribute\('aria-busy'\)/);
  assert.match(chrome, /data-count="5"/);
  assert.match(chrome, /@media\(forced-colors:active\)\{\.portfolio-loader-v59__palm/);
  assert.doesNotMatch(tokens, /--loader-(?:cycle|shadow):/);
});

test("preserves localized arrays and structured values during Chinese copy cleanup", () => {
  const app = read("assets/js/app.js");
  assert.match(
    app,
    /if\(Array\.isArray\(value\)\)return value\.map\(normalizePublicCopy\)/,
    "Project problem types must remain arrays for the shared tag renderer"
  );
  assert.match(
    app,
    /if\(typeof value==='object'\)return value/,
    "Structured values must not be coerced into [object Object]"
  );
  const publicCopyNormalizer = app.match(/const normalizePublicCopy=[\s\S]*?\n  \};/)?.[0] ?? "";
  assert.match(publicCopyNormalizer, /\.normalize\('NFC'\)/);
  assert.doesNotMatch(publicCopyNormalizer, /\.normalize\('NFKC'\)/);
});


test("removes obsolete Stage CTA copy from canonical source", () => {
  const forbidden = /Explore \\d+ initiatives|View stage case|Explore initiatives/;
  assert.doesNotMatch(read("content/portfolio-content.json"), forbidden);
  assert.doesNotMatch(read("assets/js/app.js"), forbidden);
});


test("renders governed Stage visual evidence from canonical Voucher journey contracts", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  const manifest = JSON.parse(read("content/portfolio-asset-manifest.json"));
  const stages = ssot.projects.voucher.publicContent.journeyChapters;
  assert.deepEqual(stages.map((stage) => stage.label.en), ["DISCOVER", "QUALIFY", "ACTIVATE", "REDEEM", "REVIEW"]);
  const allowedRoles = new Set(["decision-proof", "shipped-state", "before-after", "flow", "system-rule"]);
  const allowedLayouts = new Set(["single-screen", "before-after", "flow-strip", "system-visual"]);
  assert.equal(stages.length, 5);
  for (const stage of stages) {
    const visual = stage.visualEvidence?.primary;
    assert.ok(visual, stage.id);
    assert.ok(allowedRoles.has(visual.evidenceRole), stage.id);
    assert.ok(allowedLayouts.has(visual.layoutVariant), stage.id);
    if(stage.id==="discover"){
      assert.ok(visual.copy.en.beforeCaption && visual.copy.zh.shippedCaption);
      assert.equal(manifest.items[visual.beforeAssetId].implementationStatus, "real-active");
      assert.equal(manifest.items[visual.shippedAssetId].implementationStatus, "real-active");
    }else{
      assert.ok(visual.caption.en && visual.caption.zh, stage.id);
      assert.ok(visual.alt.en && visual.alt.zh, stage.id);
      assert.ok(manifest.items[visual.assetId], stage.visualEvidence.primary.assetId);
      assert.equal(manifest.items[visual.assetId].implementationStatus, "placeholder-active");
    }
  }
  assert.equal(Object.values(ssot.projects).filter(project=>project.whatThisProves?.en&&project.whatThisProves?.zh).length,13);
  assert.equal(Object.values(ssot.projects).filter(project=>project.impactEvidence?.variant).length,13);
  assert.doesNotMatch(read("content/portfolio-content.json"),/NTUC FairPrice(?: Group)?/);
  assert.match(app, /localizedField\(stageProjection\|\|stage,'whatChanged'\)/);
  assert.match(app, /source\.evidence\?\.assetId/);
  assert.match(app, /createDecisionCard\(model,index/);
  assert.match(app, /decision-visual-v58/);
  assert.match(app, /evidence-lightbox-v147/);
  assert.match(app, /impact-evidence-v147/);
  assert.match(css, /\.programme-stage-visual\{/);
  assert.match(css, /\.programme-stage-case__breakpoint\{/);
  assert.match(css, /@media\(max-width:700px\)[\s\S]*\.before-after-evidence-v147__grid\{grid-template-columns:1fr/);
});

test("locks the existing Voucher Card history and independent-project boundaries", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const voucher = ssot.projects.voucher;
  const card = voucher.systemFoundations.voucherCardComponentSystem2024_2025;
  assert.match(card.history.en, /original white Voucher Card already existed/);
  assert.match(card.history.en, /Claim → View/);
  assert.match(card.history.en, /reusable Tangram component/);
  assert.doesNotMatch(card.title.en, /one-off Voucher cards/);
  assert.ok(card.forbiddenClaims.includes("I created the Voucher Card system from scratch."));
  assert.equal(voucher.publicContent.publicArchitecture.voucherCenterIsIndependentProject, true);
  assert.equal(voucher.publicContent.continueExploring.independentProjectCards.some((item) => item.projectId === "game-center"), true);
  assert.deepEqual(voucher.publicContent.selectedInitiatives.order, ["save-everyday-digital-campaign-2023", "brand-challenges"]);
  assert.equal(voucher.publicContent.voucherWalletEvidence.forbiddenProjection.includes("voucher-center"), true);
});

test("closes the final P1 case-study runtime contracts", () => {
  const app = read("assets/js/app.js");
  const overview = read("assets/css/components/project-detail-overview.css");
  const domain = read("assets/css/components/domain-selector.css");
  const home = read("assets/js/home.js");
  const manifest = JSON.parse(read("content/portfolio-asset-manifest.json"));
  assert.doesNotMatch(app, /representative-shipped-work-94a1458e/);
  assert.doesNotMatch(app, /renderDeliveryStatus\(localizedField\(item,'status'\)\)/);
  assert.match(overview, /@media\(max-width:600px\)\{#detailClassification,\.modal-classification-v45\{display:none\}\}/);
  assert.match(overview, /\.decision-number-v48\{[^}]*border:var\(--dimension-1px\) solid var\(--color-text-accent\)[^}]*background:var\(--color-surface-evidence-accent\)/);
  assert.match(overview, /\.quick-view-v51\{[^}]*padding:0;[^}]*background:transparent/);
  assert.match(overview, /\.decision-card-v46\{[^}]*border-radius:0;[^}]*background:transparent/);
  assert.match(app, /stage-focus-v148__statement/);
  assert.match(home, /image\.dataset\.assetStatus=asset\.isPlaceholder\?'placeholder-active':'real-active'/);
  assert.match(home, /window\.resolveProjectAsset\?\.\(assetId\)/);
  assert.match(home, /window\.projectAssetRatio\?\.\(asset\)/);
  assert.doesNotMatch(domain, /\.domain-project-list-v30 \.related-project-card__visual-v45\{/);
  const real = Object.values(manifest.items).filter(item=>item.assetStatus==='production'&&item.implementationStatus==='real-active');
  assert.equal(real.filter(item=>item.projectId==='voucher').length,13);
});

test("converges every project on one SSOT-ordered CaseStudySection system", () => {
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  assert.match(app, /const CASE_STUDY_SECTION_REGISTRY=\{/);
  assert.doesNotMatch(app, /PROJECT_SECTION_REGISTRY/);
  assert.match(app, /project\.section_order\|\|\[\]/);
  assert.match(app, /Unknown canonical section/);
  assert.match(app, /mappedCanonicalSectionOrder/);
  assert.match(app, /programmeOwner:'journey'/);
  assert.match(app, /candidates\.forEach\(node=>\{node\.hidden=true/);
  assert.match(app, /dataset\.canonicalSectionId=sectionId/);
  assert.doesNotMatch(app, /\[problem,complexity,\.\.\.supplemental,decisions,gallery,impact,ownership,delivery\]/);
  assert.match(app, /applyCaseStudySectionSystem\(p\)/);
  for (const variant of ["canvas", "soft", "emphasis"]) {
    assert.match(css, new RegExp(`\\.case-study-section--${variant}\\{`));
  }
  assert.match(css, /\.case-study-section__header\{/);
  assert.match(css, /\.case-study-section__eyebrow\{[^}]*color:var\(--color-text-secondary\)/);
  assert.match(css, /\.project-value-v207\{[^}]*background:transparent/);
  assert.doesNotMatch(css, /\.project-value-v207\{[^}]*border-radius:/);
  assert.match(css, /\.info-grid-v45 small\{[^}]*color:var\(--color-text-accent\)[^}]*font-size:var\(--text-xs\)/);
  assert.match(css, /\.info-grid-v45>div\{[^}]*border-radius:0;[^}]*background:transparent/);
  assert.match(css, /\.project-context-v45--decision-band\{[^}]*border-radius:0;[^}]*background:transparent/);
  assert.match(css, /\.ownership-grid-v45>article\{[^}]*border-radius:0;[^}]*background:transparent/);
  assert.match(css, /\.gallery-copy-v45\{[^}]*background:transparent/);
  assert.match(css, /\.gallery-thumbs-v45\{[^}]*background:transparent/);
  assert.match(css, /\.impact-evidence-v147\{display:grid;gap:var\(--case-gap-content\);width:min\(100%,var\(--case-evidence-max\)\);max-width:var\(--case-evidence-max\)\}/);
  assert.match(app, /dataset\.recruiterOutcome='visible'/);
  assert.match(app, /impact\.dataset\.recruiterOutcomeSection='visible'/);
  assert.match(app, /impactEvidence&&!appended\.has\(impact\)/);
  assert.match(app, /impact\.dataset\.recruiterSectionId='outcomes'/);
  assert.match(app, /if\(!ordered\.includes\(node\)\)delete node\.dataset\.canonicalSectionId/);
  assert.match(app, /evidence\.closest\('\[hidden\]'\)&&directSurface/);
  assert.match(app, /lang==='zh'\?'成果':'Outcomes'/);
  assert.match(css, /\.case-study-section\{[^}]*border:0;[^}]*border-radius:0/);
  assert.doesNotMatch(css, /\.case-study-section\{[^}]*border-top:/);
  assert.match(css, /\.case-study-section\[data-recruiter-outcome-section="visible"\]/);
  assert.match(css, /\.programme-stage-case__breakpoint\{[^}]*border-radius:0;[^}]*background:transparent/);
  for (const forbidden of [
    /\.project-context-v45--decision-band\{grid-template-columns:1fr;padding:var\(--space-5\)\}/,
    /\.quick-view-v51\{display:grid;grid-template-columns:1fr;gap:var\(--space-5\);padding:var\(--space-5\)\}/,
    /\.gallery-copy-v45\{padding:var\(--space-4\)\}/,
    /\.gallery-thumbs-v45\{padding:0 var\(--space-4\) var\(--space-4\)\}/,
    /\.voucher-stage-decision-list \.decision-card-v46\{[^}]*background:var\(--color-surface\)/,
    /\.stage-decision-problem\{[^}]*border-radius:var\(--radius-md\)[^}]*background:var\(--color-surface-evidence-item\)/,
    /\.stage-decision-meta>div\{[^}]*border-radius:var\(--radius-md\)[^}]*background:var\(--color-surface-subtle\)/
  ]) assert.doesNotMatch(css, forbidden);
});

test("contracts every approved recruiter block to an explicit public role", () => {
  const ssot=JSON.parse(read("content/portfolio-content.json"));
  const contract=ssot.implementationContracts.contentPresentationContract;
  assert.deepEqual(contract.allowedPublicRoles,["RENDER","SUPPORTING","DEMOTED","PRIVATE"]);
  assert.match(contract.statusResolution,/longest matching sourcePath/i);
  assert.match(read("../../scripts/content-completeness-audit.mjs"),/unexpectedMissingBlocks/);
  assert.match(read("../../scripts/content-completeness-audit.mjs"),/orphanedBlocks/);
  for(const [id,project] of Object.entries(ssot.projects)){
    const projectContract=contract.projects[id];
    assert.ok(projectContract,`${id}: missing content presentation contract`);
    for(const [sectionId,section] of Object.entries(projectContract.sections||{})){
      if(!section.renderRequired)continue;
      assert.ok(project.sectionOrder.includes(sectionId),`${id}: ${sectionId} missing from sectionOrder`);
      assert.ok(section.presentationType,`${id}: ${sectionId} missing presentationType`);
      assert.ok(section.sourcePaths?.length,`${id}: ${sectionId} missing sourcePaths`);
    }
    for(const supporting of projectContract.supporting||[]){
      assert.ok(project.sectionOrder.includes(supporting.parentSectionId),`${id}: supporting parent ${supporting.parentSectionId} missing`);
      assert.ok(supporting.presentationType,`${id}: supporting block missing presentationType`);
    }
  }
  assert.ok(ssot.projects.voucher.sectionOrder.includes("core-system-insight"));
  assert.match(read("assets/js/app.js"),/contentPresentationSources\(project,sectionId\)/);
  assert.match(read("assets/js/app.js"),/dataset\.contentBlockIds/);
  assert.match(read("assets/css/components/project-detail-overview.css"),/\.editorial-statement-v224__statement/);
});


test("projects exact canonical Outcome claims through the shared Case Study system", () => {
  const app = read("assets/js/app.js");
  const overview = read("assets/css/components/project-detail-overview.css");
  const tokens = read("assets/css/tokens.css");
  for (const contract of ["function publicOutcomeSignals(project)", "dataset.outcomeSourcePath", "dataset.outcomeExactProjection='true'", "Business impact", "商業影響"]) assert.ok(app.includes(contract), contract);
  for (const token of ["--case-page-max:", "--case-reading-max:", "--case-evidence-max:", "--case-page-gutter:", "--case-gap-chapter:", "--case-gap-section:", "--case-gap-subsection:", "--case-gap-content:", "--case-gap-caption:"]) assert.ok(tokens.includes(token), token);
  assert.match(overview, /\.case-study-section\{[^}]*width:min\(100%,var\(--case-page-max\)\)/);
  assert.match(overview, /\.impact-evidence-v147\{[^}]*var\(--case-evidence-max\)/);
  assert.match(overview, /\.impact-evidence-v147__heading h4,[^}]*font-size:var\(--text-h3\)/);
  assert.doesNotMatch(overview, /\.impact-evidence-v147__heading h3\{[^}]*font-size:var\(--cmp-popup-section-title-size\)/);
  assert.doesNotMatch(overview, /\.case-study-section\{[^}]*border-top:/);
});


test("Step 6A image frame system keeps canonical roles, intrinsic evidence and placeholder fidelity",()=>{
  const app=read("assets/js/app.js");
  const home=read("assets/js/home.js");
  const css=read("assets/css/components/project-detail-overview.css");
  const domain=read("assets/css/components/domain-selector.css");
  const manifest=JSON.parse(read("content/portfolio-asset-manifest.json"));
  assert.equal(manifest.frameSystemContract.status,"frozen-after-step-6a");
  assert.match(home,/dataset\.frameRole='project-cover'/);
  for(const role of ["primary-evidence","portrait-evidence","supporting-evidence","system-diagram"])assert.ok(css.includes(`data-frame-role="${role}"`),role);
  assert.match(css,/data-frame-role="primary-evidence"[^}]*[\s\S]*aspect-ratio:auto/);
  assert.match(css,/data-frame-role="portrait-evidence"[^}]*var\(--dimension-420px\)/);
  assert.match(css,/data-frame-role="system-diagram"[^}]*[\s\S]*overflow-x:auto/);
  assert.match(css,/\.before-after-evidence-v147__grid\{[^}]*grid-template-columns:minmax\(0,2fr\) minmax\(0,3fr\)[^}]*align-items:start/);
  assert.match(css,/\.before-after-evidence-v147__item\{[^}]*gap:var\(--case-gap-caption\)/);
  assert.match(css,/@media\(max-width:700px\)\{[\s\S]*\.before-after-evidence-v147__grid\{grid-template-columns:1fr/);
  const projectCard=read("assets/css/components/project-card.css");
  assert.match(projectCard,/related-project-card__visual-v45\{[^}]*aspect-ratio:var\(--project-card-media-ratio,16\/10\)/);
  assert.match(projectCard,/related-project-card__image-v148\{[^}]*object-fit:contain/);
  assert.doesNotMatch(domain,/related-project-card__visual-v45\{/);
  assert.match(app,/media\.dataset\.frameRole='primary-evidence'/);
});


test("Work Voucher card uses the canonical project-cover image owner", () => {
  const app=read("assets/js/app.js");
  const work=read("work.html");
  const css=read("assets/css/components/project-card.css");
  const manifest=JSON.parse(read("content/portfolio-asset-manifest.json"));
  const asset=manifest.items["voucher-hero-incentive-journey-public-v1"];
  assert.equal(asset.sha256,"ed91d8816e0ce03b0629c1d9d8f27c84bbbbd5fe235355960c03a2e8c36af409");
  assert.equal(asset.implementationStatus,"real-active");
  assert.doesNotMatch(work,/work-artifact--voucher/);
  assert.match(work,/data-frame-role="project-cover"/);
  assert.match(app,/resolveProjectAsset\(coverAssetId\)/);
  assert.match(app,/image\.dataset\.assetId=coverAsset\.assetId/);
  assert.match(css,/\.work-card-v32__image-v225\{[^}]*object-fit:contain/);
});

test("Voucher recruiter-first IA uses canonical SSOT and shared responsive owners",()=>{const app=read("assets/js/app.js"),css=read("assets/css/components/project-detail-overview.css"),data=JSON.parse(read("content/portfolio-content.json")),v=data.projects.voucher;assert.equal(data.contentVersion,"2026-08-12-r158");assert.equal(v.infoGrid.audience.primary.en,"Customers");assert.equal(v.recruiterFirstPopup.hero.showKeyProblems,false);assert.deepEqual(v.recruiterFirstPopup.stages.map(x=>x.id),["discover","qualify","activate","redeem","review"]);assert.match(app,/View solution details/);assert.match(css,/\.voucher-r149-flow\{[^}]*grid-template-columns:minmax\(0,1fr\) auto minmax\(0,1fr\) auto minmax\(0,1fr\)/);assert.match(css,/@media\(max-width:871px\)/)});

test("R157 locks Voucher visual correction content and shared interaction owners",()=>{const app=read("assets/js/app.js"),css=read("assets/css/components/project-detail-overview.css"),data=JSON.parse(read("content/portfolio-content.json")),v=data.projects.voucher,c=v.recruiterFirstPopup,d=c.stages.find(x=>x.id==="discover");assert.equal(c.outcomes.metrics.length,4);assert.equal(c.outcomes.metrics[1].value,"+~167%");assert.match(c.outcomes.metrics[1].primaryCopy.en,/approximate increase/);assert.match(c.outcomes.metrics[1].evidenceNote.en,/~1\.5% to ~4%/);assert.equal(c.programmeResearch.metrics.length,5);assert.equal(c.programmeResearch.metrics[2].label.en,"participants");assert.equal((app.match(/voucher-r149-voucher-card-integrated/g)||[]).length,0);assert.doesNotMatch(app,/dialogTitle\.focus\(\{preventScroll:true\}\);\n      doc\.dispatchEvent/);assert.equal(d.decisions[0].evidence.assetId,"voucher-offer-stage-discover-pdp-before-shipped-01");assert.equal(d.decisions[1].evidence.assetId,"voucher-offer-stage-discover-voucher-details-concept-eligibility-tracker-01");assert.match(css,/\.contribution-block__intervention\{/);assert.doesNotMatch(css,/\.contribution-block--emphasis\{/);assert.match(css,/@media\(max-width:430px\)\{[\s\S]*\.research-evidence-metrics,\.outcome-metric-grid[^\{]*\{grid-template-columns:1fr\}/);assert.match(css,/\.case-study-cloud-emphasis::after\{bottom:var\(--dimension-1px\);transform:translateY\(100%\) rotate\(var\(--dimension-180deg\)\)\}/)});


test("uses generic presentation visibility for public Problem Types without project identity conditionals", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  assert.equal(ssot.projects.dbs.presentation.visibility.problemTypes, false);
  assert.match(app, /p\.presentation\?\.visibility\?\.problemTypes \?\? !p\.recruiterFirstPopup/);
  assert.doesNotMatch(app, /key===['"](?:dbs|voucher)['"]\?\[\]/);
});


test("projects DBS through the shared recruiter-first system-case composition", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const overview = read("assets/css/components/project-detail-overview.css");
  const dbs = ssot.projects.dbs;
  assert.equal(dbs.presentation.composition, "recruiter-first-system-case");
  assert.deepEqual(dbs.presentation.navigation.map(item => item.key), ["overview", "complexity", "decisions", "evidence", "outcomes"]);
  assert.match(app, /function renderSystemCaseParent\(p\)/);
  assert.match(app, /presentation\?\.composition==='recruiter-first-system-case'/);
  assert.match(app, /const configured=list\(project\?\.presentation\?\.navigation\)/);
  assert.doesNotMatch(app, /key===['"]dbs['"]/);
  assert.match(overview, /@media\(max-width:430px\)\{\.recruiter-system-case__metrics\{grid-template-columns:1fr\}\}/);
});


test("consolidates verified DBS intervention into shared ContributionBlock", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const dbs = ssot.projects.dbs;
  assert.equal(dbs.presentation.contentRefs.contributionIntervention, "keyInterventionMap");
  assert.equal(dbs.presentation.visibility.coreSystemInsight, true);
  assert.equal(dbs.presentation.visibility.evidence, true);
  assert.match(app, /function appendContributionFlow\(section,transformation\)/);
  assert.match(app, /appendContributionFlow\(contribution,/);
  assert.doesNotMatch(app, /Evidence to strategy and system model/);
  assert.doesNotMatch(app, /key===['"]dbs['"]/);
});


test("renders DBS decisions through the shared Decision card with canonical OUTCOME", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const dbs = ssot.projects.dbs;
  assert.equal("designDecisions" in dbs, false);
  assert.equal(dbs.decisionNarrative.primaryDecisions.length, 3);
  dbs.decisionNarrative.primaryDecisions.forEach(decision => {
    assert.ok(decision.whatIDecided);
    assert.ok(decision.whyThisChoice);
    assert.ok(decision.outcome);
    assert.equal("effectOrResult" in decision, false);
    assert.equal("evidence" in decision, false);
  });
  assert.match(app, /lang==='zh'\?'成果':'OUTCOME'/);
  assert.match(app, /showDecisionVisuals=p\.presentation\?\.decisionOptions\?\.showVisuals \?\? true/);
  assert.doesNotMatch(app, /key===['"]dbs['"]/);
});


test("uses frozen recruiter-first research, validation and accountability primitives for DBS", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const research = ssot.projects.dbs.publicContent.decisionEvidence;
  assert.deepEqual(research.metrics.map(item => typeof item.value === "object" ? item.value.en : String(item.value)), ["50+", "4", "2", "3"]);
  assert.ok(research.metrics.find(item => String(item.value) === "3").note);
  assert.equal("claimBoundary" in research, false);
  assert.match(app, /research-evidence-metrics recruiter-system-case__metrics/);
  assert.match(app, /createInfoTooltip\(t\(item\.note\)/);
  assert.match(app, /data\.componentOwner='SharedAccountability'|dataset\.componentOwner='SharedAccountability'/);
});


test("projects the R160.4 approved DBS orientation and complexity copy", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const dbs = ssot.projects.dbs;
  assert.equal(dbs.title.en, "Turning fragmented credit-exception handling into a shared six-market decision system");
  assert.equal(dbs.atAGlance.en, "Led end-to-end design of a credit-exception operating system, replacing fragmented report-driven workflows with role-based case management and a shared decision model launched across six markets.");
  assert.deepEqual(dbs.whatMadeThisHard.map(item => item.title.en), [
    "Two fundamentally different operating modes",
    "Fragmented operational context",
    "Decisions crossed roles, authority levels and markets"
  ]);
  assert.equal(dbs.presentation.visibility.coreSystemInsight, true);
  assert.equal(dbs.presentation.contentRefs.coreSystemInsight, "publicContent.coreSystemInsight");
  assert.match(app, /project\.presentation\?\.heroMetadata/);
  assert.match(app, /'MY INTERVENTION'/);
  assert.doesNotMatch(app, /key===['"]dbs['"]/);
});


test("orders approved DBS decisions before evidence and renders exactly four research metrics", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const dbs = ssot.projects.dbs;
  assert.equal(dbs.decisionNarrative.primaryDecisions.length, 3);
  assert.equal(dbs.publicContent.decisionEvidence.items.length, 3);
  assert.deepEqual(dbs.publicContent.decisionEvidence.metrics.map(item => String(item.value)), ["50+", "4", "2", "3"]);
  assert.equal(dbs.publicContent.decisionEvidence.metrics.some(item => String(item.value).includes("6 market")), false);
  assert.match(app, /\[hard,contribution,insight,decisions,evidence,outcomes,accountability,related\]/);
  assert.match(app, /dataset\.componentOwner='StructuredEvidence'/);
  assert.doesNotMatch(app, /key===['"]dbs['"]/);
});


test("renders approved DBS qualitative Outcomes through the shared OutcomeMetric owner", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  const dbs = ssot.projects.dbs;
  assert.equal(dbs.publicContent.outcomes.cards.length, 3);
  assert.equal("validatedOutcomes" in dbs.publicContent, false);
  assert.equal(dbs.presentation.contentRefs.outcomes, "publicContent.outcomes");
  assert.deepEqual(dbs.presentation.navigation.map(item => item.label.en), ["Overview", "Complexity", "Decisions", "Evidence", "Outcomes"]);
  assert.match(app, /function appendOutcomeCards\(grid,items/);
  assert.match(app, /appendOutcomeCards\(metrics,c\.outcomes\?\.metrics,\{metric:true,translate:t\}\)/);
  assert.match(css, /\.outcome-metric--qualitative\{/);
  assert.doesNotMatch(app, /key===['"]dbs['"]/);
});


test("uses the approved structured SharedAccountability projection for DBS", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const dbs = ssot.projects.dbs;
  assert.equal(dbs.presentation.accountabilityMode, "structured");
  assert.equal(dbs.ownershipModel.publicSummary.en, "As Lead Product Designer, I owned problem framing, cross-market synthesis, operating-model definition, role and workflow architecture, product design direction and prototype validation, working with Product, Engineering and operational stakeholders through delivery.");
  assert.match(app, /if\(accountabilityPresentation\)appendSharedAccountability\(accountability,accountabilityPresentation,\{translate:t\}\)/);
  assert.doesNotMatch(app, /key===['"]dbs['"]/);
});

test("R161.1 owns panoramic mobile readability and metadata hierarchy in shared ProjectCard",()=>{
  const app=read("assets/js/app.js");
  const home=read("assets/js/home.js");
  const css=read("assets/css/components/project-card.css");
  const manifest=JSON.parse(read("content/portfolio-asset-manifest.json"));
  assert.match(app,/ratio>=2\?'panoramic':'standard'/);
  assert.match(app,/projectCardFocalPosition/);
  assert.match(home,/window\.projectAssetPresentation\?\.\(asset\)/);
  assert.match(css,/--project-card-mobile-panoramic-media-ratio:5\/3/);
  assert.match(css,/--project-card-company-color:var\(--color-text-secondary\)/);
  assert.match(css,/--project-card-company-title-gap:var\(--space-5\)/);
  assert.match(css,/@media\(max-width:560px\)[\s\S]*data-media-format="panoramic"[^}]*var\(--project-card-mobile-panoramic-media-ratio\)/);
  assert.doesNotMatch(css,/dbs|voucher/i);
  assert.equal(manifest.items["dbs-project-card-primary-01"].projectCardFocalPosition,"center center");
});


test("R161.2 keeps ProjectCard media full-bleed and Domain content adjacent through shared owners",()=>{
  const card=read("assets/css/components/project-card.css");
  const domain=read("assets/css/components/domain-selector.css");
  assert.match(card,/work-card-v32__button\{display:grid;width:100%;height:100%;min-height:0;padding:0;/);
  assert.match(card,/work-card-v32--compact \.work-card-v32__button\{grid-template-columns:1fr;grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(card,/@media\(max-width:900px\)\{[\s\S]*grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(card,/@media\(max-width:560px\)\{:root\{[^}]*\}\.work-card-v32__content,\.related-project-card__content-v1612\{padding:var\(--space-5\)\}\.work-card-v32 \.work-card-v32__visual-v225\{padding:0\}/);
  assert.doesNotMatch(card,/\.work-card-v32__content,\.work-artifact\{padding:/);
  assert.match(card,/--project-card-company-title-gap:var\(--space-5\)/);
  assert.match(domain,/@media\(max-width:900px\)\{[\s\S]*\.domain-layout\{grid-template-columns:1fr;gap:var\(--space-4\)\}/);
});


test("R161.2.1 converges Domain ProjectCards and floating navigation on canonical shared owners",()=>{
  const home=read("assets/js/home.js");
  const card=read("assets/css/components/project-card.css");
  assert.match(home,/querySelector\('\.floating-navigator__rail'\)/);
  assert.doesNotMatch(home,/domain-floating-nav-v52__rail/);
  assert.match(home,/domain-floating-chip-v52 floating-navigator__item/);
  assert.match(home,/card\.classList\.add\('related-project-card-v45--media-stack'\)/);
  assert.match(home,/related-project-card__heading-v1612/);
  assert.match(home,/related-project-card__content-v1612/);
  assert.match(card,/\.related-project-card-v45--media-stack\{padding:0;grid-template-rows:auto minmax\(0,1fr\);gap:0;overflow:hidden\}/);
  assert.match(card,/\.related-project-card-v45--media-stack \.related-project-card__visual-v45\{border-radius:0\}/);
  assert.match(card,/\.related-project-card__heading-v1612\{[^}]*gap:var\(--project-card-company-title-gap\)/);
  assert.match(card,/\.related-project-card__heading-v1612 \.related-project-card__title\{margin-top:0\}/);
  assert.doesNotMatch(home,/key===['"]dbs['"]/);
});


test("clamps floating Domain items inside the shared rail safe area", () => {
  const home = read("assets/js/home.js");
  const domain = read("assets/css/components/domain-selector.css");
  assert.match(home, /const desired=\(selected\.offsetLeft\+\(selected\.offsetWidth\/2\)\)-\(rail\.clientWidth\/2\)/);
  assert.match(home, /return Math\.min\(max,Math\.max\(0,desired\)\)/);
  assert.match(home, /if\(show&&!wasVisible\)syncFloatingDomain\(domain,\{immediate:true\}\)/);
  assert.match(domain, /\.floating-navigator__rail\{[^}]*box-sizing:border-box[^}]*padding:var\(--dimension-2px\) var\(--interactive-state-safe-area\)[^}]*scroll-padding-inline:var\(--interactive-state-safe-area\)/);
  assert.doesNotMatch(home, /domain(?:Floating)?===['"](?:financial-services|enterprise-operations|complex-systems)['"].*(?:scroll|offset|target)/);
});


test("SharedAccountability supports an optional partner-owned group without project conditions", () => {
  const app = read("assets/js/app.js");
  const overview = read("assets/css/components/project-detail-overview.css");
  assert.match(app, /\[source\?\.owned,source\?\.shared,source\?\.partnerOwned\]\.filter\(Boolean\)/);
  assert.match(app, /if\(groups\.length===3\)grid\.classList\.add\('voucher-r149-accountability--three'\)/);
  assert.match(app, /list\(item\.items\)\.forEach\(entry=>details\.append/);
  assert.doesNotMatch(app, /booking.*partnerOwned|partnerOwned.*booking/i);
  assert.match(overview, /\.voucher-r149-accountability--three\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
});


test("shared Outcomes supports change, measured outcome, and scale semantics", () => {
  const app = read("assets/js/app.js");
  const overview = read("assets/css/components/project-detail-overview.css");
  assert.match(app, /function appendOutcomeSemanticHierarchy\(section,source/);
  assert.match(app, /source\?\.change/);
  assert.match(app, /source\?\.measured/);
  assert.match(app, /source\?\.scale/);
  assert.match(app, /if\(outcomesSource\?\.semanticHierarchy\)appendOutcomeSemanticHierarchy/);
  assert.doesNotMatch(app, /booking.*semanticHierarchy|semanticHierarchy.*booking/i);
  assert.match(overview, /\.outcome-semantic-change\{/);
  assert.match(overview, /\.outcome-scale-grid\{/);
});

test("R162.5 keeps Booking recruiter-first, approximate, complete, and confidentiality-safe",()=>{
  const ssot=JSON.parse(read("content/portfolio-content.json"));
  const manifest=JSON.parse(read("content/portfolio-asset-manifest.json"));
  const app=read("assets/js/app.js");
  const css=read("assets/css/components/project-detail-overview.css");
  const booking=ssot.projects.booking;
  const strategy=ssot.projects["booking-taxi-pickup-service-strategy"];
  const outcomes=booking.publicContent.outcomes;
  assert.deepEqual(outcomes.semanticHierarchy.measured.map(item=>[item.value,item.label.en]),[
    ["+~7%","desktop conversion rate"],
    ["+~3%","mobile conversion rate"],
    ["+~10%","tablet conversion rate"],
    ["~150","additional rides per day after launch"]
  ]);
  assert.equal(outcomes.evidence.length,0);
  assert.match(outcomes.semanticHierarchy.supportingStatements[0].text.en,/6 of 7 analysed markets improved/);
  assert.match(outcomes.semanticHierarchy.supportingStatements[1].text.en,/Spain was the only analysed market to decline/);
  assert.match(outcomes.semanticHierarchy.closingStatement.en,/40\+ countries/);
  assert.doesNotMatch(JSON.stringify(outcomes),/2-step|3-step|outcomes-cross-market|outcomes-post-launch/i);
  for(const decision of booking.decisionNarrative.primaryDecisions){
    assert.ok(decision.whatIDecided);
    assert.ok(decision.whyThisChoice);
    assert.ok(decision.optionalBlock?.content);
    assert.ok(decision.outcome);
  }
  assert.deepEqual(booking.decisionNarrative.primaryDecisions,booking.publicContent.primaryDecisions);
  assert.equal(booking.decisionEvidenceMap["booking-decision-01"].publicAssetId,"booking-evidence-decision-01-ride-mix-public-01");
  assert.equal(manifest.items["booking-evidence-decision-01-ride-mix-public-01"].publicBuild,true);
  assert.equal(manifest.items["booking-evidence-decision-01-ride-mix-public-01"].type,"image/svg+xml");
  assert.equal(manifest.items["booking-evidence-decision-01-ride-mix-01"],undefined);
  assert.equal(manifest.items["booking-evidence-outcomes-cross-market-conversion-01"],undefined);
  assert.equal(manifest.items["booking-evidence-outcomes-post-launch-tradeoff-01"],undefined);
  assert.equal(strategy.title.en,"From uncertain expansion to a lower-risk taxi pickup experiment");
  assert.match(app,/supportingStatements/);
  assert.match(css,/recruiter-complexity-grid\{[^}]*align-items:stretch/);
  assert.match(css,/voucher-r149-insight \.voucher-r149-heading h2\{width:100%;max-width:var\(--case-reading-max\)\}/);
  assert.match(css,/core-system-insight-section \.voucher-r149-foundations:has/);
});
