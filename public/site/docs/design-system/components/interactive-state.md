# Interactive State

Status: Live / Current Production
CSS Owner: `assets/css/components/foundation.css`
Token Source: `assets/css/tokens.css`

## Variants

- Selected: solid semantic surface, explicit on-state text, and persistent border.
- Disabled: readable semantic surface, border, and text; never communicated by opacity alone. Horizontal-rail arrows must expose native `disabled` plus `aria-disabled` at either end.
- Current: selected navigation or tab state with an additional border/ring cue.

## Usage

Search chips, Work filters, Domain navigation, and Horizontal Rail controls.

## Arrow icon contract

- Source: `assets/img/arrow.svg`
- All visible arrow affordances use the same 16 × 16, 2px round-cap SVG.
- Direction changes use `.icon-arrow--*` transform variants; do not introduce text glyph arrows or a second SVG.
- Disabled rail arrows keep the same icon and use the shared disabled surface, border, text and native `disabled` state.

## Modification boundary

Extend the shared selector only when a production control adopts the same state contract. Do not add raw state colours or page-level disabled/selected overrides.
## Organic interaction contract

- Focus rings must remain fully visible inside scroll and clipped containers by using `--interactive-state-safe-area`.
- Hover shape changes use `--interactive-organic-radius`; avoid rectangular full-surface color swaps.
- Hover elevation uses `--shadow-organic-hover` with subtle movement only.
- Pressed states return toward the resting plane and must not remove the focus indicator.
- Icon color inherits `currentColor`, including inverse and disabled states.
- Static capability or approach values are not chips: render them as an unbordered information list with a small marker and no hover state.
- Work cards use the `--work-card-hover-*` token family across every route.
- Interactive journey cards remain visually neutral at rest. Border emphasis, organic radius, cyan shadow, and lift are reserved for hover or keyboard focus.
- Experiment cards remain visually distinct: a slight resting tilt resolves to level on hover while only the CTA and small decorative shapes gain emphasis.
- Organic header hover surfaces use the pale cyan family; coral is not used as an error-like hover fill.
