import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("redirects the root route without a client-side refresh", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), "http://localhost").pathname, "/site/index.html");
  assert.doesNotMatch(await response.text(), /http-equiv=["']refresh/i);
});

test("applies security headers and immutable cache to production assets", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("security", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/site/assets/css/production.74a478e77c04ba43.css"),
    { ASSETS: { fetch: async () => new Response("asset", { status: 200 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
});

test("keeps every portfolio page and its local assets reviewable", () => {
  const siteRoot = new URL("../public/site/", import.meta.url);
  const pages = ["index.html", "work.html", "experiments.html", "profile.html"];

  for (const page of pages) {
    const html = fs.readFileSync(new URL(page, siteRoot), "utf8");
    assert.match(html, /data-version="41"/);
    assert.match(html, /href="\/site\/assets\/css\/production\.[a-f0-9]{16}\.css"/);
    assert.match(html, /src="\/site\/assets\/js\/production\.[a-f0-9]{16}\.js"/);
    assert.equal((html.match(/<link[^>]+\.css/g) ?? []).length, 1);
    assert.equal((html.match(/<script[^>]+src=/g) ?? []).length, 1);
    assert.match(html, /href="\/site\/profile\.html"/);
    assert.match(html, /id="detailDialog"/);
    assert.match(html, /id="detailPeriod"/);

    const assets = [...html.matchAll(/(?:href|src)="(assets\/[^"]+)"/g)].map((match) => match[1]);
    for (const asset of assets) {
      assert.equal(fs.existsSync(new URL(asset, siteRoot)), true, `${page}: missing ${asset}`);
    }
  }
});

test("isolates the global foundation and rejects cross-owner component versions", () => {
  const build = fs.readFileSync(new URL("../scripts/build-production-assets.mjs", import.meta.url), "utf8");
  const foundation = fs.readFileSync(new URL("../public/site/assets/css/components/foundation.css", import.meta.url), "utf8");
  assert.match(build, /foundationSelectorPattern/);
  assert.match(build, /Canonical selector has multiple owners/);
  assert.match(build, /Cross-owner \$\{name\} selector exists in canonical base/);
  assert.match(build, /Versioned CSS source entered production/);
  assert.doesNotMatch(build, /cssSources = \[[\s\S]*legacy-compat-v72\.css/);
  assert.match(foundation, /\.page-shell/);
  assert.match(foundation, /:where\(a,button,input,select,textarea,\[tabindex\]\):focus-visible/);
});

test("uses one CURRENT registry and one exclusive owner per Live component", () => {
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry.current.json", import.meta.url), "utf8"));
  const build = fs.readFileSync(new URL("../scripts/build-production-assets.mjs", import.meta.url), "utf8");
  assert.equal(registry.status, "Live / Current Production");
  assert.equal(registry.policy.singleLiveEntry, true);
  assert.equal(registry.policy.versionedLiveOwnersForbidden, true);
  const live = registry.components.filter((component) => component.status === "Live / Current Production");
  assert.equal(new Set(live.map((component) => component.component)).size, live.length);
  assert.equal(new Set(live.filter((component) => component.exclusiveOwner !== false).map((component) => component.cssOwner)).size, live.length);
  for (const component of live) {
    assert.doesNotMatch(component.cssOwner.split("/").at(-1), /v\d+/i);
    assert.equal(fs.existsSync(new URL(`../public/site/${component.cssOwner}`, import.meta.url)), true);
  }
  for (const guard of ["Multiple Live registry entries", "Versioned CSS cannot be a Live owner", "Live CSS owner is not bundled canonically", "Live components share an exclusive CSS owner"]) {
    assert.match(build, new RegExp(guard));
  }
  assert.equal(registry.components.find((entry) => entry.component === "ProjectDetailOverview").contentOwner, "assets/js/project-ssot.js");
  assert.match(build, /Project content has a second mutation owner/);
  assert.match(build, /missing required decision content/);
});

test("migrates visible components and editorial rhythm out of versioned runtime owners", () => {
  const build = fs.readFileSync(new URL("../scripts/build-production-assets.mjs", import.meta.url), "utf8");
  const owners = [
    ["ProjectCard", "project-card.css", "projectCardSelectorPattern"],
    ["ExperimentCard", "experiment-card.css", "experimentCardSelectorPattern"],
    ["ProfileCard", "profile-card.css", "profileCardSelectorPattern"],
    ["EditorialSection", "editorial-section.css", "editorialSectionSelectorPattern"],
    ["ProjectDetailOverview", "project-detail-overview.css", "projectDetailOverviewSelectorPattern"],
    ["DomainSelector", "domain-selector.css", "domainSelectorPattern"],
    ["ProfileInterestMosaic", "profile-interest-mosaic.css", "profileInterestMosaicSelectorPattern"],
  ];
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry.current.json", import.meta.url), "utf8"));
  for (const [component, file, pattern] of owners) {
    assert.match(build, new RegExp(pattern));
    assert.ok(registry.components.some((entry) => entry.component === component && entry.cssOwner.endsWith(file)));
  }
  const pages = ["index.html", "work.html", "experiments.html", "profile.html"];
  for (const page of pages) {
    const html = fs.readFileSync(new URL(`../public/site/${page}`, import.meta.url), "utf8");
    assert.equal((html.match(/<link[^>]+\.css/g) ?? []).length, 1);
  }
});

test("renders the complete SSOT decision hierarchy before case-study evidence", () => {
  const app = fs.readFileSync(new URL("../public/site/assets/js/app.js", import.meta.url), "utf8");
  const data = fs.readFileSync(new URL("../public/site/assets/js/data.js", import.meta.url), "utf8");
  const ssot = fs.readFileSync(new URL("../public/site/assets/js/project-ssot.js", import.meta.url), "utf8");
  for (const field of ["'WHAT I DESIGNED'", "'PRIMARY USERS'"]) assert.match(app, new RegExp(field));
  assert.doesNotMatch(app, /renderInfoGrid\('detailInfo',[\s\S]{0,320}p\.timeline/);
  assert.match(app, /p\.owned,p\.owned_zh/);
  assert.match(app, /p\.decision,p\.decision_zh/);
  assert.match(app, /p\.scale,p\.scale_zh/);
  assert.match(ssot, /Object\.assign\(projects\.dbs/);
  assert.doesNotMatch(ssot, /project-signals-v45/);
  assert.match(app, /\[p\.scope,p\.scope_zh\]/);
  assert.match(app, /detailPeriod'\),localize\(\[p\.timeline,p\.timeline_zh\]\)/);
  for (const project of ["dbs", "voucher", "hours", "booking"]) {
    const start = data.indexOf(`    ${project}: {`);
    assert.notEqual(start, -1, `Missing SSOT project: ${project}`);
    const block = data.slice(start, data.indexOf("\n    },", start) + 7);
    for (const field of ["transformation:", "problem_types:", "at_glance:", "type:", "scope:", "audience:", "timeline:"]) {
      assert.match(block, new RegExp(field), `${project}: missing ${field}`);
    }
  }
});

test("preserves project signal render targets until SSOT values arrive", () => {
  const system = fs.readFileSync(new URL("../public/site/assets/js/system-v70.js", import.meta.url), "utf8");
  assert.doesNotMatch(system, /if\s*\(empty\)\s*cell\.remove\(\)/);
  assert.match(system, /cell\.hidden\s*=\s*empty/);

  const value = { textContent: "" };
  const cell = {
    dataset: {},
    hidden: false,
    querySelector: () => value,
    remove: () => { throw new Error("Project signal render target was removed"); },
  };
  let observeCallback;
  const document = {
    documentElement: { lang: "en" },
    getElementById: () => ({}),
    querySelectorAll: (selector) => selector.startsWith(".info-grid-v45") ? [cell] : [],
  };
  class MutationObserver {
    constructor(callback) { observeCallback = callback; }
    observe() {}
  }
  vm.runInNewContext(system, { document, MutationObserver });
  assert.equal(cell.dataset.empty, "true");
  assert.equal(cell.hidden, true);
  value.textContent = "Lead Product Designer";
  observeCallback();
  assert.equal(cell.dataset.empty, "false");
  assert.equal(cell.hidden, false);
});

test("uses a traceable three-layer design token architecture", () => {
  const tokens = fs.readFileSync(new URL("../public/site/assets/css/tokens-v65.css", import.meta.url), "utf8");
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v65.css", import.meta.url), "utf8");
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry-v65.json", import.meta.url), "utf8"));
  for (const prefix of ["--ref-", "--sys-", "--cmp-"]) assert.match(tokens, new RegExp(prefix));
  assert.match(system, /var\(--cmp-card-shadow-hover\)/);
  assert.match(system, /var\(--sys-focus-ring\)/);
  assert.match(system, /prefers-reduced-motion:reduce/);
  assert.match(system, /forced-colors:active/);
  assert.equal(registry.version, 65);
  assert.deepEqual(registry.architecture.dependencyChain, ["reference", "semantic", "component", "selector", "usage"]);
  assert.ok(registry.components.length >= 6);
});

test("keeps the simplified profile and the V63 visual contracts", () => {
  const profile = fs.readFileSync(new URL("../public/site/profile.html", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("../public/site/assets/css/portfolio-v63.css", import.meta.url), "utf8");
  assert.doesNotMatch(profile, /profile-credentials-v55/);
  assert.match(css, /--type-display-lg/);
  assert.match(css, /--rail-inline-space:0px/);
  assert.match(css, /#crossImpact/);
  assert.match(css, /domain-tab-v38/);
});

test("uses the unmasked complete-card rail contract", () => {
  const css = fs.readFileSync(new URL("../public/site/assets/css/portfolio-v64.css", import.meta.url), "utf8");
  assert.match(css, /\[data-rail\]/);
  assert.match(css, /mask-image:none!important/);
  assert.match(css, /--rail-card-columns:3/);
  assert.match(css, /--rail-card-columns:2/);
  assert.match(css, /--rail-card-columns:1/);
  assert.match(css, /scroll-snap-stop:always/);
});

test("isolates the canonical rail owner and advances by one rendered card", () => {
  const css = fs.readFileSync(new URL("../public/site/assets/css/components/horizontal-rail.css", import.meta.url), "utf8");
  const build = fs.readFileSync(new URL("../scripts/build-production-assets.mjs", import.meta.url), "utf8");
  const app = fs.readFileSync(new URL("../public/site/assets/js/app.js", import.meta.url), "utf8");
  const docs = fs.readFileSync(new URL("../public/site/docs/design-system/components/horizontal-rail.md", import.meta.url), "utf8");
  assert.match(css, /--rail-gap:\s*12px/);
  assert.match(css, /scroll-snap-stop:always/);
  assert.match(css, />\*:last-child\{scroll-snap-align:end\}/);
  assert.match(build, /horizontalRailSelectorPattern/);
  assert.match(build, /Cross-owner \$\{name\} selector exists in canonical base/);
  assert.match(app, /first\.getBoundingClientRect\(\)\.width\+gap/);
  assert.match(app, /rail\.dataset\.railScrollable/);
  assert.match(docs, /CSS Owner: `assets\/css\/components\/horizontal-rail\.css`/);
});

test("uses separate back and close-all dialog contracts", () => {
  const app = fs.readFileSync(new URL("../public/site/assets/js/app.js", import.meta.url), "utf8");
  assert.match(app, /const detailStack=\[\]/);
  assert.match(app, /detailStack\.push/);
  assert.match(app, /function returnToPreviousDetail\(\)/);
  assert.match(app, /dialogClose\?\.addEventListener\('click',closeDialog\)/);
  assert.match(app, /dialogBack\?\.addEventListener\('click',returnToPreviousDetail\)/);
  assert.match(app, /event\.target===dialog\)closeDialog\(\)/);
  assert.match(app, /detailStack\.length=0;rootInvoker=null/);
});

test("uses role, reach, decision, image-performance, and ranked-work contracts", () => {
  const app = fs.readFileSync(new URL("../public/site/assets/js/app.js", import.meta.url), "utf8");
  const work = fs.readFileSync(new URL("../public/site/work.html", import.meta.url), "utf8");
  const profile = fs.readFileSync(new URL("../public/site/profile.html", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("../public/site/assets/css/system-v66.css", import.meta.url), "utf8");
  assert.match(work, /My role/);
  assert.match(work, /Operational reach/);
  assert.match(work, /Decision thesis/);
  assert.match(work, /Ownership &amp; collaboration/);
  assert.match(app, /contribution\?`\$\{role\} — \$\{contribution\}`:role/);
  assert.match(profile, /loading="lazy" decoding="async" fetchpriority="low" width="640" height="420"/);
  assert.match(css, /data-feature-rank="1"/);
  assert.match(css, /grid-column:span 7!important/);
  assert.match(css, /recruiter-proof-item-v46 strong/);
});

test("keeps matcher sessions and popup metadata non-duplicative", () => {
  const home = fs.readFileSync(new URL("../public/site/assets/js/home.js", import.meta.url), "utf8");
  const app = fs.readFileSync(new URL("../public/site/assets/js/app.js", import.meta.url), "utf8");
  assert.match(home, /portfolioMatcherState_v70/);
  assert.match(home, /pendingResultFocus=true/);
  assert.match(home, /function setMatcherState\(state,retainResult=false\)/);
  assert.match(home, /data-matcher-state/);
  assert.match(home, /\['matched','no-match'\]\.includes\(state\)/);
  assert.doesNotMatch(home, /syncQueryState/);
  assert.doesNotMatch(home, /classList\.toggle\('has-query'/);
  assert.doesNotMatch(app, /'TIMELINE',localize\(e\.timeline\)/);
  assert.match(app, /renderInfoGrid\('detailInfoExperiment',\[\[lang==='zh'\?'目前階段':'CURRENT STAGE',stage\]\]\)/);
});

test("uses V67 scoped evidence, shared visual crops, and reserved dialog controls", () => {
  const app = fs.readFileSync(new URL("../public/site/assets/js/app.js", import.meta.url), "utf8");
  const home = fs.readFileSync(new URL("../public/site/assets/js/home.js", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("../public/site/assets/css/system-v67.css", import.meta.url), "utf8");
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry-v67.json", import.meta.url), "utf8"));
  assert.match(css, /dialog-controls-v67/);
  assert.match(css, /--cmp-evidence-section-padding/);
  assert.match(css, /detail-related-rail-v45/);
  assert.match(css, /matcher-workspace\.has-query/);
  assert.match(app, /appendArtifactContents/);
  assert.match(app, /decision-visual-v67__crop/);
  assert.doesNotMatch(app, /View in evidence gallery/);
  assert.match(home, /setMatcherState/);
  assert.equal(registry.version, 67);
});

test("enforces the V70 matcher and related-project regression contracts", () => {
  const home = fs.readFileSync(new URL("../public/site/assets/js/home.js", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("../public/site/assets/css/system-v68.css", import.meta.url), "utf8");
  const docs = fs.readFileSync(new URL("../public/site/docs/design-system/components/matcher.md", import.meta.url), "utf8");
  assert.match(home, /let mode='idle'/);
  assert.match(home, /sessionStorage\.removeItem\(MATCHER_STATE_KEY\)/);
  assert.match(home, /setWorkspace\('matched',before\)/);
  assert.match(home, /setMatcherState\('loading',keep\)/);
  assert.match(home, /variant==='search'[\s\S]*?'Relevance'/);
  assert.doesNotMatch(home, /variant==='search'[\s\S]{0,220}?'Scale'/);
  assert.match(css, /data-matcher-state="idle"/);
  assert.match(css, /has-result\.is-search-focused \.chip-rail/);
  assert.match(css, /\.result-projects \.project-card-rail/);
  assert.match(docs, /Input text never activates sticky mode/);
});

test("keeps compact Search responsive ownership inside the canonical component", () => {
  const css = fs.readFileSync(new URL("../public/site/assets/css/components/search.css", import.meta.url), "utf8");
  const docs = fs.readFileSync(new URL("../docs/design-system/components/search-matcher.md", import.meta.url), "utf8");
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /top:var\(--header-h\)/);
  assert.match(css, /matcher-workspace:not\(\.has-result\) \.chip-rail/);
  assert.match(css, /matcher-workspace\.has-result\.is-search-focused \.chip-rail\{[^}]*width:100%/);
  assert.match(css, /@media\(max-width:360px\)/);
  assert.match(docs, /minimum 44px touch target/);
});

test("keeps editorial section headings aligned by the canonical spacing owner", () => {
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v72.css", import.meta.url), "utf8");
  assert.match(system, /\.work-head,\.playground-head\s*\{\s*align-items:\s*start\s*!important;/);
  assert.match(system, /\.work-head__note\s*\{[\s\S]*align-self:\s*start\s*!important;/);
  assert.match(system, /\.playground-head\s*>\s*div:last-child\s*\{[\s\S]*align-self:\s*start\s*!important;/);
});

test("keeps homepage chapter spacing and inverse text in the canonical owner", () => {
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v72.css", import.meta.url), "utf8");
  const tokens = fs.readFileSync(new URL("../public/site/assets/css/tokens-v72.css", import.meta.url), "utf8");
  assert.match(system, /:is\([^)]*\.domain-chapter[^)]*\.principles[^)]*\.playground[^)]*\)\s*\{\s*padding-block:\s*var\(--section-space\)\s*!important;/);
  assert.doesNotMatch(system, /:is\([^)]*\.matcher-chapter[^)]*\.domain-chapter/);
  assert.match(system, /\.domain-intro \.kicker,\.principles-v38__head \.kicker\s*\{\s*color:\s*var\(--color-text-inverse\)\s*!important;/);
  assert.match(tokens, /--color-text-inverse:\s*var\(--paper-0\)/);
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry-v72.json", import.meta.url), "utf8"));
  assert.ok(registry.components.some((component) => component.component === "EditorialChapter"));
});

test("keeps focus, touch targets, and supporting-page rhythm in canonical owners", () => {
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v72.css", import.meta.url), "utf8");
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry-v72.json", import.meta.url), "utf8"));
  assert.match(system, /:where\(a,button,input,select,\[tabindex\]\):focus-visible\s*\{[\s\S]*outline:\s*3px solid var\(--color-focus\)\s*!important;/);
  assert.doesNotMatch(system, /:where\(a,button,input,select,\[tabindex\]\):focus-visible\s*\{\s*outline:\s*0/);
  assert.match(system, /:where\(button,\[role="button"\],a\[data-pressable\]\)\s*\{\s*min-height:\s*var\(--control-height\)/);
  assert.match(system, /\.work-library-v32\s*\{\s*padding-bottom:\s*var\(--section-space\)/);
  assert.match(system, /\.experiment-index-v36\s*\{\s*padding-bottom:\s*var\(--section-space\)/);
  assert.ok(registry.components.some((component) => component.component === "InteractionFoundation"));
  assert.ok(registry.components.some((component) => component.component === "SupportingPageRhythm"));
});

test("keeps card contrast and interactive states in semantic owners", () => {
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v72.css", import.meta.url), "utf8");
  const tokens = fs.readFileSync(new URL("../public/site/assets/css/tokens-v72.css", import.meta.url), "utf8");
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry-v72.json", import.meta.url), "utf8"));
  assert.match(tokens, /--color-state-selected-bg:\s*var\(--ink-950\)/);
  assert.match(tokens, /--color-state-disabled-text:\s*var\(--ink-650\)/);
  assert.match(system, /:where\(button,\[role="button"\]\):disabled[\s\S]*opacity:\s*1\s*!important;/);
  assert.match(system, /\.domain-tab-v38\[aria-selected="true"\][\s\S]*border-color:\s*var\(--color-focus\)/);
  assert.match(system, /\.career-timeline-v34__meta[\s\S]*color:\s*var\(--color-text-inverse-secondary\)/);
  assert.match(system, /\.experiment-index-card-v36--cyan[\s\S]*color:\s*var\(--color-text-inverse-secondary\)/);
  assert.ok(registry.components.some((component) => component.component === "InteractiveState"));
  assert.ok(registry.components.some((component) => component.component === "SupportingText"));
});

test("keeps experiment and profile card density in canonical owners", () => {
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v72.css", import.meta.url), "utf8");
  const tokens = fs.readFileSync(new URL("../public/site/assets/css/tokens-v72.css", import.meta.url), "utf8");
  const rail = fs.readFileSync(new URL("../public/site/assets/css/components/horizontal-rail.css", import.meta.url), "utf8");
  assert.match(tokens, /--experiment-card-min-block:/);
  assert.match(tokens, /--profile-card-min-block:/);
  assert.match(system, /\.experiment-index-card-v36\s*\{[\s\S]*min-height:\s*var\(--experiment-card-min-block\)\s*!important;/);
  assert.match(system, /\.profile-side-card-v34\s*\{[\s\S]*min-height:\s*var\(--profile-card-min-block\)\s*!important;/);
  assert.match(system, /overflow-wrap:\s*anywhere/);
  assert.match(rail, /--rail-card-experiment:\s*clamp\(292px,29vw,372px\)/);
  assert.match(rail, /--rail-card-profile:\s*clamp\(244px,25vw,304px\)/);
});

test("keeps responsive project-card sizing and action alignment in one owner", () => {
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v72.css", import.meta.url), "utf8");
  const tokens = fs.readFileSync(new URL("../public/site/assets/css/tokens-v72.css", import.meta.url), "utf8");
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry-v72.json", import.meta.url), "utf8"));
  assert.match(tokens, /--project-card-media-block:\s*clamp\(/);
  assert.match(tokens, /--project-card-media-block-mobile:\s*clamp\(/);
  assert.match(system, /\.work-card-v32__action\s*\{[\s\S]*margin-top:\s*auto\s*!important;/);
  assert.match(system, /\.work-card-v32:not\(\.work-card-v32--featured\) \.work-card-v32__button\s*\{[\s\S]*grid-template-rows:\s*var\(--project-card-media-block\) minmax\(0, 1fr\)/);
  assert.match(system, /@media \(max-width: 900px\)[\s\S]*grid-template-rows:\s*var\(--project-card-media-block-mobile\) auto/);
  assert.ok(registry.components.some((component) => component.component === "ProjectCard" && component.tokenDependencies.includes("project-card-media-block")));
});

test("keeps one Search focus owner and a recruiter-readable result hierarchy", () => {
  const css = fs.readFileSync(new URL("../public/site/assets/css/components/search.css", import.meta.url), "utf8");
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v72.css", import.meta.url), "utf8");
  const tokens = fs.readFileSync(new URL("../public/site/assets/css/tokens-v72.css", import.meta.url), "utf8");
  assert.match(system, /\.matcher-input:focus-visible\s*\{[\s\S]*outline:\s*0\s*!important/);
  assert.match(css, /\.matcher-form:focus-within\{[^}]*outline:3px solid/);
  assert.match(css, /\.match-title\{[^}]*max-width:18ch[^}]*clamp\(2\.25rem,3\.25vw,3rem\)/);
  assert.match(css, /matcher-workspace\.has-result\{grid-template-columns:minmax\(300px,\.34fr\) minmax\(0,\.66fr\)/);
  assert.match(tokens, /--page-max:\s*1280px/);
});

test("enforces the V72 global UI and navigation contracts", () => {
  const root = new URL("../public/site/", import.meta.url);
  const css = fs.readFileSync(new URL("assets/css/system-v72.css", root), "utf8");
  const js = fs.readFileSync(new URL("assets/js/system-v71.js", root), "utf8");
  for (const page of ["index.html", "work.html", "experiments.html", "profile.html"]) {
    const html = fs.readFileSync(new URL(page, root), "utf8");
    assert.match(html, /data-en="Experiment"/);
    assert.match(html, /href="\/site\/work\.html"/);
    assert.match(html, /href="\/site\/experiments\.html"/);
    assert.match(html, /href="\/site\/profile\.html"/);
    assert.match(html, /data-lang-toggle/);
  }
  assert.match(css, /mask-image: none !important/);
  assert.match(css, /grid-template-rows: auto minmax\(3\.2em, auto\) 1fr auto/);
  assert.match(css, /dialog-controls-v67/);
  assert.match(css, /place-items: center/);
  assert.match(css, /data-matcher-state="idle"/);
  assert.match(js, /location\.assign\(url\.href\)/);
  const registry = JSON.parse(fs.readFileSync(new URL("docs/design-system/registry-v72.json", root), "utf8"));
  assert.equal(registry.version, 72);
  assert.equal(registry.architecture.canonicalCssOwner, "assets/css/system-v72.css");
});

test("uses V68 recruiter hierarchy and token governance", () => {
  const tokens = fs.readFileSync(new URL("../public/site/assets/css/tokens-v68.css", import.meta.url), "utf8");
  const system = fs.readFileSync(new URL("../public/site/assets/css/system-v68.css", import.meta.url), "utf8");
  const app = fs.readFileSync(new URL("../public/site/assets/js/app.js", import.meta.url), "utf8");
  const registry = JSON.parse(fs.readFileSync(new URL("../public/site/docs/design-system/registry-v68.json", import.meta.url), "utf8"));
  assert.match(tokens, /--cmp-reading-card-measure/);
  assert.match(tokens, /--cmp-dialog-control-backdrop/);
  assert.match(system, /var\(--cmp-work-feature-columns\)/);
  assert.match(system, /var\(--cmp-decision-media-min-height\)/);
  assert.match(app, /p\.owned,p\.owned_zh/);
  assert.equal(registry.version, 68);
});
