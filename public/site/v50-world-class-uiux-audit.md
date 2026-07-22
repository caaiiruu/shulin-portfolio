# Portfolio v50 — World-class UI/UX and Recruitment QA

Date: 2026-07-17  
Status: **Automated Chromium QA passed; real Safari and physical-device validation pending**

## 1. Executive assessment

The current structure now supports the primary hiring decision path:

1. Positioning and seniority
2. Verified scale and organisations
3. Strongest professional evidence
4. Problem-based discovery
5. Cross-domain systems thinking
6. Decision principles with clearly separated supporting cases
7. Smaller experimental work
8. Explicit contact route

The visual system preserves the authored brand through:

- White primary surfaces
- Near-black editorial hierarchy
- Dark cyan system chapters and controls
- Coral human-decision accents
- Asymmetric layouts
- Hand-authored diagrams and playful geometry

The brand treatment no longer depends on unstable hover outlines, custom cursor labels, or decorative motion.

## 2. Runtime QA passed

Chromium rendered and tested:

- 1440 × 900
- 900 × 900
- 768 × 900
- 430 × 844
- 375 × 812
- 320 × 700

Across Home, Work, Playground, and Profile:

- Horizontal page overflow: 0
- Console errors: 0
- Duplicate IDs: 0
- Hidden reveal content: 0
- One H1 per page: passed
- Main landmark and skip link: passed
- Custom interactive target minimum: 44 × 44 CSS px
- CSS parsing: passed
- JavaScript syntax: passed

Verified interactions:

- Search default is centred
- Suggested chip populates the input
- Result submit collapses to arrow only
- Focus moves to the result heading
- No-match uses a visibly different composition
- Domain defaults to Financial services
- Mobile Domain chips are sticky below the header
- Domain switching updates selected state and returns focus to content
- Project and Experiment dialogs open at scroll position 0
- Related-case switching resets the dialog to the top
- Escape closes the dialog and returns focus
- Work filtering updates selection and visible cards
- Experiment hover preserves semantic background and text colours
- Reduced-motion mode does not hide content

## 3. Major design corrections

### Responsive containment

The previous mobile horizontal overflow was caused by Grid children preserving the min-content width of horizontal rails and long diagram labels.

Corrected through:

- `min-width: 0` on Grid and Flex children
- Internal rail scrolling
- `max-width: 100%` on Domain, Search, and Flagship containers
- Mobile diagrams that wrap or stack
- 2 × 2 metric grid at compact widths

### Work evidence

Representative artifacts now have intentional visual structure:

- Voucher: reusable incentive browser model
- DBS: shared-state and escalation model
- Booking.com: rollout-readiness map
- Project Hours Tracker: closure dashboard
- Bandzo: practice and feedback progression

The artifacts no longer appear as unstyled concatenated text.

### Design Principles

The explanatory principle and its evidence link are now distinct.

Each card contains:

- Principle
- Explanation
- What it changes
- Separate `Supporting case` control

Only the supporting-case control opens the Project dialog.

### Experiment work

Experiment cards now:

- Preserve their cyan, cream, coral, or dark surfaces on hover
- Separate Current learning label and content
- Use compact authored geometry
- Remain within one mobile decision viewport where copy length permits
- Use a horizontal rail instead of vertically stacking the full collection

### Colour accessibility

Semantic text and filled-surface colours were adjusted:

- Muted text: `#687176`
- Dark cyan: `#276F82`
- White on dark cyan: contrast ratio approximately 5.7:1
- Dark cyan on white: approximately 5.7:1
- Muted text on subtle surface: approximately 4.6:1

Bright cyan remains available for decoration and connections, not for small white text.

## 4. Hiring-role assessment

### Recruiter

Passed:

- Role direction visible immediately
- Seniority and scale scannable
- Strong work appears before experiments
- Work can be explored directly or by hiring problem
- Contact destination is explicit

### Design Hiring Manager

Passed:

- Project transformations are clear
- At a glance, Role, Scale, Key decision, Scope, Audience, and Timeline form one decision block
- What made this hard appears before decisions
- Decisions include alternatives and trade-offs
- Real or representative evidence remains visually connected to explanation

### Product Manager

Passed:

- Business context and business impact are separated
- Team impact identifies the affected function and the resulting change
- Cross-functional responsibilities are distinct from the designer’s direct ownership

### Engineering and Systems Reviewer

Passed:

- Roles, states, rules, ownership, and exceptions are visible
- Reusable system logic is prioritised over screen count
- Delivery and measurement are separated from expected outcomes

### Accessibility Reviewer

Passed in automated Chromium checks:

- 320 CSS px reflow
- 44 px custom control targets
- Visible external focus indicators
- Sticky controls do not hide result focus in tested flows
- Keyboard-operable Search, Domain, Menu, filters, rails, and dialogs
- Reduced-motion fallback

## 5. Remaining publication blockers

These cannot be responsibly invented and must be replaced or removed before public launch:

1. Award title and `To replace` entries
2. Generic Spotify destination
3. Placeholder email address if it is not the real address
4. Abstract interest images labelled as placeholders
5. Representative project artifacts where real, sanitised evidence is available
6. Final verified Resume and LinkedIn destinations
7. Exact timeline or outcome information where confidentiality permits

Recommendation:

- Hide the Awards section until at least one verified item is available, or replace the placeholder list before deployment.
- Replace abstract images gradually; they are acceptable for layout review but not final credibility proof.

## 6. Validation still pending

Not claimed as complete:

- macOS Safari rendering
- Physical iPhone touch and safe-area behaviour
- Real Vercel routing, caching, font loading, and asset performance
- Real network failure and slow-loading states
- Final content accuracy and confidentiality approval
- Real project-image crop quality

## 7. Source-of-truth rule

The active production style chain is limited to:

1. `tokens-v49.css`
2. `foundation-v49.css`
3. `components-v49.css`
4. `pages-v49.css`

Registry:

- `docs/design-system/registry-v50.json`

No legacy CSS file is loaded by the four production pages.

The registry does not replace runtime QA. It defines ownership; screenshot and interaction tests prove the rendered result.
