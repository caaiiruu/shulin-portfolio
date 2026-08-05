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
    assert.equal((html.match(/<link[^>]+\.css/g) ?? []).length, 1);
    assert.equal((html.match(/<script[^>]+src=/g) ?? []).length, 1);
    assert.match(html, /production\.[a-f0-9]{16}\.css/);
    assert.match(html, /production\.[a-f0-9]{16}\.js/);
    assert.match(html, /id="detailDialog"/);
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

test("keeps every rendered project overview bilingual without English fallback in Chinese mode", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const unresolvedTimelineProjects = [];
  for (const [id, project] of Object.entries(ssot.projects)) {
    const info = project.infoGrid ?? project.publicContent?.hero?.infoGrid ?? {};
    const legacy = {
      type: [project.type, project.type_zh],
      scope: [project.scope, project.scope_zh],
      audience: [project.audience, project.audience_zh],
      timeline: [project.timeline ?? project.period, project.timeline_zh ?? project.period_zh],
    };
    for (const field of ["type", "scope"]) {
      const value = info[field];
      if (value && typeof value === "object") {
        assert.ok(value.zh, `${id}: ${field}.zh is required`);
      } else if (value) {
        assert.ok(info[`${field}_zh`] || legacy[field][1], `${id}: ${field}_zh is required`);
      }
    }
    if (info.audience && typeof info.audience === "object") {
      if ("en" in info.audience) assert.ok(info.audience.zh, `${id}: audience.zh is required`);
      else {
        assert.ok(info.audience.primary_zh || typeof info.audience.primary === "object", `${id}: audience.primary_zh is required`);
        assert.equal(info.audience.secondary_zh?.length, info.audience.secondary?.length, `${id}: audience secondary translations must align`);
      }
    } else if (info.audience || legacy.audience[0]) {
      assert.ok(legacy.audience[1], `${id}: audience_zh is required`);
    }
    const timeline = info.timeline;
    if (timeline && typeof timeline === "object" && "value" in timeline) {
      if (timeline.value == null) unresolvedTimelineProjects.push(id);
      else assert.ok(timeline.value_zh || typeof timeline.value === "object", `${id}: timeline.value_zh is required`);
    } else if (timeline && typeof timeline === "object" && "en" in timeline) {
      assert.ok(timeline.zh, `${id}: timeline.zh is required`);
    } else if (timeline || legacy.timeline[0]) {
      assert.ok(legacy.timeline[1], `${id}: timeline_zh is required`);
    }
  }
  assert.deepEqual(unresolvedTimelineProjects.sort(), ["cathay-mortgage-assistant"]);
  const app = read("assets/js/app.js");
  assert.match(app, /value\.primary_zh/);
  assert.match(app, /value\.secondary_zh/);
  assert.match(app, /value\.value_zh/);
});

test("keeps every project Type consistent across canonical SSOT representations", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const allowed = new Set(["Internal System", "Incentive System", "Transaction System", "Marketplace Platform", "0→1 Product"]);
  const zh = {"Internal System":"內部系統","Incentive System":"獎勵系統","Transaction System":"交易系統","Marketplace Platform":"市場平台","0→1 Product":"0→1 產品"};
  const value = (entry, locale) => entry && typeof entry === "object" && !Array.isArray(entry) ? entry[locale] : entry;
  for (const [id, project] of Object.entries(ssot.projects)) {
    const canonical = value(project.infoGrid?.type, "en") || project.type;
    assert.ok(allowed.has(canonical), `${id}: unapproved Type ${canonical}`);
    for (const entry of [project.type, project.infoGrid?.type, project.publicContent?.hero?.infoGrid?.type]) {
      if (!entry) continue;
      assert.equal(value(entry, "en"), canonical, `${id}: conflicting Type`);
      const localizedZh = typeof entry === "object" && !Array.isArray(entry) ? entry.zh : undefined;
      if (localizedZh) assert.equal(localizedZh, zh[canonical], `${id}: conflicting Chinese Type`);
    }
    if (project.type_zh) assert.equal(project.type_zh, zh[canonical], `${id}: conflicting legacy Chinese Type`);
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
  const requiredPairs = [
    ...ssot.projects["voucher-center"].publicContent.researchEvolution.stages.map((stage) => stage.sample),
    ...ssot.projects["voucher-center"].publicContent.futureDirection.phase1.concepts,
    ...ssot.projects["voucher-center"].publicContent.futureDirection.phase2.concepts,
    ...ssot.projects["voucher-center"].publicContent.visualSystemGuardrail.shippedDirection,
    ...ssot.projects["voucher-center"].publicContent.systemFoundation.items,
    ...ssot.projects["game-center"].publicContent.systemEvidence.items.flatMap((item) => [item.label, item.before, item.after]),
    ...ssot.projects.payment.publicContent.operationalSystemOwnership.capabilityGroups.flatMap((group) => [group.label, ...group.coverage]),
    ...ssot.projects["cathay-sit-online-account-opening"].publicContent.systemFraming.proof.flatMap((item) => [item.value, item.label]),
    ...ssot.projects["cathay-sit-review-remediation-operations"].publicContent.researchScale.proof.flatMap((item) => [item.value, item.label]),
  ];
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
  for (const contract of ["p.type", "p.scope", "p.audience", "p.timeline", "detailPeriod"]) {
    assert.match(app, new RegExp(contract.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  const overviewSignals = app.match(/const signalItems=\[[\s\S]*?\];/)?.[0] ?? "";
  assert.ok((overviewSignals.match(/ui\(/g) ?? []).length >= 4);
  assert.doesNotMatch(overviewSignals, /'Domain'/);
  assert.match(app, /safeText\(doc\.getElementById\('detailPeriod'\),''\)/);
  for (const retiredField of ["'My role'", "'Scale & reach'", "'Design strategy'"]) {
    assert.doesNotMatch(app, new RegExp(retiredField.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal(ssot.contentVersion, "2026-08-04-r108");
  assert.equal(Object.keys(ssot.projects).length, 12);
  for (const projectId of ["voucher", "dbs", "booking", "bandzo", "payment"]) {
    const value = ssot.projects[projectId].valueIBrought;
    assert.ok(value?.headline?.en && value?.headline?.zh, `${projectId} value headline`);
    assert.ok(value?.supportingStatement?.en && value?.supportingStatement?.zh, `${projectId} value supporting statement`);
    assert.deepEqual(Object.keys(value).sort(), ["headline", "supportingStatement"], `${projectId} public value boundary`);
  }
  for (const projectId of ["voucher-center", "game-center", "online-auction-payment-platform", "cathay-mortgage-assistant", "cathay-sit-online-account-opening", "cathay-sit-review-remediation-operations", "ctbc-mortgage-self-service-app"]) {
    assert.equal(ssot.projects[projectId].valueIBrought, undefined, `${projectId} remains unpublished`);
  }
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
  assert.equal(Object.keys(ssot.projects).length, 12);
  assert.equal(Object.keys(ssot.projectDecisionRefs).length, 12);
  for (const [id, project] of Object.entries(ssot.projects)) {
    assert.ok(project.ownershipModel, `${id}: ownershipModel`);
    assert.ok(project.outcomeEvidenceModel, `${id}: outcomeEvidenceModel`);
    assert.ok(project.heroVisualBrief, `${id}: heroVisualBrief`);
    assert.ok(ssot.projectDecisionRefs[id]?.length, `${id}: canonical decisions`);
    for (const ref of ssot.projectDecisionRefs[id]) {
      assert.ok(ssot.decisionRegistry[ref], `${id}: unresolved decision ${ref}`);
    }
  }
  assert.equal(ssot.projectDecisionRefs.voucher.length, 11);
  for (const contract of [
    "raw?.projectDecisionRefs?.[id]",
    "raw?.decisionRegistry?.[ref]",
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
  assert.match(app, /localizedField\(item,'delivery_status'\)/);
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
  for (const id of ["online-auction-payment-platform", "cathay-mortgage-assistant"]) {
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
  assert.match(overview, /\.modal-tags>\*\{[^}]*padding:var\(--dimension-4px\) 0;[^}]*font-weight:var\(--sys-weight-bold\)/);
  assert.doesNotMatch(overview, /\.modal-tags>\*\{[^}]*(?:border-radius|background):/);
  assert.doesNotMatch(overview, /\.project-signals-v45>div:nth-child\(2\)\{[^}]*grid-column:1\/-1/);
  assert.match(overview, /@media\(max-width:980px\)\{\.detail-commerce-v45\{grid-template-columns:1fr/);
  assert.match(overview, /\.programme-stage-case\{[^}]*width:100%;[^}]*max-width:none/);
  assert.match(overview, /\.programme-stage-case\{[^}]*grid-template-columns:minmax\(var\(--dimension-260px\),.72fr\) minmax\(0,1.28fr\)/);
  assert.match(overview, /\.programme-stage-case__proof\{[^}]*grid-column:1\/-1;[^}]*grid-template-columns:minmax\(var\(--dimension-260px\),.72fr\) minmax\(0,1.28fr\) max-content/);
  assert.match(overview, /\.programme-stage-case__facts\{[^}]*grid-template-columns:minmax\(0,1fr\) max-content/);
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
  assert.ok(labels.includes("View stage case"));
  assert.match(app, /cta\.dataset\.stage=stage\.id/);
  assert.doesNotMatch(app, /Detailed case and approved imagery are being prepared/);
  assert.match(app, /currentDetail\?\.type==='stage'/);
  assert.match(app, /url\.searchParams\.delete\('stage'\)/);
  assert.ok(labels.includes("One shared system behind all five journey stages"));
  assert.doesNotMatch(app, /Capability added:/);
  assert.ok(labels.includes("REPRESENTATIVE SHIPPED WORK"));
  assert.ok(labels.includes("DELIVERY STATUS"));
  assert.match(app, /'button button--dark programme-stage-case__cta'/);
  assert.doesNotMatch(css, /\.programme-stage-case__cta:(?:hover|active)\{/);
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
  assert.equal(Object.keys(content.projects).length, 12);
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
    assert.ok(project.searchIndexV2.intentIds.length >= 3, project.searchIndexV2.canonicalId);
    assert.ok(project.searchIndexV2.problemTags.en.length >= 5, project.searchIndexV2.canonicalId);
    assert.ok(project.searchIndexV2.capabilityTags.en.length >= 5, project.searchIndexV2.canonicalId);
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
    new Set(["payment", "game-center", "ctbc-mortgage-self-service-app", "bandzo", "online-auction-payment-platform", "cathay-mortgage-assistant"]),
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
  assert.match(overview, /\.decision-result-block-v58,[^{]*\{[^}]*background:var\(--cmp-popup-info-surface\)/);
  assert.match(overview, /\.decision-evidence-v58\{background:var\(--color-surface-evidence-accent\)\}/);
  assert.doesNotMatch(overview, /\.decision-(?:result-block-v58|considerations-v46)[^{]*\{[^}]*border-top:/);
  assert.doesNotMatch(overview, /\.decision-result-block-v58\{[^}]*padding-left:/);
  assert.match(overview, /\.project-context-v45__hard ul\{[^}]*padding:0[^}]*list-style:none/);
  assert.match(overview, /\.ownership-section-v45>\.section-heading-v45\{[^}]*margin-bottom:0/);
  assert.match(overview, /\.ownership-section-v45 \.section-heading-v45\+\*\{margin-top:var\(--cmp-popup-subtitle-content-gap\)/);
  assert.match(tokens, /--color-surface-evidence-neutral: var\(--paper-50\)/);
  assert.match(tokens, /--color-surface-evidence-accent: var\(--paper-50\)/);
  assert.match(overview, /\.impact-grid-v45>article\{background:var\(--color-surface-evidence-neutral\)\}/);
  assert.match(overview, /\.ownership-section-v45,\.delivery-grid-v45 article\{background:var\(--color-surface-evidence-accent\)\}/);
  assert.match(tokens, /--color-surface-evidence-item: var\(--paper-0\)/);
  assert.match(overview, /\.ownership-grid-v45>article\{[^}]*background:var\(--color-surface-evidence-item\)/);
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
  assert.match(app, /const DEFAULT_PROJECT_NAV_ITEMS=/);
  assert.match(app, /setAttribute\('aria-current','location'\)/);
  assert.match(app, /appendEvidenceValue\(card,value\)/);
  assert.match(overview, /\.pd-section-nav\{position:absolute[^}]*bottom:calc\(var\(--space-5\) \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(overview, /\.pd-section-nav\{[^}]*width:max-content[^}]*max-width:calc\(100% - var\(--space-9\)\)/);
  assert.match(overview, /\.detail-commerce-v45\{[^}]*align-items:stretch[^}]*border:var\(--dimension-1px\) solid var\(--color-border\)/);
  assert.match(overview, /\.key-intervention-map__flow\{[^}]*min-height:var\(--dimension-220px\)/);
  assert.match(overview, /@media\(max-width:700px\)[\s\S]*\.pd-section-nav__toggle\{display:flex\}/);
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
    assert.match(ssot.projects[id].publicContent.hero.infoGrid.audience.zh, /\n次要：/);
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
      assert.equal(index.canonicalId, key);
      assert.ok(!ids.has(key), `duplicate canonicalId ${key}`);
      ids.add(key);
    }
  }
  for (const domain of ssot.contentDiscovery.domains) {
    for (const key of [...(domain.featuredProjectIds ?? []), ...(domain.supportingProjectIds ?? [])]) {
      assert.ok(ssot.projects[key], `${domain.id} -> ${key}`);
      assert.ok(ssot.projects[key].searchIndexV2.domainIds.includes(domain.id), `${key} -> ${domain.id}`);
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

test("renders Voucher Center only from the r119 popup composition", () => {
  const ssot = JSON.parse(read("content/portfolio-content.json"));
  const app = read("assets/js/app.js");
  const css = read("assets/css/components/project-detail-overview.css");
  const project = ssot.projects["voucher-center"];
  const composition = project.popupComposition;
  assert.equal(ssot.contentVersion, "2026-08-04-r119");
  assert.deepEqual(composition.sectionOrder, [
    "hero", "phased-validation-path", "research-changed-the-model", "key-decisions",
    "product-scope", "reusable-system", "ownership-and-evidence", "continue-exploring"
  ]);
  assert.equal(composition.sectionNavigator.items.length, 7);
  assert.equal(new Set(composition.sectionNavigator.items.map((item) => item.sectionId)).size, 7);
  assert.deepEqual(composition.sections.keyDecisions.decisionIds, ["voucher-center-decision-01", "voucher-center-decision-03"]);
  assert.match(app, /project\.popupComposition\?\.id==='voucher-center-popup-r119'/);
  assert.match(app, /function renderVoucherComposition\(project\)/);
  assert.match(app, /function projectNavItems\(\)/);
  assert.match(app, /return DEFAULT_PROJECT_NAV_ITEMS/);
  assert.match(app, /if\(project\.popupComposition\?\.id==='voucher-center-popup-r119'\)\{[\s\S]*?renderVoucherComposition\(project\);[\s\S]*?return;/);
  assert.match(css, /\.voucher-composition-v119\{/);
  assert.doesNotMatch(css, /\.voucher-composition-v119[^}]*!important/);
});
