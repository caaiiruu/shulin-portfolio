import fs from "node:fs";
import path from "node:path";

const root = path.resolve("public/site");
const pages = ["index.html", "work.html", "experiments.html", "profile.html"];
const errors = [];
const tokens = fs.readFileSync(path.join(root, "assets/css/tokens.css"), "utf8");
const base = fs.readFileSync(path.join(root, "assets/css/base.css"), "utf8");
const components = fs.readdirSync(path.join(root, "assets/css/components"))
  .filter((name) => name.endsWith(".css"))
  .map((name) => fs.readFileSync(path.join(root, "assets/css/components", name), "utf8"))
  .join("\n");
const canonicalCss = `${base}\n${components}`;
const runtime = fs.readFileSync(path.join(root, "assets/js/runtime.js"), "utf8");
const app = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const hero = fs.readFileSync(path.join(root, "assets/css/components/hero.css"), "utf8");
const foundation = fs.readFileSync(path.join(root, "assets/css/components/foundation.css"), "utf8");
const editorial = fs.readFileSync(path.join(root, "assets/css/components/editorial-section.css"), "utf8");
const projectDetail = fs.readFileSync(path.join(root, "assets/css/components/project-detail-overview.css"), "utf8");
const experimentCard = fs.readFileSync(path.join(root, "assets/css/components/experiment-card.css"), "utf8");
const homepageEvidence = fs.readFileSync(path.join(root, "assets/css/components/homepage-evidence.css"), "utf8");
const selectedEvidence = fs.readFileSync(path.join(root, "assets/css/components/selected-evidence.css"), "utf8");
const homeRuntime = fs.readFileSync(path.join(root, "assets/js/home.js"), "utf8");
const portfolioContent = JSON.parse(fs.readFileSync(path.join(root, "content/portfolio-content.json"), "utf8"));

if (!tokens.includes("--color-selection-surface") || !tokens.includes("--color-selection-text")) {
  errors.push("Foundation: text selection must use the canonical semantic selection tokens");
}
if (!foundation.includes("::selection{background:var(--color-selection-surface);color:var(--color-selection-text)")) {
  errors.push("Foundation: text selection must remain a quiet brand surface with dark readable text");
}
for (const directory of ["assets/css", "assets/js"]) {
  for (const name of fs.readdirSync(path.join(root, directory))) {
    if (/-(?:v)?\d+\.(?:css|js)$/.test(name)) errors.push(`${directory}/${name}: versioned legacy source must be recovered from Git, not kept beside canonical owners`);
  }
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const styles = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((match) => match[1]);
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]);
  if (styles.length !== 1 || !/^\/site\/assets\/css\/production\.[a-f0-9]{16}\.css$/.test(styles[0])) errors.push(`${page}: exactly one production stylesheet is required`);
  if (scripts.length !== 1 || !/^\/site\/assets\/js\/production\.[a-f0-9]{16}\.js$/.test(scripts[0])) errors.push(`${page}: exactly one production runtime is required`);
}

for (const token of ["--space-4", "--color-text-primary", "--font-sans", "--text-body", "--page-gutter", "--radius-lg", "--motion-base"]) {
  if (!tokens.includes(token)) errors.push(`tokens.css: ${token} missing`);
}
for (const contract of ["matcher-workspace.has-result", "prefers-reduced-motion:reduce", "forced-colors:active"]) {
  if (!canonicalCss.replace(/\s+/g, "").includes(contract.replace(/\s+/g, ""))) errors.push(`canonical CSS: ${contract} contract missing`);
}
if (!hero.includes("single owner for homepage hero")) errors.push("hero.css: single-owner declaration missing");
if (/\.hero(?:-|__|\b)/.test(base)) errors.push("base.css: homepage Hero selectors must live only in components/hero.css");
if (!tokens.includes("--hero-bottom-safe")) errors.push("Hero: CTA and supporting copy require one viewport-safe bottom token");
if (!tokens.includes("--hero-outcome-line-offset") || !hero.includes("top: calc(var(--hero-pad-block) + var(--hero-outcome-line-offset))")) errors.push("Hero: English outcome must align to the final opening-statement line through the shared type rhythm");
if (!hero.includes("bottom: var(--hero-bottom-safe)")) errors.push("Hero: wide-screen CTA and supporting copy must use the shared bottom-safe inset");
if (!hero.includes("border-radius: var(--radius-control)") || !hero.includes("border-radius: var(--radius-icon)")) errors.push("Hero: CTA and circular icon must use the semantic action radii");
if (!hero.includes("background: var(--portfolio-cyan-500)") || !hero.includes("box-shadow: var(--hero-cta-shadow-hover)")) errors.push("Hero: CTA hover must preserve the cyan and coral brand-state contract");
if (!canonicalCss.includes(".home-page { background: var(--hero-surface); }")) errors.push("SiteChrome: the transparent homepage header must reveal the Hero surface rather than the default white page");
if (/\.(?:cap-list|rail-title-v35)(?:\b|:)/.test(base)) errors.push("base.css: Search result presentation must live only in components/search.css");
if (/\.modal-(?:close|back-v66)(?:__|\b)/.test(base)) errors.push("base.css: popup controls must live only in components/popup-shell.css");
if (/\.(?:detail-related-v45)(?:-|__|\b)/.test(base)) errors.push("base.css: related-work layout must live only in project-detail-overview.css and horizontal-rail.css");
if (/\.(?:gallery-nav|gallery-prev|gallery-next)(?:\b|:)/.test(base)) errors.push("base.css: project gallery controls must live only in components/project-detail-overview.css");
if (/\.(?:modal-content-v45|modal-head-v45|modal-head-meta-v60|detail-period-v60|detail-commerce-v45|quick-view-v51|project-summary-v45|project-signals-v45|project-context-v45|info-grid-v45)(?:-|__|\b)/.test(base)) errors.push("base.css: project overview selectors must live only in components/project-detail-overview.css");
if (/\.(?:work-card-v32|work-gallery-v32|work-artifact|work-card-signals-v44)(?:-|__|\b)/.test(base)) errors.push("base.css: Work card layout must live only in components/project-card.css");
if (/(?:^|[\s>+~,#:])\.(?:experiment(?:-|\b)|poster(?:-|\b)|playground-hero(?:-|\b)|play-shape(?:-|\b)|play-line\b|shape-(?:circle|pill|small)\b)/m.test(base)) errors.push("base.css: Experiment presentation must live only in components/experiment-card.css");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
if (!index.includes('data-copy-html-key="index.turn-confusion-br-into-') || !index.includes('data-copy-key="index.turn-confusion-into-clear-systems-')) errors.push("Hero: visible and accessible transformation statements must resolve through SSOT keys");
if (!tokens.includes("--hero-title-size-zh-wide: clamp(8.75rem, 9.8vw, 140pt)")) errors.push("Hero: wide-desktop Chinese display type must reach the approved 140pt scale");
if (!tokens.includes("--hero-title-scale-zh-compact: .96")) errors.push("Hero: compact Chinese display type must retain the verified responsive scale");
if (!selectedEvidence.includes(".evidence-feature__action,.evidence-list__action") || !selectedEvidence.includes("white-space:nowrap")) errors.push("SelectedEvidence: case actions must keep their arrow on the same line");
if (!app.includes("related-project-card__action-label',ui(") || !app.includes("element('span','icon-arrow icon-arrow--right')")) errors.push("ProjectCard: Work CTA must keep its SSOT-localized label and canonical right arrow as separate inline elements");
if (!app.includes("related-project-card__company-v135',localize(project.company)") || !app.includes("localize(project.domain_label)")) errors.push("ProjectCard: Work cards must reuse the homepage company-first metadata hierarchy");
if (!canonicalCss.includes(".work-card-v32__action{display:inline-flex;align-items:center;gap:var(--space-2);line-height:1.25;white-space:nowrap}")) errors.push("ProjectCard: Work CTA label and arrow must remain centred on one line");
for (const [id, project] of Object.entries(portfolioContent.projects)) {
  const chineseTitle = project.transformation_zh || project.title?.zh || project.publicContent?.hero?.title?.zh || "";
  if (!chineseTitle) errors.push(`ProjectCard: ${id} requires an explicit Chinese title`);
  if (/\b(?:mechanics|operating model|campaign pages|live game|multi-game platform|excess reports|exception operating system|taxi decisions|booking journey|payment feature|auction transaction platform|tablet script|mortgage consultation workflow|checkout methods|payment foundation)\b/i.test(chineseTitle)) {
    errors.push(`ProjectCard: ${id} Chinese title contains untranslated English UI copy`);
  }
}
const heroAssets = [...index.matchAll(/hero-clarity-system\.svg/g)];
if (heroAssets.length !== 1) errors.push("index.html: exactly one canonical Hero SVG reference is required");
const heroTransformationAssets = [...index.matchAll(/hero-transformation-system\.svg/g)];
if (heroTransformationAssets.length !== 1) errors.push("index.html: exactly one canonical Hero transformation SVG reference is required");
const heroArtwork = fs.readFileSync(path.join(root, "assets/img/hero-clarity-system.svg"), "utf8");
const heroTransformation = fs.readFileSync(path.join(root, "assets/img/hero-transformation-system.svg"), "utf8");
for (const contract of ["hero-cloud--top", "hero-cloud--upper-right", "hero-cloud--bottom", "hero-cloud--left", "hero-cloud--lower-right", "hero-flame-breathe", "hero-flame-morph", "attributeName=\"d\"", "prefers-reduced-motion: reduce"]) {
  if (!heroTransformation.includes(contract)) errors.push(`Hero transformation: missing approved Figma motion contract ${contract}`);
}
if (/clarity-(?:cloud|burst|flame)/.test(heroArtwork)) errors.push("Hero artwork: obsolete approximate transformation layers must not coexist with the canonical Figma vectors");
const arrowIcon = fs.readFileSync(path.join(root, "assets/css/components/arrow-icon.css"), "utf8");
if (!arrowIcon.includes("margin:0") || !arrowIcon.includes(".icon-arrow--inline{margin-inline-start:var(--space-1)}")) errors.push("ArrowIcon: circular placement must be geometrically centred and inline spacing must be opt-in");
if ((`${tokens}\n${canonicalCss}`.match(/experience-proof-cloud\.svg/g) || []).length !== 1) errors.push("canonical CSS: exactly one Experience proof cloud asset reference is required");
if (!tokens.includes('--footer-organic-edge-shape: url("/site/assets/img/footer-organic-edge.svg")')) errors.push("SiteChrome: the footer organic edge must be owned by the canonical token");
if (!canonicalCss.includes(".site-footer::before")) errors.push("SiteChrome: the footer must render its organic edge without clipping footer content");
if (/\.site-footer[^{]*\{[^}]*clip-path\s*:/s.test(canonicalCss)) errors.push("SiteChrome: footer content must not be clipped by a polygon");
if (index.indexOf('experience-overview-v42') > index.indexOf('id="selected-work"')) errors.push("index.html: Experience proof must appear directly after Hero and before Selected work");
if (!runtime.includes("location.assign(url.href)")) errors.push("runtime.js: native navigation guard missing");
for (const token of ["--cmp-popup-title-subtitle-gap", "--cmp-popup-subtitle-content-gap", "--cmp-popup-info-surface", "--cmp-popup-page-title-size", "--cmp-popup-page-title-size-compact", "--cmp-popup-section-title-size", "--cmp-popup-card-title-size", "--cmp-popup-metric-size", "--cmp-popup-outcome-metric-size", "--cmp-popup-body-size", "--cmp-popup-supporting-size", "--cmp-popup-label-size", "--cmp-search-form-radius"]) {
  if (!tokens.includes(token)) errors.push(`tokens.css: ${token} missing`);
}
if (!app.includes("function embeddedOutcomeMetric(text)") || !app.includes("recruiter-proof-item-v46__metric-label--statement")) errors.push("ProjectDetailOverview: embedded Arabic and Chinese outcome metrics must use the shared metric hierarchy");
if (!projectDetail.includes("font-size:var(--cmp-popup-outcome-metric-size)") || !projectDetail.includes("color:var(--color-text-accent)")) errors.push("ProjectDetailOverview: verified outcome values must use the semantic display token and system accent");
if (homeRuntime.includes("selected.scrollIntoView")) errors.push("DomainSelector: floating selection must use rail-owned clamped scrolling, not document-level scrollIntoView");
if (!homeRuntime.includes("rail.scrollTo({left:target")) errors.push("DomainSelector: floating selection requires a clamped rail scroll contract");
for (const token of ["--cmp-popup-page-title-size", "--cmp-popup-section-title-size", "--cmp-popup-card-title-size"]) {
  if (!projectDetail.includes(`font-size:var(${token})`)) errors.push(`ProjectDetailOverview: ${token} must govern popup hierarchy`);
}
if (/font-size:clamp\(/.test(projectDetail)) errors.push("ProjectDetailOverview: popup typography must use semantic component tokens instead of local clamp scales");
if (!canonicalCss.includes('.gallery-thumbs-v45>*[aria-selected="true"]') || !canonicalCss.includes("border:var(--dimension-2px) solid var(--color-state-selected-ring)")) errors.push("DetailDialog: selected thumbnail must use a non-clipping 2px inset state");
if (!canonicalCss.includes(".decision-number-v48{align-self:start;display:inline-flex;width:max-content;padding:var(--space-1) var(--space-2);border:var(--dimension-1px) solid var(--color-text-accent)")) errors.push("DetailDialog: Decision must use the shared semantic tag surface");
if (!app.includes("if(tradeoffText)") || !app.includes("if(considerations.childElementCount)")) errors.push("DetailDialog: trade-off must be conditional on real SSOT content");
if (!canonicalCss.includes(".rail-button:disabled{border-color:var(--color-state-disabled-border);background:var(--color-state-disabled-bg);color:var(--color-state-disabled-text)")) errors.push("HorizontalRail: disabled state must use semantic surface, border, and text");

const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
if ((homepage.match(/data-principle-constellation/g) || []).length !== 1) errors.push("HomepageEvidence: Principle Constellation requires one production mount point");
if (/principle-card-v48|principle-evidence-v48/.test(homepage)) errors.push("HomepageEvidence: retired per-principle markup must not coexist with the shared renderer");
if (!canonicalCss.includes(".icon-download") || !fs.existsSync(path.join(root, "assets/img/download.svg"))) errors.push("ArrowIcon: CV download must use its distinct canonical SVG affordance");
if (!canonicalCss.includes(".text-cta::after") || !canonicalCss.includes(".text-cta:hover::after")) errors.push("Foundation: supplementary text CTAs must use the shared interaction contract");
if (/timeline-evidence-v34[^<]*[\s\S]{0,240}<b>→<\/b>/.test(fs.readFileSync(path.join(root, "profile.html"), "utf8"))) errors.push("Profile: timeline CTA arrows must use the canonical SVG icon");
if (!projectDetail.includes(".ownership-grid-v45>article{") || !projectDetail.includes("border-radius:0;background:transparent}")) errors.push("ProjectDetailOverview: ownership must use typography and dividers, not page-level cards");
if (!app.includes("'button button--dark programme-stage-case__cta'")) errors.push("ProjectDetailOverview: stage-case CTA must reuse the canonical primary button contract");
if (/\.programme-stage-case__cta:(?:hover|active)\{/.test(canonicalCss)) errors.push("ProjectDetailOverview: stage-case CTA must not maintain a parallel hover or active contract");
const recruiterStageSource = app.slice(app.indexOf("if(isStage){"), app.indexOf("}else if(isInitiative)", app.indexOf("if(isStage){")));
if (recruiterStageSource.includes("stage-focus-v148__statement") || recruiterStageSource.includes("createProgrammeSection(stageLabel,'')") || !recruiterStageSource.includes("const stageProjection=parent.recruiterFirstPopup")) errors.push("ProjectDetailOverview: recruiter-first stage details must use the primary dialog stage title and must not render a duplicate Stage Focus or stage heading wrapper");
const featuredDecisionSource = app.slice(app.indexOf("function createFeaturedDecisionGroup("), app.indexOf("function interactiveFlowById(", app.indexOf("function createFeaturedDecisionGroup(")));
const canonicalDecisionEvidenceChain = [
  "const card=createDecisionCard(model,index,{projectKey,showVisual:showVisual&&Boolean(model.evidenceAssetId)})",
  "card.querySelector('.decision-visual-v58.evidence-frame')",
  "evidence.classList.add('case-evidence-wrapper')",
  "group.dataset.componentOwner='FeaturedDecision'"
];
const recruiterDecisionProjection = app.includes("p.presentation?.decisionOptions?.variant==='featured'") &&
  app.includes("createFeaturedDecisionGroup(decision,index,{projectKey:key,showVisual:showDecisionVisuals");
if (!canonicalDecisionEvidenceChain.every((contract) => featuredDecisionSource.includes(contract)) ||
    !recruiterDecisionProjection ||
    !app.includes("voucher-r149-decision-list")) {
  errors.push("ProjectDetailOverview: recruiter-first stage details must reuse the canonical Design Decision and EvidenceFrame renderer");
}
if (/\.home-page\s+:is\([^)]*\.principles/.test(editorial)) errors.push("HomepageEvidence: EditorialSection must not override the dark Principles surface");
if (!homeRuntime.includes("localize(project?.company)") || !homeRuntime.includes("localize(project?.domain_label)")) errors.push("ProjectCard: related cards must render company first and domain second from SSOT");
if (homeRuntime.includes("localize([p.context,p.context_zh])")) errors.push("ProjectCard: related-card metadata must not repeat the company through legacy context copy");
if (!app.includes("const context=type==='project'?localize(item.company)")) errors.push("ProjectCard: compact popup-related cards must keep company metadata and omit redundant domain copy");
if (foundation.includes("#detailContext:has(.company-name-v132){display:grid")) errors.push("ProjectDetailOverview: global foundation must not split header metadata into a nested grid");
if (!projectDetail.includes(".modal-head-meta-v60{display:flex;align-items:baseline;flex-wrap:nowrap")) errors.push("ProjectDetailOverview: company and context must remain on one baseline row");
if (!projectDetail.includes(".project-value-v207{display:grid") || !projectDetail.includes(".project-value-v207[data-awaiting-content]")) errors.push("ProjectDetailOverview: the value-I-brought slot must use the canonical governed state");
if (!projectDetail.includes(".quick-view-v51--project .project-context-v45{order:2}") || !projectDetail.includes(".quick-view-v51--project .project-signals-v45{order:3}")) errors.push("ProjectDetailOverview: why and business value must precede the Info Grid");
if (!projectDetail.includes(".detail-period-v60:empty{display:none}")) errors.push("ProjectDetailOverview: timeline must not duplicate the Info Grid in title metadata");
if (!app.includes('ui("type-') || !app.includes('ui("timeline-')) errors.push("ProjectDetailOverview: Info Grid must own SSOT-localized Type and Timeline labels");
for (const contract of [".principle-constellation {", ".principle-node.is-active", ".principle-node__panel[hidden]", ".principle-node__trigger:focus-visible", ".principle-constellation::before", "prefers-reduced-motion: reduce"]) {
  if (!homepageEvidence.includes(contract)) errors.push(`HomepageEvidence: missing Principle Constellation contract ${contract}`);
}
for (const contract of ["item.collapsed.title", "item.collapsed.value", "item.expanded.howIWork", "item.expanded.practice.companyProduct", "item.expanded.practice.summary", "aria-expanded", "aria-controls", "event.key==='Escape'", "root.dataset.activePrinciple"]) {
  if (!homeRuntime.includes(contract)) errors.push(`HomepageEvidence: missing SSOT or interaction contract ${contract}`);
}
for (const item of portfolioContent.designPrinciples?.items || []) {
  for (const retired of ["title", "description", "value", "practiceExample"]) if (retired in item) errors.push(`HomepageEvidence: ${item.id} still exposes retired ${retired} schema`);
}
if (/global-search-card-v114/.test(canonicalCss) || /global-search-card-v114/.test(app)) errors.push("ProjectCard: global search must reuse the canonical Search variant instead of a parallel card owner");
for (const phrase of ["renderSuggestions();", "if(!results.hidden&&input.value.trim())renderResults(input.value)"]) {
  if (!app.includes(phrase)) errors.push("SiteChrome: global search must fully rerender in the active language");
}
if (!projectDetail.includes(".modal-classification-v45{display:grid;grid-template-columns:max-content minmax(0,1fr);align-items:start")) errors.push("ProjectDetailOverview: classification must preserve its label-to-chip alignment grid");
if (!projectDetail.includes(".detail-status{display:grid;grid-template-columns:max-content max-content;align-items:start")) errors.push("ProjectDetailOverview: delivery status must remain a compact semantic label, not a full-width field");
if (!canonicalCss.includes(".floating-navigator{position:fixed") || !canonicalCss.includes("safe-area-inset-bottom") || !app.includes("classList.add(\'floating-navigator\')") || projectDetail.includes(".pd-section-nav:not(.floating-navigator)")) errors.push("FloatingNavigator: Project navigation must reuse the single shared fixed and safe-area-aware primitive at every viewport");
if (projectDetail.includes(".project-section-nav")) errors.push("ProjectDetailOverview: retired navigator namespace must not coexist with .pd-section-nav");
if (!app.includes("function scrollToProjectSection(target)") || !app.includes("function projectSectionInset()")) errors.push("ProjectDetailOverview: navigator must use the canonical scroll-root and sticky-control offset owner");
if (!app.includes("const behavior=prefersReduced.matches?'auto':'smooth'") || !app.includes("dialogScrollRoot.scrollTo({left:0,top:destination,behavior})") || !app.includes("history.replaceState(history.state,'',\`#\${target.id}\`)") || !app.includes("setActiveProjectSection(pendingProjectSectionId||visibleProjectSectionId)") || !app.includes("addEventListener(\'scrollend\'") || app.includes("setTimeout(settle,900)")) errors.push("ProjectDetailOverview: navigator must use shared smooth scrolling, reduced-motion fallback, hash preservation, in-motion ownership and one deterministic .dialog-scroll state path");
if (!canonicalCss.includes("min-width:max-content") || !canonicalCss.includes("text-wrap:nowrap;white-space:nowrap")) errors.push("ProjectCard: company names must remain one unbroken line across every card variant");
if (!projectDetail.includes(".case-study-section{") || !projectDetail.includes(".case-study-section--canvas{background:transparent}") || !projectDetail.includes(".case-study-section__header{") || !projectDetail.includes(".info-grid-v45>div{") || !projectDetail.includes("border-radius:0;background:transparent")) errors.push("ProjectDetailOverview: every major section and flat Info Grid must use the shared CaseStudySection grammar");
if (!experimentCard.includes(".experiment-overview-v45__question,.experiment-overview-v45__build{min-width:0;padding:0;border-radius:0;background:transparent}")) errors.push("ExperimentDetail: overview content must reuse the Project Detail surface instead of nested card styling");
if (!canonicalCss.includes("border-radius:var(--cmp-search-form-radius)")) errors.push("Matcher: search radius must use the shared component token");
if (!projectDetail.includes(".outcome-semantic-group--label-in-header{padding-top:0}") || (projectDetail.match(/\\.outcome-semantic-group__grid--aligned\\{/g) || []).length !== 3) errors.push("OutcomeMetric: one shared desktop/tablet/mobile aligned grid owner and header-integrated framing are required");
if (!projectDetail.includes(".voucher-r149-foundation--informational .voucher-r149-foundation__media{aspect-ratio:auto") || !app.includes("voucher-r149-foundation--informational")) errors.push("ProjectDetailOverview: informational media must preserve intrinsic ratio through the shared media owner");
if (!app.includes("canonicalProjectNavLabel('outcomes','Outcomes','成果')") || portfolioContent.localizationRegistry.projectSectionNavigationLabels?.impact || portfolioContent.localizationRegistry.projectSectionNavigationLabels?.outcomes?.en !== "Outcomes") errors.push("FloatingNavigator: equivalent result destinations must use the canonical Outcomes label owner");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Canonical design-system lint passed.");
