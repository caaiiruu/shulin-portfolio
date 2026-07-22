# Token Registry — v72

Token ownership: `assets/css/tokens-v72.css`

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
- `--section-space-compact` / `--section-space` → SupportingPageRhythm → Work, Experiment, and Profile

Do not create page-level spacing values when an approved component token exists.


## Responsive ownership

- Page gutter: `clamp(20px, 4.2vw, 64px)`
- Section rhythm: `clamp(72px, 8vw, 112px)`
- Compact section rhythm: `clamp(56px, 6vw, 84px)`
- All horizontal rails: 12px gap and 12px edge inset
