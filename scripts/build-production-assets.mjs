import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import vm from "node:vm";

const root = path.resolve("public/site");
const pages = ["index.html", "work.html", "experiments.html", "profile.html"];
const cssSources = [
  "assets/css/tokens.css",
  "assets/css/base.css",
];
const componentCssSources = [
  "assets/css/components/foundation.css",
  "assets/css/components/search.css",
  "assets/css/components/popup-shell.css",
  "assets/css/components/project-detail-overview.css",
  "assets/css/components/domain-selector.css",
  "assets/css/components/horizontal-rail.css",
  "assets/css/components/project-card.css",
  "assets/css/components/experiment-card.css",
  "assets/css/components/profile-card.css",
  "assets/css/components/profile-interest-mosaic.css",
  "assets/css/components/editorial-section.css",
];
const jsSources = [
  "assets/js/data.js",
  "assets/js/project-ssot.js",
  "assets/js/app.js",
  "assets/js/home.js",
  "assets/js/work.js",
  "assets/js/loading-v59.js",
  "assets/js/system-v70.js",
  "assets/js/system-v71.js",
];

function bundle(sources, banner) {
  return `${banner}\n${sources.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n")}`;
}

const searchSelectorPattern = /(?:^|[\s>+~,.#:])(?:matcher(?:-|\b)|match(?:-|\b)|chip-rail\b|chip\b|result-projects\b|no-match(?:-|\b))/;
const popupShellSelectorPattern = /(?:^|[\s>+~,.#:])(?:detail-dialog(?:-|\b)|dialog-scroll\b|dialog-controls(?:-|\b)|modal-close(?:-|\b)|modal-back(?:-|\b))/;
const projectDetailOverviewSelectorPattern = /(?:^|[\s>+~,.#:])(?:modal-content-v45\b|modal-head-v45\b|modal-head-meta-v60\b|detail-period-v60\b|modal-classification-v45(?:-|__|\b)|modal-tags\b|detail-status(?:-|\b)|detail-commerce-v45(?:-|__|\b)|modal-gallery(?:-|\b)|gallery-stage-v45\b|gallery-copy-v45\b|gallery-thumbs-v45\b|gallery-count-v45\b|quick-view-v51(?:-|__|\b)|project-summary-v45\b|project-signals-v45(?:-|__|\b)|info-grid-v45(?:-|__|\b))/;
const domainSelectorPattern = /(?:^|[\s>+~,.#:])(?:domain-selectors\b|domain-tab(?:-|__|\b)|domain-stage\b|domain-mobile-picker-v42\b|domain-chip-rail-v56\b|domain-floating-nav-v52(?:-|__|\b)|domain-floating-chip-v52\b)/;
const horizontalRailSelectorPattern = /(?:^|[\s>+~,.#:])(?:rail-(?:button|controls|heading)\b|project-card-rail\b|no-match-project-list-v45\b|domain-project-list-v30\b|detail-related-rail-v45\b|experiment-index-rail-v36\b|profile-side-rail-v34\b|playground-grid\b|work-filter-v32\b)/;
const foundationSelectorPattern = /(?:^|[\s>+~,.#:])(?:page-shell\b|skip-link\b|focus-visible\b)/;
const projectCardSelectorPattern = /(?:^|[\s>+~,.#:])(?:work-card-v32(?:-|__|\b)|work-gallery-v32\b|work-artifact\b|work-card-signals-v44\b|related-project-card(?:-|__|\b)|detail-related-card(?:-|__|\b)|detail-related-action-v46\b)/;
const experimentCardSelectorPattern = /(?:^|[\s>+~,.#:])(?:experiment-index-card-v36(?:-|__|\b)|experiment-index-card-v38(?:-|__|\b)|experiment-learning-preview-v38\b)/;
const profileCardSelectorPattern = /(?:^|[\s>+~,.#:])(?:profile-side-card-v34(?:-|__|\b)|profile-side-card-v52(?:-|__|\b)|interest-tile-v39(?:-|__|\b))/;
const profileInterestMosaicSelectorPattern = /(?:^|[\s>+~,.#:])(?:profile-interests-v39(?:-|__|\b)|interest-mosaic-v39\b)/;
const editorialSectionSelectorPattern = /(?:^|[\s>+~,.#:])(?:experience-overview-v42\b|work-reference\b|domain-chapter\b|selected-work\b|principles\b|playground\b|profile-chronology-v34\b|profile-awards-v36\b|profile-side-projects-v34\b|profile-interests-v39\b|work-page-v32\b|playground-page-v32\b|principles-section-v57\b|experiments-chapter\b|section-heading-v45\b)/;

const canonicalOwners = [
  ["Foundation", foundationSelectorPattern],
  ["Search", searchSelectorPattern],
  ["Popup shell", popupShellSelectorPattern],
  ["Project detail overview", projectDetailOverviewSelectorPattern],
  ["Domain selector", domainSelectorPattern],
  ["HorizontalRail", horizontalRailSelectorPattern],
  ["ProjectCard", projectCardSelectorPattern],
  ["ExperimentCard", experimentCardSelectorPattern],
  ["ProfileCard", profileCardSelectorPattern],
  ["Profile interest mosaic", profileInterestMosaicSelectorPattern],
  ["EditorialSection", editorialSectionSelectorPattern],
];

const registry = JSON.parse(fs.readFileSync(path.join(root, "docs/design-system/registry.current.json"), "utf8"));
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
}

const projectDetailEntry = live.find((component) => component.component === "ProjectDetailOverview");
if (projectDetailEntry?.contentOwner !== "assets/js/project-ssot.js") {
  throw new Error("ProjectDetailOverview must declare project-ssot.js as its single content owner");
}

function fingerprint(contents) {
  return createHash("sha256").update(contents).digest("hex").slice(0, 16);
}

function replaceProductionAssets(html, cssFile, jsFile) {
  const withoutCss = html.replace(/<link\b[^>]*href="\/site\/assets\/css\/(?:legacy-compat-v72|tokens-v72|system-v72|tokens|base|production\.[a-f0-9]+)\.css"[^>]*>/g, "");
  const withoutJs = withoutCss.replace(/<script\b[^>]*src="\/site\/assets\/js\/(?:data|project-ssot|leadership-v55|ssot-v58|app|home|work|loading-v59|system-v70|system-v71|production\.[a-f0-9]+)\.js"[^>]*><\/script>/g, "");
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
});
const componentCss = componentCssSources.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");

// A canonical selector may be responsive inside its own file, but it must never
// be declared by two component owners. This catches accidental second versions
// before they can reach production.
const selectorOwners = new Map();
for (const file of componentCssSources) {
  postcss.parse(fs.readFileSync(path.join(root, file), "utf8")).walkRules((rule) => {
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
const js = bundle(jsSources, "/* Generated production runtime. Edit canonical sources, not this file. */");

// Project editorial content has one mutation owner. Base data establishes the
// schema; only project-ssot.js may replace project content before rendering.
for (const file of jsSources.filter((file) => file !== "assets/js/project-ssot.js")) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  if (/Object\.assign\(projects(?:\.|\[)/.test(source)) {
    throw new Error(`Project content has a second mutation owner: ${file}`);
  }
}

const contentSandbox = { window: {} };
vm.createContext(contentSandbox);
for (const file of ["assets/js/data.js", "assets/js/project-ssot.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), contentSandbox, { filename: file });
}
const requiredProjectFields = [
  "transformation", "problem_types", "at_glance", "role", "owned", "scale",
  "decision", "type", "scope", "audience", "timeline", "why", "impact",
];
for (const [key, project] of Object.entries(contentSandbox.window.PORTFOLIO_DATA?.projects || {})) {
  const missing = requiredProjectFields.filter((field) => {
    const value = project[field];
    return value == null || value === "" || (Array.isArray(value) && value.length === 0);
  });
  if (missing.length) throw new Error(`Project ${key} is missing required decision content: ${missing.join(", ")}`);
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
