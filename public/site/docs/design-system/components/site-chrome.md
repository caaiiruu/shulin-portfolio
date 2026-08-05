# SiteChrome

## Purpose

Shared navigation, global search, and contact closure across every public portfolio route.

## Ownership

- CSS owner: `assets/css/components/site-chrome.css`
- Interaction owner: `assets/js/app.js`
- Render source: shared static header and footer templates
- Footer transition: `--footer-organic-edge-*` tokens plus the single `footer-organic-edge.svg` mask. The mask is decorative and must never clip footer content.
- Token owner: `assets/css/tokens.css`

## Responsive contract

- Desktop keeps the primary navigation visible in the sticky header.
- The homepage header is transparent over the Hero surface from the first pixel of the page; all other routes retain the shared chrome surface.
- Global search remains visible in the header on every route.
- Search uses a centred desktop dialog and a full-height mobile surface without horizontal page overflow.
- Mobile replaces it with one menu button and one expandable navigation.
- The open mobile menu fits within the viewport and can scroll independently.
- The contact action is compact on wide screens and full width on narrow screens.
- Footer copy wraps naturally; email text is never forced to break mid-word.

## Interaction and accessibility contract

- Every target is at least the shared control height.
- Current-route state is exposed with `aria-current="page"` in both navigation variants.
- The mobile menu closes on link activation, outside click, Escape, and transition to desktop.
- Escape returns focus to the menu button.
- The menu button label reflects open/closed state in the active language.
- Search opens with focus in the query field, announces and focuses updated results, closes on Escape or backdrop activation, and returns focus to its header trigger.
- Search exposes one focus ring at a time; the input must never render a nested focus ring inside the form owner.
- The language control changes only the hovered or selected option, never the entire segmented-control surface.
- Language changes preserve the current route, selected domain, open detail state, and exact scroll position after bilingual content reflows.
- The compact menu trigger has no visible default outline; its pale-cyan surface appears only on hover, focus, or open state.
- Search suggestions and result content come from the canonical Content SSOT; no route owns a duplicate query model.
- The homepage matcher is retained only as progressive no-JavaScript fallback and is hidden after the global search owner mounts.
- Focus-visible, reduced-motion, and forced-colours behavior remain supported.
- The full-page transition loader uses the one-to-five-to-one brand hand, marks the document `aria-busy` only while visible, settles at five for reduced motion, and remains legible in forced-colours mode.

## Forbidden modifications

- Header or footer selectors in `base.css`
- A second mobile navigation
- Page-specific Header or Footer overrides
- Raw production colour values or `!important`
- Fixed-height footer copy or forced word breaking
- Polygon clipping on `.site-footer`; organic separation belongs to the bounded `::before` edge.
- Versioned, copied, or backup SiteChrome source files
