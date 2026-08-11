import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const root = path.resolve("public/site");
const pages = ["index.html", "work.html", "experiments.html", "profile.html"];
const cssSources = [
  "assets/css/tokens.css",
  "assets/css/base.css",
];
const componentCssSources = [
  "assets/css/components/foundation.css",
  "assets/css/components/arrow-icon.css",
  "assets/css/components/site-chrome.css",
  "assets/css/components/hero.css",
  "assets/css/components/search.css",
  "assets/css/components/popup-shell.css",
  "assets/css/components/project-detail-overview.css",
  "assets/css/components/domain-selector.css",
  "assets/css/components/horizontal-rail.css",
  "assets/css/components/work-library.css",
  "assets/css/components/project-card.css",
  "assets/css/components/artifact-visual.css",
  "assets/css/components/experiment-card.css",
  "assets/css/components/profile-card.css",
  "assets/css/components/profile-interest-mosaic.css",
  "assets/css/components/editorial-section.css",
  "assets/css/components/supporting-page-layout.css",
  "assets/css/components/selected-evidence.css",
  "assets/css/components/homepage-evidence.css",
];
const jsSources = [
  "assets/js/app.js",
  "assets/js/home.js",
  "assets/js/work.js",
  "assets/js/runtime.js",
];
const contentOwner = "content/portfolio-content.json";
const assetManifestOwner = "content/portfolio-asset-manifest.json";

function bundle(sources, banner) {
  return `${banner}\n${sources.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n")}`;
}

const searchSelectorPattern = /(?:^|[\s>+~,.#:])(?:matcher(?:-|\b)|match(?:-|\b)|chip-rail\b|chip\b|result-projects\b|no-match(?:-|\b))/;
const popupShellSelectorPattern = /(?:^|[\s>+~,.#:])(?:detail-dialog(?:-|\b)|dialog-scroll\b|dialog-controls(?:-|\b)|modal-close(?:-|\b)|modal-back(?:-|\b))/;
const projectDetailOverviewSelectorPattern = /(?:^|[\s>+~,.#:])(?:modal-content-v45\b|modal-head-v45\b|modal-head-meta-v60\b|detail-period-v60\b|modal-classification-v45(?:-|__|\b)|modal-tags\b|detail-status(?:-|\b)|detail-commerce-v45(?:-|__|\b)|modal-gallery(?:-|\b)|gallery-stage-v45\b|gallery-copy-v45\b|gallery-thumbs-v45\b|gallery-count-v45\b|quick-view-v51(?:-|__|\b)|project-summary-v45\b|project-signals-v45(?:-|__|\b)|info-grid-v45(?:-|__|\b)|project-evidence-v45\b|decision-(?:section|list|card|number|body|result|considerations|evidence|field|visual)(?:-|__|\b))/;
const domainSelectorPattern = /(?:^|[\s>+~,.#:])domain(?:-|\b)/;
const horizontalRailSelectorPattern = /(?:\[data-rail\]|(?:^|[\s>+~,.#:])(?:rail-(?:button|controls|heading)\b|project-card-rail\b|no-match-project-list-v45\b|domain-project-list-v30\b|detail-related-rail-v45\b|experiment-index-rail-v36\b|profile-side-rail-v34\b|playground-grid\b|work-filter-v32\b))/;
const foundationSelectorPattern = /(?:^|[\s>+~,.#:])(?:page-shell\b|skip-link\b|focus-visible\b)/;
const arrowIconSelectorPattern = /(?:^|[\s>+~,.#:])(?:icon-arrow(?:-|\b))/;
const siteChromeSelectorPattern = /(?:^|[\s>+~,.#:])(?:site-header\b|header-inner\b|brand\b|nav\b|lang-toggle\b|menu-toggle\b|menu-icon\b|mobile-menu\b|site-footer\b|contact-bar-v42(?:-|__|\b)|footer-meta-v42\b|is-locked\b)/;
const heroSelectorPattern = /(?:^|[\s>+~,.#:])(?:hero(?:-|__|\b))/;
const projectCardSelectorPattern = /(?:^|[\s>+~,.#:])(?:work-card-v32(?:-|__|\b)|work-gallery-v32\b|work-artifact\b|work-card-signals-v44\b|related-project-card(?:-|__|\b)|detail-related-card(?:-|__|\b)|detail-related-action-v46\b)/;
const artifactVisualSelectorPattern = /(?:^|[\s>+~,.#:])(?:artifact-(?:browser|side|canvas|banner|state|flow)(?:-|__|\b)|rollout-map(?:-|__|\b)|market-dot(?:-|\b)|readiness-list\b|tracker-(?:panel|nav|content|title|cell)(?:-|\b)|learning-artifact-v39(?:-|__|\b)|window-top\b|flow(?:-|\b))/;
const experimentCardSelectorPattern = /(?:^|[\s>+~,#:])\.(?:experiment(?:-|\b)|poster(?:-|\b)|playground-hero(?:-|\b)|play-shape(?:-|\b)|play-line\b|shape-(?:circle|pill|small)\b)/;
const profileExperienceSelectorPattern = /(?:^|[\s>+~,.#:])(?:profile-(?:hero-v36|value-v44|value-v55|chronology-v34|awards-v36|side-projects-v34|side-card-v34|side-card-v52)(?:-|__|\b)|career-timeline-v34(?:-|__|\b)|timeline-evidence(?:-|__|\b)|award-list-v36(?:-|__|\b))/;
const profileInterestMosaicSelectorPattern = /(?:^|[\s>+~,.#:])(?:profile-interests-v39(?:-|__|\b)|interest-(?:mosaic-v39|tile-v39)(?:-|__|\b))/;
const editorialSectionSelectorPattern = /(?:^|[\s>+~,.#:])(?:experience-overview-v42\b|work-reference\b|domain-chapter\b|selected-work\b|principles\b|playground\b|work-page-v32\b|playground-page-v32\b|principles-section-v57\b|experiments-chapter\b|section-heading-v45\b)/;
const supportingPageLayoutSelectorPattern = /(?:^|[\s>+~,.#:])(?:page-hero(?:-|\b))/;
const selectedEvidenceSelectorPattern = /(?:^|[\s>+~,.#:])(?:evidence-section(?:-|__|\b)|evidence-feature(?:-|__|\b)|evidence-list(?:-|__|\b))/;
const homepageEvidenceSelectorPattern = /(?:^|[\s>+~,.#:])(?:experience-(?:proof|metrics|orgs|org-group)(?:-|__|\b)|metric-(?:value|number|unit)(?:-|__|\b)|principle-(?:cards|card|evidence)(?:-|__|\b)|principles-v\d+(?:-|__|\b))/;

const canonicalOwners = [
  ["Foundation", foundationSelectorPattern],
  ["ArrowIcon", arrowIconSelectorPattern],
  ["SiteChrome", siteChromeSelectorPattern],
  ["Hero", heroSelectorPattern],
  ["Search", searchSelectorPattern],
  ["Popup shell", popupShellSelectorPattern],
  ["Project detail overview", projectDetailOverviewSelectorPattern],
  ["Domain selector", domainSelectorPattern],
  ["HorizontalRail", horizontalRailSelectorPattern],
  ["ProjectCard", projectCardSelectorPattern],
  ["ArtifactVisual", artifactVisualSelectorPattern],
  ["ExperimentCard", experimentCardSelectorPattern],
  ["ProfileExperience", profileExperienceSelectorPattern],
  ["Profile interest mosaic", profileInterestMosaicSelectorPattern],
  ["EditorialSection", editorialSectionSelectorPattern],
  ["SupportingPageLayout", supportingPageLayoutSelectorPattern],
  ["SelectedEvidence", selectedEvidenceSelectorPattern],
  ["HomepageEvidence", homepageEvidenceSelectorPattern],
];

const registry = JSON.parse(fs.readFileSync(path.join(root, "docs/design-system/registry.json"), "utf8"));
if (registry.status !== "Live / Current Production") throw new Error("CURRENT registry must be Live / Current Production");
const live = registry.components.filter((component) => component.status === "Live / Current Production");
const componentNames = new Set();
const cssOwners = new Map();
for (const component of live) {
  if (componentNames.has(component.component)) throw new Error(`Multiple Live registry entries: ${component.component}`);
  componentNames.add(component.component);
  if (!component.cssOwner || !component.renderSource) throw new Error(`Incomplete Live registry entry: ${component.component}`);
  if (/\bv\d+\b/i.test(path.basename(component.cssOwner))) throw new Error(`Versioned CSS cannot be a Live owner: ${component.cssOwner}`);
  if (!componentCssSources.includes(component.cssOwner)) throw new Error(`Live CSS owner is not bundled canonically: ${component.cssOwner}`);
  const owner = cssOwners.get(component.cssOwner);
  if (owner && owner !== component.component && component.exclusiveOwner !== false) {
    throw new Error(`Live components share an exclusive CSS owner: ${owner}, ${component.component}`);
  }
  cssOwners.set(component.cssOwner, component.component);
  if (component.contentOwner) {
    const isRuntimeSource = jsSources.includes(component.contentOwner);
    const isStructuredContent = component.contentOwner.startsWith("content/") && component.contentOwner.endsWith(".json");
    if (!isRuntimeSource && !isStructuredContent) throw new Error(`Live content owner is not wired canonically: ${component.contentOwner}`);
    if (!fs.existsSync(path.join(root, component.contentOwner))) throw new Error(`Live content owner is missing: ${component.contentOwner}`);
  }
}

for (const component of live.filter((entry) => entry.contentOwner)) {
  if (component.contentOwner !== contentOwner) {
    throw new Error(`${component.component} must use the single portfolio content owner`);
  }
}
const content = JSON.parse(fs.readFileSync(path.join(root, contentOwner), "utf8"));
const assetManifest = JSON.parse(fs.readFileSync(path.join(root, assetManifestOwner), "utf8"));
const expectedProjectIds = [
  "voucher",
  "voucher-center",
  "game-center",
  "dbs",
  "booking",
  "bandzo",
  "taishin-p2p-marketplace-platform",
  "cathay-mortgage-assistant",
  "payment",
  "cathay-sit-online-account-opening",
  "cathay-sit-review-remediation-operations",
  "ctbc-mortgage-self-service-app",
  "booking-taxi-pickup-service-strategy",
];
if (content.contentVersion !== "2026-08-11-r155") throw new Error("The active Content SSOT must be r155");
if (!content.canonicalProjectSchema) throw new Error("The active Content SSOT must define canonicalProjectSchema");
if (!content.projectHeroContentContract) throw new Error("The active Content SSOT must define projectHeroContentContract");
const projectIds = Object.keys(content.projects || {});
if (projectIds.length !== 13 || new Set(projectIds).size !== 13) {
  throw new Error("The active Content SSOT must contain 13 unique projects");
}
if (projectIds.some((id, index) => id !== expectedProjectIds[index])) {
  throw new Error("The active Content SSOT project roster or order does not match the approved r146 contract");
}
for (const [projectId, project] of Object.entries(content.projects)) {
  const type = project.infoGrid?.type?.value;
  const problemTypes = project.problemTypes;
  if (!Array.isArray(project.sectionOrder) || !project.sectionOrder.length) throw new Error(`Project ${projectId} has no canonical root sectionOrder`);
  if (!project.company) throw new Error(`Project ${projectId} has no canonical company`);
  if (!project.domain) throw new Error(`Project ${projectId} has no canonical domain`);
  if (!type) throw new Error(`Project ${projectId} has no canonical Info Grid Type`);
  if (!problemTypes || !Array.isArray(problemTypes.en) || !Array.isArray(problemTypes.zh) || problemTypes.en.length < 1 || problemTypes.en.length > 3 || problemTypes.zh.length !== problemTypes.en.length) {
    throw new Error(`Project ${projectId} must have 1–3 bilingual canonical problemTypes`);
  }
}
const publicExplorations = [...Object.values(content.sideProjects || {}), ...Object.values(content.experiments || {})]
  .filter((item) => !String(item.contentStatus || "").includes("standalone-card-review"));
if (publicExplorations.length !== 6) {
  throw new Error("The active Content SSOT must contain 6 Explorations");
}
if (assetManifest.packageVersion !== "r45" || assetManifest.contentVersion !== "2026-08-11-r155") {
  throw new Error("The active Asset Manifest must be r45 aligned to Content r151");
}
const derivedVisualSlots = [];
function deriveVisualSlots(value, projectId, location = []) {
  if (Array.isArray(value)) return value.forEach((entry, index) => deriveVisualSlots(entry, projectId, [...location, index]));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    const next = [...location, key];
    if (["assetId", "publicAssetId", "beforeAssetId", "shippedAssetId"].includes(key) && typeof child === "string") {
      derivedVisualSlots.push({ projectId, slotId: next.join("."), assetId: child });
    } else if (key !== "sourceArchives") deriveVisualSlots(child, projectId, next);
  }
}
for (const [projectId, project] of Object.entries(content.projects)) deriveVisualSlots(project, projectId);
if (derivedVisualSlots.length !== 47 || new Set(derivedVisualSlots.map((slot) => slot.assetId)).size !== 43) {
  throw new Error("Content must derive exactly 47 runtime visual slots and 43 unique asset IDs");
}
for (const slot of derivedVisualSlots) {
  const record = assetManifest.items?.[slot.assetId];
  const fallback = assetManifest.items?.[record?.placeholderFallbackAssetId];
  if (!record || (record.assetStatus !== "production" && !fallback?.publicPath?.startsWith("/site/"))) {
    throw new Error(`Derived visual slot cannot resolve safely: ${slot.projectId}/${slot.slotId}`);
  }
}

function fingerprint(contents) {
  return createHash("sha256").update(contents).digest("hex").slice(0, 16);
}

function replaceProductionAssets(html, cssFile, jsFile) {
  const withoutCss = html.replace(/<link\b[^>]*href="\/site\/assets\/css\/(?:tokens|base|production\.[a-f0-9]+)\.css"[^>]*>/g, "");
  const withoutJs = withoutCss.replace(/<script\b[^>]*src="\/site\/assets\/js\/(?:data|project-ssot|app|home|work|runtime|production\.[a-f0-9]+)\.js"[^>]*><\/script>/g, "");
  return withoutJs
    .replace('<h2 class="heading-2" data-en="What are you trying to solve?"', '<h2 data-en="What are you trying to solve?"')
    .replace("</head>", `<link rel="stylesheet" href="/site/assets/css/${cssFile}"></head>`)
    .replace("</body>", `<script defer src="/site/assets/js/${jsFile}"></script></body>`);
}

for (const directory of ["assets/css", "assets/js"]) {
  for (const name of fs.readdirSync(path.join(root, directory))) {
    if (/^production\.[a-f0-9]+\.(?:css|js)$/.test(name)) fs.unlinkSync(path.join(root, directory, name));
  }
}

for (const source of cssSources) {
  if (/v\d+\.css$/i.test(source)) throw new Error(`Versioned CSS source entered production: ${source}`);
}
const canonicalCss = cssSources.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
postcss.parse(canonicalCss).walkRules((rule) => {
  for (const [name, pattern] of canonicalOwners) {
    if (rule.selectors.some((selector) => pattern.test(selector))) {
      throw new Error(`Cross-owner ${name} selector exists in canonical base: ${rule.selector}`);
    }
  }
  for (const selector of rule.selectors) {
    const classes = [...selector.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1]);
    const allowedGlobalClass = /^(?:button(?:--[\w-]+)?|text-button|motion-ready|is-inview|sr-only|section|dialog-open)$/;
    for (const className of classes) {
      if (!allowedGlobalClass.test(className)) {
        throw new Error(`Component selector leaked into canonical base: .${className} (${rule.selector})`);
      }
    }
  }
});
const componentCss = componentCssSources.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

// A rule may not silently override its own declaration later in the same
// block. That pattern was the primary source of false “single owner” claims:
// the selector had one file owner, but several competing values.
for (const file of [...cssSources, ...componentCssSources]) {
  postcss.parse(fs.readFileSync(path.join(root, file), "utf8")).walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name)) return;
    const declarations = new Set();
    for (const node of rule.nodes || []) {
      if (node.type !== "decl" || node.prop.startsWith("--")) continue;
      if (declarations.has(node.prop)) {
        throw new Error(`Rule overrides its own ${node.prop} declaration: ${file} (${rule.selector})`);
      }
      declarations.add(node.prop);
    }
  });
}

// Component styles are concatenated into a fingerprinted file in
// /site/assets/css. Relative url() references would then resolve from the
// bundle location rather than the component source location and can silently
// break production imagery. Require root-relative /site assets and verify that
// every referenced file exists before writing the bundle.
for (const match of componentCss.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
  const assetUrl = match[1];
  if (/^(?:data:|https?:|#)/.test(assetUrl)) continue;
  if (!assetUrl.startsWith("/site/")) {
    throw new Error(`Bundled CSS asset URL must be root-relative: ${assetUrl}`);
  }
  const assetPath = path.join(root, assetUrl.slice("/site/".length));
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Bundled CSS asset is missing: ${assetUrl}`);
  }
}

// A canonical selector may be responsive inside its own file, but it must never
// be declared by two component owners. This catches accidental second versions
// before they can reach production.
const selectorOwners = new Map();
for (const file of componentCssSources) {
  postcss.parse(fs.readFileSync(path.join(root, file), "utf8")).walkRules((rule) => {
    if (rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name)) return;
    for (const selector of rule.selectors) {
      const normalized = selector.replace(/\s+/g, " ").trim();
      // Component-scoped custom properties intentionally share :root; ownership
      // conflicts are about rendered selectors, not the token declaration host.
      if (normalized === ":root") continue;
      const previous = selectorOwners.get(normalized);
      if (previous && previous !== file) {
        throw new Error(`Canonical selector has multiple owners: ${normalized} (${previous}, ${file})`);
      }
      selectorOwners.set(normalized, file);
    }
  });
}
const css = `/* Generated production stylesheet. Edit canonical sources, not this file. */\n${canonicalCss}\n${componentCss}`;
function createRuntimeContentProjection(source) {
  const runtimeContent = structuredClone(source);
  delete runtimeContent.sourceArchives;
  for (const project of Object.values(runtimeContent.projects || {})) {
    for (const legacyField of [
      "transformation", "transformation_zh", "problem_types", "problem_types_zh",
      "at_glance", "at_glance_zh", "type", "type_zh", "legacyAliasStatus",
    ]) delete project[legacyField];
  }
  return runtimeContent;
}
const runtimeContent = createRuntimeContentProjection(content);
const contentRuntime = `window.PORTFOLIO_DATA=${JSON.stringify(runtimeContent)};\nwindow.PORTFOLIO_ASSET_MANIFEST=${JSON.stringify(assetManifest)};`;
const js = `${bundle([], "/* Generated production runtime. Edit canonical sources, not this file. */")}\n${contentRuntime}\n${jsSources.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n")}`;
for (const [key, project] of Object.entries(content.projects || {})) {
  if (!project.title?.en || !project.title?.zh) throw new Error(`Project ${key} has no bilingual canonical title`);
  if (!project.problemTypes?.en || !project.problemTypes?.zh) throw new Error(`Project ${key} has no bilingual canonical problemTypes`);
  if (!project.atAGlance?.en || !project.atAGlance?.zh) throw new Error(`Project ${key} has no bilingual canonical atAGlance`);
}
const cssFile = `production.${fingerprint(css)}.css`;
const jsFile = `production.${fingerprint(js)}.js`;
fs.writeFileSync(path.join(root, "assets/css", cssFile), css);
fs.writeFileSync(path.join(root, "assets/js", jsFile), js);

for (const page of pages) {
  const file = path.join(root, page);
  fs.writeFileSync(file, replaceProductionAssets(fs.readFileSync(file, "utf8"), cssFile, jsFile));
}

console.log(`Production assets: ${cssFile}, ${jsFile}`);

await import("./generate-project-pages.mjs");
