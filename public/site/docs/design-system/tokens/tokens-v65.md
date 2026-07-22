# Portfolio Design System v65 — Token Architecture

## Contract

All production styling follows one dependency chain:

`reference token → semantic token → component token → component selector → page usage`

Reference tokens describe raw values. Semantic tokens describe intent. Component tokens describe a reusable UI contract. Page selectors may consume semantic or component tokens but must not introduce new raw colour, spacing, radius, shadow, motion, or type values.

## Naming

| Layer | Prefix | Example | Modification boundary |
|---|---|---|---|
| Reference | `--ref-` | `--ref-cyan-500` | Change only when the palette or scale itself changes |
| Semantic | `--sys-` | `--sys-color-text-accent` | Change when product meaning or theme changes |
| Component | `--cmp-` | `--cmp-card-radius` | Change when the reusable component contract changes |
| Compatibility | legacy names | `--c-cyan-dark` | Alias only; no new usage |

## Typography roles

| Role | Token | Usage |
|---|---|---|
| Display | `--sys-type-display` | Homepage statement only |
| Title | `--sys-type-title` | Page and dialog titles |
| Heading 1 | `--sys-type-heading-1` | Primary section headings |
| Heading 2 | `--sys-type-heading-2` | Subsections and evidence groups |
| Heading 3 | `--sys-type-heading-3` | Card and compact headings |
| Lead | `--sys-type-body-lg` | Introductory or thesis copy |
| Body | `--sys-type-body` | Default reading copy |
| Body small | `--sys-type-body-sm` | Secondary metadata |
| Label | `--sys-type-label` | Eyebrows and taxonomy labels |

Display uses Manrope; reading copy uses Inter. Traditional Chinese falls back to Noto Sans TC and PingFang TC. Line height and measure are role tokens, not page overrides.

## Spacing and rhythm

The reference scale is a 4px base with larger purposeful intervals. Semantic rhythm tokens govern relationships: eyebrow-to-heading, heading-to-body, body-to-action, card padding, panel padding, dialog padding, page gutter, and section block spacing.

## Governance

- Do not add raw hex values outside `tokens-v65.css`.
- Do not add ad-hoc `font-size`, `box-shadow`, `border-radius`, `transition-duration`, or structural spacing in page CSS.
- New reusable components require registry ownership, usage scope, variants, state coverage, and a Figma mapping status before release.
- Compatibility aliases are migration bridges and may not be used by new code.
