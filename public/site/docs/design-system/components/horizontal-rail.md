# Component: HorizontalRail

Status: Live / Current Production

JS Owner: `assets/js/app.js`
CSS Owner: `assets/css/components/horizontal-rail.css`
Token Dependencies: control height, rail gap, card columns, surface, border, focus
Variants: Project, Experiment, Profile, Filter
Usage Scope: Home, Work, Experiments, Profile, Project dialog
Allowed Modifications: card-width token, snap behavior, visible control state
Forbidden Modifications: page-level rail override, edge mask, artificial trailing spacer, whole-card hover translation
Scroll Contract: controls advance by one rendered card plus its computed gap; native touch and trackpad scrolling remain enabled.
End Contract: no synthetic final spacer; the last card aligns to the end only when reached.
Accessibility: controls expose disabled state, disappear when content does not overflow, and retain a visible focus state.
