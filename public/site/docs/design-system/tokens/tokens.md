# Token Registry

Token ownership: `assets/css/tokens.css`

Traceability:

Primitive → Semantic → Component → Component CSS → Page usage

Examples:

- `space.5` → `--space-5` → `--component-panel-padding` → DetailDialog panels
- `accent.system` → `--brand-system` → selected state / decision link → Matcher, Domain, DetailDialog
- `accent.human` → `--brand-human` → focus-visible / constraint meaning → all interactive components
- `paper-0` → `--color-text-inverse` → coloured chapter label → Domain and Principles chapters
- `paper-0` → `--color-text-inverse-secondary` → dark chapter supporting copy → Principles chapter
- spacing primitives → `--section-space` → EditorialChapter → homepage and supporting-page section boundaries
- `--control-height` → InteractionFoundation → navigation, buttons, links, and icon controls
- `--color-focus` + `--color-surface` → InteractionFoundation → visible two-tone keyboard focus ring
- `--color-surface-evidence-neutral` / `--color-surface-evidence-accent` → ProjectDetailOverview → adjacent evidence-section hierarchy without divider lines
- `--section-space-compact` / `--section-space` → SupportingPageRhythm → Work, Experiment, and Profile
- `brand-100` → `--evidence-visual-surface` → SelectedEvidence featured visual → Homepage
- spacing primitives → `--evidence-section-gap` / `--evidence-content-gap` / `--evidence-item-gap` → SelectedEvidence → Homepage
- type measures → `--evidence-title-measure` / `--evidence-copy-measure` → SelectedEvidence titles and summaries → Homepage
- `--font-cjk` + CJK type, leading, tracking, and measure tokens → `html[lang="zh-Hant"]` → every Chinese public route and project dialog
- `0.875rem` → `--text-body` / `--text-body-cjk` → Foundation body copy → all public routes; summaries and headings retain their larger semantic tiers
- `--color-selection-surface` + `--color-selection-text` → global text selection → visible selection without turning headings into high-contrast display blocks
- principle evidence semantic surface, accent, and icon tokens → HomepageEvidence supporting-case CTA
- `--homepage-principle-rail-width` + `--homepage-principle-layout-duration` → HomepageEvidence desktop focus/rail exchange
- `--radius-md` → `--domain-tab-radius` → DomainSelector tabs → Homepage Domain decision surface
- display type primitives → `--cmp-popup-outcome-metric-size` → verified numeric evidence → ProjectDetailOverview Delivery & outcomes
- type primitives → `--type-page-title` / `--type-section-title` / `--type-subsection-title` / `--type-body` / `--type-meta` / `--type-eyebrow` / `--type-outcome-metric` → semantic text roles → shared components across every route
- text semantics → `--type-color-heading` / `--type-color-body` / `--type-color-meta` / `--type-color-eyebrow` / `--type-color-metric` → consistent hierarchy independent of HTML heading level

Do not create page-level spacing values when an approved component token exists.

## Corner-radius semantics

- `--radius-inset` — thumbnails, nested visual crops, and compact internal surfaces.
- `--radius-card` — standard content and evidence cards.
- `--radius-panel` — large containers, modal surfaces, and section-level panels.
- `--radius-control` — buttons, chips, tabs, and pill actions.
- `--radius-icon` — circular icon-only action surfaces.

Component owners consume these semantic aliases instead of inventing local
corner values. Organic decorative artwork may use asymmetric percentages;
structural rectangles may use `0`; neither is a reusable component radius.


## Responsive ownership

- Page gutter: `clamp(20px, 4.2vw, 64px)`
- Section rhythm: `clamp(72px, 8vw, 112px)`
- Compact section rhythm: `clamp(56px, 6vw, 84px)`
- All horizontal rails: 12px gap and 12px edge inset
