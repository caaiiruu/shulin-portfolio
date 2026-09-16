# Component: ExperimentCard

Status: Live / Current Production

React Source: Experiment and Profile static page templates

CSS Owner: `assets/css/components/experiment-card.css`

Rail Owner: `assets/css/components/horizontal-rail.css`

Token Dependencies: `experiment-card-min-block`, `experiment-card-min-block-mobile`, `experiment-card-rest-odd`, `experiment-card-rest-even`, `experiment-card-rest-third`, `experiment-card-title`, `card-padding`

Variants: Shared compact ProjectCard for Homepage and Experiment index; Profile awarded-exploration cards

Usage Scope: Experiment page, Profile page, Home experiment rail

Allowed Modifications: shared density tokens, shared responsive title sizing, canonical rail width tokens

Forbidden Modifications: page-level fixed height, clipped title, legacy rail-width override, edge mask

Responsive Contract: Homepage and Experiment index cards reuse the shared compact ProjectCard content-first/media-second shell and canonical media manifest; titles may wrap naturally and must remain fully readable; each viewport preserves a visible continuation cue without horizontal page overflow.

Experiment Interaction Contract: adjacent cards intentionally use three different resting angles and vertical offsets; only the hovered or keyboard-focused card levels and lifts.
