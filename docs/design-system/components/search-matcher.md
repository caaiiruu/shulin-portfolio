# SearchMatcher

Component: SearchMatcher

Status: Live / Current Production

JavaScript Source: `public/site/assets/js/home.js`

CSS Owner: `public/site/assets/css/components/search.css`

Token Dependencies: semantic colour, typography, spacing, radius, motion, elevation, focus and layout tokens from `tokens-v72.css`

Variants: idle, focus, loading, matched, no-match, compact sticky

Usage Scope: Homepage `#matcher` only

Figma Source: Not mapped

Code Connect Status: Not mapped

Allowed Modifications: state extension; token substitution; scoped responsive refinement; accessibility improvements

Forbidden Modifications: legacy stylesheet overrides; page-level Search selectors; `!important` patches; a second Search state owner

Production Boundary: `scripts/build-production-assets.mjs` removes historical Search selectors before appending this component owner. The build fails if a legacy Search selector escapes that isolation.

Interaction Contract: Suggested problem chips remain hidden in the idle state and expand when focus enters the Search panel. The composite form owns one external focus ring; the input must not add a nested ring. After matching, the workspace—not the result child—is aligned below the header so the compact query control and result heading remain visible together. Focus moves to the compact result-context label rather than the whole result surface, preserving reading position without a full-column focus treatment.

Reading Contract: Matched results use a wider evidence column and a restrained title scale. The scan order is recommendation, rationale, approach, then related project evidence. Supporting cells use bordered surfaces instead of competing oversized typography.

Responsive Contract: At 900px and below, the matched query panel becomes a compact section-bounded sticky control directly beneath the fixed Header. Idle chips may extend to the page edges; matched chips remain inside the compact panel so their focus and scroll surfaces cannot create page overflow. At 320–360px, the input and submit control retain a minimum 44px touch target while typography and padding reduce through component tokens.
