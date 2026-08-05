# Component: ChallengeMatcher

Status: Live / Current production mockup

JS Owner: `assets/js/home.js`
CSS Owner: `assets/css/components/search.css`
Token Dependencies: control height, rail gap, surface, focus
Variants: Idle, Loading, Matched, No-match
Usage Scope: Homepage
Allowed Modifications: curated intents, verified related projects
State Contract: `data-matcher-state` is the only layout state owner. Input text never activates sticky mode. Sticky mode is allowed only for Matched and No-match. Recommended chips are visible in result mode only while the search control owns focus.
Session Contract: a new browser session starts Idle with no result; a submitted result may be restored only within the same browser session.
Scroll Contract: every submitted query or chip selection positions the result start below the fixed header and compact sticky search with a semantic spacing token.
Forbidden Modifications: generated unsupported claims, visible status clutter, same layout for success and no-match, sticky before a submitted result, independent `has-query` layout state
Accessibility: input label, keyboard chips, result focus after submit, live status, no default selected chip
