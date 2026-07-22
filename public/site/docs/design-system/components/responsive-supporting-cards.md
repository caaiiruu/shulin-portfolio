# Components: ExperimentCard and ProfileSideCard

Status: Live / Current Production

React Source: Experiment and Profile static page templates

CSS Owner: `assets/css/system-v72.css`

Rail Owner: `assets/css/components/horizontal-rail.css`

Token Dependencies: `experiment-card-min-block`, `experiment-card-min-block-mobile`, `profile-card-min-block`, `experiment-card-title`, `profile-card-title`, `card-padding`

Variants: Experiment colour variants; Profile side-project colour variants

Usage Scope: Experiment page, Profile page, Home experiment rail

Allowed Modifications: shared density tokens, shared responsive title sizing, canonical rail width tokens

Forbidden Modifications: page-level fixed height, clipped title, legacy rail-width override, edge mask

Responsive Contract: titles may wrap naturally and must remain fully readable; mobile cards use their own minimum block size; each viewport preserves a visible continuation cue without horizontal page overflow.
