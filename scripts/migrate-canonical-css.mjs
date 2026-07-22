import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const root = path.resolve("public/site/assets/css");
const historicalSources = ["legacy-compat-v72.css", "system-v72.css"];
const ownerPatterns = [
  /(?:^|[\s>+~,.#:])(?:page-shell\b|skip-link\b|focus-visible\b)/,
  /(?:^|[\s>+~,.#:])(?:matcher(?:-|\b)|match(?:-|\b)|chip-rail\b|chip\b|result-projects\b|no-match(?:-|\b))/,
  /(?:^|[\s>+~,.#:])(?:detail-dialog(?:-|\b)|dialog-scroll\b|dialog-controls(?:-|\b)|modal-close(?:-|\b)|modal-back(?:-|\b))/,
  /(?:^|[\s>+~,.#:])(?:modal-content-v45\b|modal-head-v45\b|modal-head-meta-v60\b|detail-period-v60\b|modal-classification-v45(?:-|__|\b)|modal-tags\b|detail-status(?:-|\b)|detail-commerce-v45(?:-|__|\b)|modal-gallery(?:-|\b)|gallery-stage-v45\b|gallery-copy-v45\b|gallery-thumbs-v45\b|gallery-count-v45\b|quick-view-v51(?:-|__|\b)|project-summary-v45\b|project-signals-v45(?:-|__|\b)|info-grid-v45(?:-|__|\b))/,
  /(?:^|[\s>+~,.#:])(?:domain-selectors\b|domain-tab(?:-|__|\b)|domain-stage\b|domain-mobile-picker-v42\b|domain-chip-rail-v56\b|domain-floating-nav-v52(?:-|__|\b)|domain-floating-chip-v52\b)/,
  /(?:^|[\s>+~,.#:])(?:rail-(?:button|controls|heading)\b|project-card-rail\b|no-match-project-list-v45\b|domain-project-list-v30\b|detail-related-rail-v45\b|experiment-index-rail-v36\b|profile-side-rail-v34\b|playground-grid\b|work-filter-v32\b)/,
  /(?:^|[\s>+~,.#:])(?:work-card-v32(?:-|__|\b)|work-gallery-v32\b|work-artifact\b|work-card-signals-v44\b|related-project-card(?:-|__|\b)|detail-related-card(?:-|__|\b)|detail-related-action-v46\b)/,
  /(?:^|[\s>+~,.#:])(?:experiment-index-card-v36(?:-|__|\b)|experiment-index-card-v38(?:-|__|\b)|experiment-learning-preview-v38\b)/,
  /(?:^|[\s>+~,.#:])(?:profile-side-card-v34(?:-|__|\b)|profile-side-card-v52(?:-|__|\b)|interest-tile-v39(?:-|__|\b))/,
  /(?:^|[\s>+~,.#:])(?:profile-interests-v39(?:-|__|\b)|interest-mosaic-v39\b)/,
  /(?:^|[\s>+~,.#:])(?:experience-overview-v42\b|work-reference\b|domain-chapter\b|selected-work\b|principles\b|playground\b|profile-chronology-v34\b|profile-awards-v36\b|profile-side-projects-v34\b|profile-interests-v39\b|work-page-v32\b|playground-page-v32\b|principles-section-v57\b|experiments-chapter\b|section-heading-v45\b)/,
];

const source = historicalSources.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const ast = postcss.parse(source);
ast.walkRules((rule) => {
  const retained = rule.selectors.filter((selector) => !ownerPatterns.some((pattern) => pattern.test(selector)));
  if (!retained.length) rule.remove();
  else rule.selectors = retained;
});
ast.walkAtRules((rule) => {
  if ((rule.name === "media" || rule.name === "supports" || rule.name === "layer") && !rule.nodes?.length) rule.remove();
});

fs.writeFileSync(path.join(root, "base.css"), `/* Canonical global and page-layout source. Component internals live in assets/css/components. */\n${ast.toString()}\n`);
fs.copyFileSync(path.join(root, "tokens-v72.css"), path.join(root, "tokens.css"));
console.log("Created canonical base.css and tokens.css");
