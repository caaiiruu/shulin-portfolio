# Component: ProjectCard

Status: Live / Current production mockup

HTML Source: Homepage dynamic renderer and Work page cards
CSS Owner: `assets/css/system-v72.css`
Token Dependencies: card padding, project card media block, control height, surface, elevation
Variants: Homepage, Work, Search, Domain, Related
Usage Scope: Homepage, Work, Matcher, Domain, Detail popup
Allowed Modifications: content fields, representative visual, variant extension
Forbidden Modifications: hover outlines, page-level spacing overrides, multiple nested links
Accessibility: whole-card target, pointer cursor, focus-visible, pressed state, concise accessible label
Responsive Contract: paired desktop cards share an action baseline; media height is token-owned; mobile cards return to content-driven height without desktop stretch.
Search Variant Contract: text-first compact card; context, transformation title, one relevance statement, and one action only. It must not inherit Domain visual, single-card split layout, or multi-row metadata.
