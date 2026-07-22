# Portfolio Master Rules — Complete Consolidated File

Compiled on 2026-05-20 from the rule files currently available in this conversation and the rule snippets surfaced from same-name uploaded `pasted.txt` files.

Important: sections below preserve the source wording as rules. No rules were reinterpreted into new requirements.

## Source Inventory

- `Portfolio-System-Rules-(Master-Version).txt`
- `Architecture-Layer-Rule.txt`
- `DATA-SAFETY-RULE-(CRITICAL).txt`
- `DATA-ISOLATION-RULE-(NEW).txt`
- `===-NEW-RULES-(2026-05-System-Stabilization)-===.txt`
- `Design-System-Ownership-Rule.txt`
- `Design-System-Governance-Rules.txt`
- `Existing-Reusable-System-Audit-Rule.txt`
- `Breakpoint-Scope-Rule.txt`
- `TYPOGRAPHY-SYSTEM-RULE-(CRITICAL).txt`
- `UI-Fix-Root-Cause-&-Design-System-Rule.txt`
- `Repeated-UI-Failure-Hard-Stop-Rule.txt`
- `Legacy-CSS-Coexistence-Rule.txt`
- `❗-JSX-Replace-Safety-Rule.txt`
- `pasted.txt`
- `PORTFOLIO-DESIGN-SYSTEM-+-UI-STABILIZATION-MASTER-RULES.txt`
- `pasted.txt — JSX / TSX Syntax Guard Rule`
- `pasted.txt — CSS Cascade Reset / Namespace / Terminal Recovery / No Multi-Step Styling Patch Rules`
- `pasted.txt — CSS / Layout Mutation Rules`

---

# Source: Portfolio-System-Rules-(Master-Version).txt

# Portfolio System Rules (Master Version)

---

## CORE PRINCIPLE

Build a SYSTEM, not pages.

All changes must preserve:
- existing working UI
- layout system
- responsive behavior
- component reusability
- build stability

---

## 1. Layer Separation

Always classify issue before fixing:

1. Environment
2. Routing / Build
3. Data (Sanity)
4. Transformation
5. UI

Never mix layers.

---

## 2. Single Source of Truth

Each system must have ONE source:

- one repo
- one component
- one CSS definition

---

## 3. Stop-and-Audit

If fix fails once:

STOP → audit → then fix

Never stack fixes.

---

## 4. Runtime DOM First

Always verify in browser:

- element exists
- computed styles
- real class names

---

## 5. Project Isolation

Active project:
~/Desktop/portfolio-shu-main

No duplicates allowed.

---

## 6. Clean Build Rule

Never keep:

- dist/
- .next/
- node_modules/
- backups/

---

## 7. Component Ownership

Component owns:
- style
- typography
- spacing

Page owns:
- layout only

---

## 8. Layout System

Use only:

.page-shell
.page-shell-inner

Padding:
var(--page-margin)

---

## 9. Scroll System

Use fixed + top offset

❌ No scrollTo restore

---

## 10. Interaction Standard

Follow Apple / Material:

- no bounce
- subtle animation
- proper hover / press
- overlay blocks background

---

## 11. CSS Conflict Rule

Before writing CSS:

search existing selector

Never duplicate.

---

## 12. Swimlane Rule

Horizontal scroll must:

- use rail + row structure
- maintain page margin
- no edge blocking
- smooth scroll

---

## 13. Breakpoint Rule

Spacing follows design spec:

desktop → 120px  
tablet → 48px  
mobile → 20px  

---

## 14. Terminal Rule

All fixes must:

- run in terminal
- include backup
- be reversible

---

## 15. Error Learning

Every bug → update rule

Goal:
reduce future debugging time

---

## 16. Regression Protection

Never break working UI.

After each change verify:

- header alignment
- page-shell spacing
- chip scroll
- popover behavior

---

## 17. Component Roadmap

Refactor in order:

1. Chip
2. Popover
3. Section
4. Cards
5. Navigation

---

## 18. Dev Behavior

When fixing:

- identify layer
- locate source
- fix once
- verify
- move on

Never guess.

---

# Source: Architecture-Layer-Rule.txt

Work in layers strictly:

1. Data layer (Sanity)
2. Transformation layer
3. UI layer

Never mix layers.

UI bugs → fix in UI only  
Data bugs → fix in data only

---

# Source: DATA-SAFETY-RULE-(CRITICAL).txt

## DATA SAFETY RULE (CRITICAL)

1. 所有 .map 必須防 undefined
   → 必須使用 (array || []).map()

2. 所有 CMS 資料不可假設存在
   → nullable fields 必須 fallback

3. slug page 必須只 render 單一 dataset
   → 禁止 fallback 覆蓋

4. 若出現 undefined.map
   → 先查資料來源，不可直接修 UI

5. normalize layer 必須 pure
   → 不可混入其他 project data

---

# Source: DATA-ISOLATION-RULE-(NEW).txt

## DATA ISOLATION RULE (NEW)

1. slug page must verify dataset identity
   → rawData.slug === params.slug

2. normalize must log slug
   → detect cross-project contamination

3. never trust CMS shape
   → always guard arrays

4. if different project appears in log
   → STOP and audit data layer

5. data layer bug must NOT be fixed in UI

---

# Source: ===-NEW-RULES-(2026-05-System-Stabilization)-===.txt

# === NEW RULES (2026-05 System Stabilization) ===

## 1. Stop-and-Audit Rule

If a fix fails once:

1. Stop immediately
2. Identify layer (Env / Route / Data / Transform / UI)
3. Inspect runtime DOM
4. Locate real source of truth
5. Remove conflicting legacy code
6. Apply ONE fix

❌ Do not:
- stack fixes
- add !important blindly
- guess selectors


## 2. Runtime DOM Verification Rule

Before any UI fix:

- Verify element exists in browser
- Check computed style
- Check actual class names

If `document.querySelector()` returns null:
→ You are fixing the wrong file


## 3. Page Context Rule

Always confirm current route before debugging.

Example:

/work/dbs-exception-management  
→ must map to:
src/app/work/[slug]/page.tsx

❌ Never debug homepage when fixing case study page


## 4. Project Isolation Rule

Only ONE active repo allowed.

Active:
~/Desktop/portfolio-shu-main

❌ Never:
- work inside "Cursor only"
- keep duplicate repo
- modify backup folders


## 5. Build Cleanliness Rule

Never commit or keep:

- dist/
- .next/
- node_modules/
- node_modules_broken_*
- audits/
- backups/

node_modules backup must be OUTSIDE project root


## 6. Scroll Lock Rule (Critical)

When locking scroll:

Use:
- position: fixed
- top: -scrollY

❌ Never:
window.scrollTo on cleanup

Reason:
causes bounce / double scroll restore


## 7. Component Single Source Rule

Each UI pattern must have ONE system.

Example:
- Chip → 1 component
- Popover → 1 component

❌ Never:
- duplicate CSS blocks
- multiple versions
- override with !important


## 8. Layout Source Rule

All horizontal spacing must use:

.page-shell → page-shell-inner

Padding must use:
var(--page-margin)

❌ Never:
- inline padding
- custom shells
- margin hacks


## 9. Breakpoint Truth Rule

Do not assume breakpoint by layout.

Example:
866px = tablet → 48px padding ✅

❌ Do not switch to mobile spacing incorrectly


## 10. Terminal Execution Rule

All instructions must be:

- executable in terminal
- reversible
- with backup

❌ Never use:
apply_patch
AI-only commands


## 11. Error Learning Rule

Every repeated mistake must create a rule.

Process:
1. Identify root cause
2. Identify wrong assumption
3. Define detection method
4. Add rule

Goal:
Avoid same mistake again

---

# Source: Design-System-Ownership-Rule.txt

## Design System Ownership Rule

Reusable UI components must not be defined inside page-level CSS.

Allowed:
- tokens.css owns design tokens
- src/styles/components/*.css owns reusable component styling
- page CSS only owns page composition and section rhythm

Forbidden:
- defining reusable component specs in project-detail.css
- duplicating chip / navigator / button styles across pages
- appending one-off component overrides to page CSS

---

# Source: Design-System-Governance-Rules.txt

# Design System Governance Rules

## 1. Global Design System Ownership

Reusable UI must belong to the global design system.

Allowed:
- src/styles/tokens.css
- src/styles/components/*
- src/components/ui/*

Forbidden:
- reusable component styles inside page CSS
- duplicated component definitions
- local component overrides inside pages

---

## 2. Component Ownership

Each reusable component owns:

- layout behavior
- spacing
- typography
- interaction
- states
- accessibility

Pages only compose components.

Pages must NOT:
- redefine component spacing
- redefine typography
- redefine interaction

---

## 3. Token Governance

All reusable values must come from tokens.

Including:
- typography
- spacing
- radius
- color
- elevation
- motion
- z-index

Forbidden:
- local hardcoded spacing
- local font-size
- local border-radius

Exception:
Only when explicitly approved by design spec.

---

## 4. Component Registry

Reusable components must live in:

src/components/ui/

Styles must live in:

src/styles/components/

Example:

SectionNavigator
ProblemChip
Popover
SummaryCard
Button
Tag
Modal

---

## 5. Namespace Governance

Each component must own ONE namespace.

Example:

.pd-section-nav
.problem-chip
.summary-card

Forbidden:
- alias class names
- legacy duplicate namespace
- mixed naming systems

---

## 6. Modification Approval Rule

If modifying:
- existing token
- reusable component behavior
- shared interaction pattern
- spacing scale
- typography scale

→ approval required before implementation.

Allowed without approval:
- adding new instance usage
- adding new data
- composing existing components

---

## 7. Layout Layer Rule

Page CSS only controls:
- section ordering
- section spacing
- composition rhythm

Page CSS must NOT:
- define reusable UI
- define reusable interaction
- define reusable component states

---

## 8. Design System Refactor Flow

Correct order:

1. Token layer
2. Component layer
3. Layout layer
4. Page composition

Never reverse the order.

---

## 9. Runtime Verification Rule

After component changes verify:

- computed spacing
- responsive behavior
- scroll behavior
- focus states
- interaction states
- no layout shift
- no regression

---

## 10. Stable Component Rule

Once component reaches approved state:

LOCK IT.

Future changes require:
- audit
- approval
- regression verification

---

# Source: Existing-Reusable-System-Audit-Rule.txt

## Existing Reusable System Audit Rule

Before creating any new UI component, always audit the existing reusable system first.

Required process:
1. Search existing `src/components/ui/`
2. Search existing `src/styles/components/`
3. Search existing token files
4. Confirm whether a reusable component already exists
5. If it already exists and can be reused:
   → use the existing component
6. If it needs variation:
   → add a variant / instance / prop to the existing component
7. Only create a new component if no suitable reusable system exists

Forbidden:
- creating duplicate components
- creating duplicate CSS namespaces
- creating one-off local component versions
- adding a new component before auditing existing reusable UI

---

# Source: Breakpoint-Scope-Rule.txt

## Breakpoint Scope Rule

Project page breakpoints remain:
- desktop: 1419px design reference
- tablet: 871px
- mobile: 375px

Only the section navigator may use its own component breakpoint:
- desktop navigator
- tablet/mobile navigator

Do not convert page-wide breakpoints based on one component’s behavior.

## Project Detail Typography Token Rule

Project detail typography must use tokens:

- hero title: 60/72 extra bold on desktop/tablet, 32/40 extra bold on mobile
- hero subtitle/meta above title: 16/150 bold on desktop/tablet, 14/150 bold on mobile
- chip: 12/150 regular on all breakpoints
- at a glance title: 24/150 bold on all breakpoints
- body: 16/150 bold on all breakpoints
- meta row title: 14/150 on all breakpoints
- navigation: 14/150 bold on desktop/tablet, 12/150 bold on mobile

Do not hardcode alternative type sizes inside sections.

## Project Detail Spacing Token Rule

Use spacing tokens:

- same group: 16px
- large group: 32px
- subgroup: 24px
- same text group: 8px
- hero subtitle to hero title: 12px
- hero title to chips: 16px
- hero section to at-a-glance group: 32px

Do not introduce local spacing values unless the design specifically calls for an exception.

---

# Source: TYPOGRAPHY-SYSTEM-RULE-(CRITICAL).txt

## TYPOGRAPHY SYSTEM RULE (CRITICAL)

1. 字體只能由 token 控制
   → 禁止 component hardcode font-size

2. media query 不可改 class
   → 只能 override token

3. summary / hero / body 必須用固定 scale
   → 不可臨時定義

4. 若字體錯誤
   → 先查 token，不可直接改 UI

---

# Source: UI-Fix-Root-Cause-&-Design-System-Rule.txt

# UI Fix Root-Cause & Design System Rule

## 1. No Patch Stacking
任何 UI 錯誤不可直接疊加 override。
每次修正前必須先 audit：
- 真實 DOM class
- 實際生效 CSS source
- 是否有重複 selector
- 是否有不存在的 class
- breakpoint 是否命中
- spacing 是 component 造成還是 page composition 造成

## 2. Design Token First
所有可重複使用的 spacing、type、color、radius、breakpoint 都必須先進 design token。
不得在單一 page 或 component 中硬寫可共用值。

## 3. Component Owns Internal Only
Reusable component 只能管理：
- internal padding
- internal gap
- visual style
- state style

不得管理：
- margin-top
- margin-bottom
- page spacing
- section spacing

## 4. Page Owns Spacing
不同元件與群組之間的 spacing 必須由 page composition layer 控制。
不可由元件本身決定外距。

## 5. Real Class Only
修正 CSS 前必須先確認實際 DOM class。
不得寫入未確認存在的 selector。
若 selector 不存在，必須先停止修正並回報。

## 6. One Source of Truth
同一個 component 或 section 不可同時由：
- styled-jsx
- global css
- component css
- inline style

共同控制同一個 layout 屬性。

若發現重複來源，必須先清理再修改。

## 7. Breakpoint Rule
Project detail mobile breakpoint 使用 430px。
不得再硬寫 375px，除非特別指定。

## 8. Spacing System Rule
Text group:
- title → body: 16px
- mobile title → body: 12px

Hero title group:
- subtitle → title: 12px
- title → chip: 16px

Group spacing:
- different groups: 32px

Large group:
- At a Glance + body + info grid 為同一大群組
- body → info grid: 24px

Inline icon:
- text → icon: 4px

## 9. Chip Rail Rule
Chip rail must support horizontal scroll.
It must not use mask/fade/block overlay.
End padding must preserve 16px after the last chip.
Chip rail spacing is controlled by page composition, not the chip component.

## 10. Info Grid Rule
Info grid is a shared design-system component.

Desktop/tablet:
- flex-direction: row
- no gap between cards
- border is connected
- each card owns internal padding 16px 24px

Mobile:
- flex-direction: column
- no gap between cards
- cards touch directly
- use border overlap or shared border logic
- height must wrap content
- no fixed card height unless explicitly requested

## 11. Hero Image Rule
Hero image source comes from Sanity when available.
Hero image component must not own page padding.
Resolution must use Sanity image builder or optimized image sizing.
Raw `asset.url` alone is not enough for final production image quality.

## 12. Failed Fix Rule
If a fix fails once:
- stop patching
- audit root cause again
- identify conflicting selectors/files
- provide a scoped solution

Do not keep stacking overrides after a failed attempt.

## 13. Execution Rule
All code changes must be provided as executable terminal commands only.
No manual editing instructions unless explicitly requested.

---

# Source: Repeated-UI-Failure-Hard-Stop-Rule.txt

## Repeated UI Failure Hard Stop Rule

If the same UI area fails more than once:

1. Stop all visual patching immediately.
2. Do not append new CSS.
3. Do not add another `!important`.
4. Do not continue editing page-level styled-jsx.
5. Audit all active selectors and CSS sources first.
6. Delete or disable legacy/conflicting CSS before adding new rules.
7. Move reusable UI into design-system components before continuing.
8. Page-level CSS may only control composition rhythm, not reusable component internals.
9. Build after cleanup before applying new styling.
10. If old and new systems coexist, the fix is invalid.

---

# Source: Legacy-CSS-Coexistence-Rule.txt

## Legacy CSS Coexistence Rule

If old selector blocks and new selector blocks coexist,
the component is considered unstable.

Required process:
1. Audit all active selectors
2. Delete legacy blocks completely
3. Keep only one namespace
4. Keep only one responsive system
5. Build before adding new styles

Forbidden:
- keeping old media queries
- leaving old styled-jsx active
- layering “temporary fixes”
- mixing page CSS and component CSS

---

# Source: ❗-JSX-Replace-Safety-Rule.txt

## ❗ JSX Replace Safety Rule

Never use global string replace on JSX structure.

❌ Forbidden:
- replacing '</div>'
- replacing ')'
- replacing JSX blocks blindly

Reason:
JSX is nested structure, not string-safe.

---

## ✅ Correct Method:

1. Locate exact JSX block manually
2. Replace ONLY the intended node
3. Never touch sibling / parent structure

---

## ❗ Refactor Rule

When extracting component:

❌ Do NOT auto-replace
❌ Do NOT batch replace

✅ Copy → wrap → replace manually

---

# Source: pasted.txt

## CSS Cascade Reset Rule

When a UI component has failed more than once, do not append another override.

Required process:
1. Stop all visual fixes
2. Audit all selectors for that component
3. Delete legacy selector blocks
4. Keep one component class namespace only
5. Rebuild from a single CSS source

Forbidden:
- stacking new CSS at the bottom of globals.css
- keeping old class names active
- mixing `.navigator-root`, `.project-section-navigator`, and `.pd-section-nav`

## Component Namespace Lock Rule

Each reusable component must own one stable class namespace.

For SectionNavigator:
Allowed namespace:
- `.pd-section-nav`
- `.pd-section-nav__item`
- `.pd-section-nav__item--overview`

Forbidden:
- `.navigator-root`
- `.navigator-link`
- `.project-section-navigator`
- `.project-section-navigator__item`

If old namespaces remain, they must be deleted or disabled before new styling is added.

## Failed Terminal Command Recovery Rule

If terminal shows:
- `heredoc>`
- `quote>`
- `dquote>`
- `bquote>`

Immediately:
1. Press `control + C`
2. Do not type more code
3. Run `pwd`
4. Run `npm run build`
5. Only continue after build succeeds

Never continue from an unfinished shell prompt.

## No Multi-Step Styling Patch Rule

For UI fixes after regression:
- Do not edit component + tokens + globals in one command
- Do not create new class names and append CSS at the same time
- Do not run dev until build succeeds

Required order:
1. Clean old CSS/source conflicts
2. Build
3. Add or replace component file
4. Build
5. Add CSS from one source
6. Build
7. Runtime DOM verify

---

# Source: PORTFOLIO-DESIGN-SYSTEM-+-UI-STABILIZATION-MASTER-RULES.txt

# PORTFOLIO DESIGN SYSTEM + UI STABILIZATION MASTER RULES

# PURPOSE

This document defines the mandatory architecture, ownership, responsive behavior, spacing logic, design system governance, execution workflow, and UI stabilization rules for the portfolio website.

The system must become:

- reusable
- deterministic
- token-driven
- component-driven
- scalable
- architecture-safe
- stable across breakpoints
- safe to extend without regressions

All future modifications must follow these rules.

---

# 01 — ROOT-CAUSE-FIRST RULE

Before modifying any UI or code:

1. Audit the actual DOM structure.
2. Audit the active CSS ownership.
3. Audit selector duplication.
4. Audit legacy CSS existence.
5. Identify whether the issue comes from:
   - duplicated selectors
   - conflicting ownership
   - page-level overrides
   - mobile overrides
   - fixed heights
   - overflow
   - wrong tokens
   - image sizing
   - invalid spacing ownership
   - broken JSX structure
6. Only fix after the root cause is identified.

Never patch blindly.

---

# 02 — NO PATCH STACKING RULE

Never append repeated override blocks.

Forbidden:

```css
/* FIX */
/* FINAL FIX */
/* MOBILE FIX */
/* REFINEMENT */

If the same area fails more than once:

Stop patching immediately.
Audit all active selectors.
Remove conflicting/legacy rules.
Rebuild the component cleanly.
Build again.

Do not layer fixes.

03 — ONE SELECTOR ONE SOURCE RULE

Each selector may only exist once in the base layer.

Allowed:

.hero-summary-grid {
}

@media (max-width: 430px) {
  .hero-summary-grid {
    flex-direction: column;
  }
}

Forbidden:

.hero-summary-grid {
}

/* later */
.hero-summary-grid {
}

Duplicated selectors create nondeterministic rendering.

04 — MOBILE OVERRIDE RULE

Mobile CSS may only override responsive differences.

Allowed:

font-size
line-height
width
flex-direction
radius
overflow behavior

Forbidden:

rebuilding the entire component
redefining all desktop layout rules
05 — TOKEN-FIRST RULE

All reusable values must live in tokens.

Reusable values include:

spacing
typography
radius
colors
breakpoints
padding
chip gap
inline icon spacing

Use:

margin-top: var(--pd-space-group);

Do not hardcode reusable values:

margin-top: 32px;

unless explicitly approved.

06 — COMPONENT OWNERSHIP RULE

Ownership must remain centralized.

Layer	Responsibility
tokens	reusable values
component CSS	reusable layout & visuals
component TSX	reusable structure
page TSX	composition only
Sanity	data only

Page files must not own reusable UI logic.

07 — PROJECT HERO OWNERSHIP RULE

Project hero ownership:

File	Responsibility
ProjectHero.tsx	hero structure
project-hero.css	hero styling
project-detail.css tokens	hero tokens
CaseStudyPage.tsx	compose only

CaseStudyPage.tsx must not:

define hero markup
define hero CSS
define hero spacing logic
define hero styled-jsx
08 — NO PAGE-LEVEL HERO PATCH RULE

Hero fixes must never happen in:

CaseStudyPage.tsx
inline styles
page-level styled-jsx
globals.css

Hero fixes only belong in:

ProjectHero.tsx
project-hero.css
hero tokens
09 — NO FULL TSX HEREDOC RULE

Do not rewrite large TSX files using heredoc.

Forbidden:

cat > LargeComponent.tsx <<'EOF'
...
EOF

Allowed:

targeted replace
python replace
focused overwrite for small files only

Reason:
heredoc can be truncated or polluted by terminal control characters.

10 — BUILD SUCCESS IS NOT UI SUCCESS RULE

A successful build only means:

TypeScript compiles
Next.js compiles

It does NOT mean:

spacing is correct
responsive behavior is correct
architecture is stable
ownership is clean

After build:

verify selector uniqueness
verify ownership
verify responsive behavior
verify visual hierarchy
11 — SPACING OWNERSHIP RULE

Reusable component owns:

internal padding
internal gap
internal state

Page layout owns:

section spacing
page rhythm
spacing between groups

Component must not control unrelated page rhythm.

12 — PORTFOLIO SPACING SYSTEM
Text Group

Desktop/tablet:

title → body = 16px

Mobile:

title → body = 12px
Hero Title Group

All breakpoints:

subtitle → title = 12px
title → chip = 16px
Group Spacing

All breakpoints:

group → group = 32px
Large Group

Example:
At a glance + body + info grid

Within large group:

body → info grid = 24px
Inline Icon

All breakpoints:

text → icon = 4px
13 — CHIP RAIL RULE

Chip rail must:

support horizontal scrolling
never use fade masks
never cut chips visually
preserve 16px spacing after last chip
use tokenized spacing
be controlled by shared component CSS only
14 — INFO GRID RULE

Info grid is a shared design-system component.

Desktop / Tablet
direction: row
gap: 0
cards visually connected
padding: 16px 24px
height: wrap content
Mobile
direction: column
gap: 0
cards visually connected
height: wrap content

Do not add random spacing between cards.

15 — HERO IMAGE RULE

Hero image:

comes from Sanity
uses shared component structure
must not own page padding
must not break layout with Image fill

Parent wrapper must define:

position: relative
width: 100%
aspect-ratio
overflow: hidden

Image fixes must not be mixed with spacing fixes.

16 — POPOVER RULE

Popover is a shared component behavior.

Must include:

fixed overlay
locked background scroll
correct close button selector
component-owned styling

Popover styling must not exist in page-level CSS.

17 — FAILED FIX HARD STOP RULE

If a fix fails once:

Stop patching.
Do not add another override.
Do not append another CSS block.
Audit root cause again.
Identify conflicting ownership.
Remove conflict first.
Apply one scoped solution.

If old and new systems coexist:
the fix is invalid.

18 — LEGACY CSS COEXISTENCE RULE

Old and new systems must not coexist.

Required process:

audit selectors
remove legacy blocks
keep one namespace
keep one responsive system
build before visual polish

Forbidden:

old media queries
old styled-jsx
layered temporary fixes
mixed ownership
19 — SELECTOR VERIFICATION RULE

Before and after UI fixes:

Run selector audits.

Example:

grep -n "hero-summary-grid" project-hero.css

Verify:

no duplicate selectors
no typo selectors
no obsolete selectors
no page-level overrides
20 — EXECUTION RULE

All code changes must be executable terminal commands.

Commands must:

backup
audit
apply scoped fix
verify
build

No manual editing instructions unless explicitly requested.

21 — FIX ORDER RULE

Always fix in this order:

Architecture
Selector uniqueness
Token usage
Responsive behavior
Visual polish

Never skip directly to polish.

22 — SHARED COMPONENT RULE

All reusable UI must become shared components.

Shared components belong in:

src/components/ui/

Shared component styles belong in:

src/styles/components/

Shared reusable values belong in:

src/styles/tokens/

Pages only compose components.

23 — DESIGN SYSTEM GOVERNANCE RULE

If a reusable component already exists:

reuse it
extend it safely
do not duplicate it

If changing a core reusable component:

audit all usages first
confirm impact scope
avoid breaking existing layouts

New variants are allowed.
Breaking existing core behavior requires review.

24 — RUNTIME DOM VERIFICATION RULE

Before fixing UI:
verify actual runtime structure.

Audit:

rendered DOM
computed styles
active classes
overflow behavior
responsive width
selector ownership

Never assume structure from memory.

25 — NO MULTI-SYSTEM MIXING RULE

Do not mix:

globals.css hero styles
page hero styles
styled-jsx hero styles
component hero styles

Only one active system may own a UI area.

26 — SHARED COMPONENT FIRST RULE

Before adding new UI:

check whether shared component already exists
extend existing component if possible
avoid one-off implementations

The design system is the source of truth.

27 — ARCHITECTURE BEFORE VISUAL RULE

Do not visually polish unstable architecture.

Correct order:

clean ownership
clean selectors
stabilize tokens
stabilize responsive behavior
polish visuals
28 — DETERMINISTIC CSS RULE

CSS must always be deterministic.

Meaning:

one selector
one source
one ownership
predictable override chain

If selector precedence becomes unclear:
the architecture is invalid.

29 — SANITY DATA RULE

Sanity owns:

content
image source
metadata

Sanity must not own:

layout
spacing
styling logic
30 — BREAKPOINT SYSTEM RULE

Portfolio breakpoints:

Breakpoint	Width
Desktop	1419px
Tablet	871px
Mobile	430px

All reusable components must follow the same breakpoint system.

No custom one-off breakpoints unless explicitly approved.

31 — TYPOGRAPHY RULE
Hero Title

Desktop/tablet:

60 / 72 / Extra Bold

Mobile:

32 / 40 / Extra Bold
Subtitle Above Hero Title

Desktop/tablet:

16 / 150% / Bold

Mobile:

14 / 150% / Bold
Chip

All breakpoints:

12 / 150% / Regular
At a Glance Title

Desktop/tablet:

24 / 150% / Bold

Mobile:

18 / 150% / Bold
Body

All breakpoints:

16 / 150% / Bold
Info Grid Label

All breakpoints:

14 / 150% / Regular
color: #888888
32 — INFO GRID COMPONENT RULE

Desktop/tablet:

horizontal row
gap = 0
connected cards
border overlap allowed
padding = 16px 24px
wrap content height

Mobile:

vertical column
gap = 0
connected cards
border overlap allowed
wrap content height

No random spacing between cards.

33 — IMAGE QUALITY RULE

Hero image must:

load from Sanity source
use proper next/image
include correct sizes
preserve aspect ratio
not upscale low-resolution source images

If image quality is blurry:

audit Sanity image source
audit image dimensions
audit sizes
audit container sizing
audit object-fit

Do not patch with CSS scaling first.

34 — FINAL GOAL

The portfolio system must become:

reusable
token-driven
component-driven
deterministic
scalable
architecture-safe
responsive-stable
safe to modify without regressions
aligned with professional design system architecture

---

# Source: pasted.txt — JSX / TSX Syntax Guard Rule

## JSX / TSX Syntax Guard Rule

任何 terminal 自動修改 TSX 前，必須先做 syntax-safe 檢查。

禁止：
- 用不完整字串替換 JSX / TS object literal
- 替換 `label:`、`className:`、`style:` 這類 key-value 片段時漏掉引號
- 在未 build 前連續執行下一段 refactor

每次自動修改後必須立即執行：

```bash
npm run build
```

---

# Source: pasted.txt — CSS Cascade Reset / Namespace / Terminal Recovery / No Multi-Step Styling Patch Rules

## CSS Cascade Reset Rule

When a UI component has failed more than once, do not append another override.

Required process:
1. Stop all visual fixes
2. Audit all selectors for that component
3. Delete legacy selector blocks
4. Keep one component class namespace only
5. Rebuild from a single CSS source

Forbidden:
- stacking new CSS at the bottom of globals.css
- keeping old class names active
- mixing `.navigator-root`, `.project-section-navigator`, and `.pd-section-nav`

## Component Namespace Lock Rule

Each reusable component must own one stable class namespace.

For SectionNavigator:
Allowed namespace:
- `.pd-section-nav`
- `.pd-section-nav__item`
- `.pd-section-nav__item--overview`

Forbidden:
- `.navigator-root`
- `.navigator-link`
- `.project-section-navigator`
- `.project-section-navigator__item`

If old namespaces remain, they must be deleted or disabled before new styling is added.

## Failed Terminal Command Recovery Rule

If terminal shows:
- `heredoc>`
- `quote>`
- `dquote>`
- `bquote>`

Immediately:
1. Press `control + C`
2. Do not type more code
3. Run `pwd`
4. Run `npm run build`
5. Only continue after build succeeds

Never continue from an unfinished shell prompt.

## No Multi-Step Styling Patch Rule

For UI fixes after regression:
- Do not edit component + tokens + globals in one command
- Do not create new class names and append CSS at the same time
- Do not run dev until build succeeds

Required order:
1. Clean old CSS/source conflicts
2. Build
3. Add or replace component file
4. Build
5. Add CSS from one source
6. Build
7. Runtime DOM verify

---

# Source: pasted.txt — CSS / Layout Mutation Rules

CSS / Layout Mutation Rules
RULE 01 — 禁止全文 replace CSS value

❌ 禁止：

replace("gap: 72px;", "gap: 96px;")

✅ 必須：

找到特定 selector block
只修改該 block

例如：

.hero-flow {
  gap: 72px;
}

只能改這個 block。

RULE 02 — 禁止同時改 desktop/tablet/mobile

一次只允許：

desktop
或
tablet
或
mobile

不能一起動。

RULE 03 — 每個 component 只能有一個 owner css

例如：

ProjectHero

只能：

project-hero.css

控制。

禁止：

globals.css override
token override
random section override
RULE 04 — Token 只定義，不直接覆蓋 layout

Token：

✅ 可以：

--hero-title-size

❌ 不可以：

.hero-title {
  font-size: var(...)
}

又在 globals 覆蓋。

RULE 05 — 修改前先 audit selector

每次修改前：

必須先：

grep -n ".hero-title"
grep -R "hero-title" src

確認：

哪些地方控制它

才能改。

RULE 06 — 每次只修一個問題

❌ 禁止：

同時修：
- hero
- navigator
- mobile
- image
- spacing

✅ 必須：

一次只修：
hero image composition
RULE 07 — 任何 breakpoint 必須 scoped

❌ 禁止：

.hero-flow {
  gap: 40px;
}

直接影響全部。

✅ 必須：

@media (max-width: 871px) {
  .hero-flow {
    gap: 40px;
  }
}
RULE 08 — 所有 visual calibration 必須 selector-level

❌ 禁止：

replace("font-size: 60px")

✅ 必須：

找到 .hero-title block
只改 font-size
RULE 09 — 任何 build/cache error 不准直接 patch UI

例如：

_ssgManifest.js
404

這是 runtime issue。

不能因此改 layout。

RULE 10 — Hero image 永遠獨立處理

Hero image：

不跟 typography patch 一起改
不跟 spacing patch 一起改
不跟 navigator patch 一起改

因為：

它是最大 layout dependency

---
