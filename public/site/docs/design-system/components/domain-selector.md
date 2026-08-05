# Component: DomainSelector

Status: Live / Current production mockup

CSS Owner: `assets/css/components/domain-selector.css`
Token Dependencies: control height, brand system, brand human focus, `--domain-tab-radius`
Variants: Desktop sticky sidebar, Mobile horizontal tabs and floating navigation
Usage Scope: Homepage Domain section
Allowed Modifications: domain labels, verified content, responsive evidence grid
Forbidden Modifications: pseudo-elements that participate in grid alignment, persisted non-default initial selection
Accessibility: tablist keyboard arrows, Home / End, selected state, external focus indicator
Layout Contract: `domain-sidebar` and `domain-stage` are the only direct children of `domain-layout`; supporting work is a local evidence grid, not a horizontal rail.
Model Contract: The Domain model is one connected three-stage system, preceded by a verified count and labels derived only from the Domain's canonical featured and supporting professional project IDs. It must never imply an unverified stage-to-project mapping.
Viewport Contract: Hero CTA, desktop tabs, keyboard tab selection, mobile tabs, and compact floating controls all re-anchor to the Domain section start through the single `scrollToDomainStart` owner. A domain change must never scroll `domainStage` independently.

Floating rail contract: the active chip is positioned by the rail's own clamped `scrollLeft`; it must remain inside the pill container at both edges and must never use document-level `scrollIntoView`.
Shape Contract: Resting tabs consume `--domain-tab-radius`, which derives from the shared semantic radius scale. Hover may use only the registered organic interaction radius.
