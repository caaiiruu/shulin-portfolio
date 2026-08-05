# Component: HorizontalRail

Domain Evidence Density Contract: the Domain supporting-work rail uses compact, symmetrical block padding owned by `--rail-domain-pad-block-start` and `--rail-domain-pad-block-end`. The Domain panel already owns its outer section inset, so the rail must not add a second large bottom spacing token after its cards.

Status: Live / Current Production

JS Owner: `assets/js/app.js`
CSS Owner: `assets/css/components/horizontal-rail.css`
Token Dependencies: control height, rail gap, edge inset, card columns, surface, border, focus
Variants: Project, Experiment, Profile, Filter
Usage Scope: Home, Work, Experiments, Profile, Project dialog
Excludes: Domain supporting work, which is owned by `DomainSelector` as a responsive evidence grid.
Allowed Modifications: card-width token, snap behavior, visible control state
Forbidden Modifications: page-level width/gap/card-column overrides, edge mask, artificial trailing spacer, whole-card hover translation
Scroll Contract: controls move to the next or previous rendered card snap anchor; native touch and trackpad scrolling remain enabled.
End Contract: no synthetic final spacer; the last card aligns to the end only when reached.
Accessibility: controls expose disabled state, disappear when content does not overflow, and retain a visible focus state.
- Overflow is measured from untransformed layout geometry (`offsetLeft + offsetWidth`), not painted `scrollWidth`; decorative card rotation must never create a false extra view or a residual final click.
- Horizontal scrollers stay inside their owning container. They must not use negative inline margins or expanded widths to create interaction room.
- Rails reserve a token-owned inline safety inset so rotated, focused, and hovered card edges remain fully visible at the first and last snap positions.
- Every native horizontal scroller has an explicit unmasked edge. Gradient fades, overlay scrims, inset shadows, pseudo-element edge covers and clipped edge treatments are forbidden.
- Card rails show only whole cards at every supported breakpoint: three columns on desktop, two on tablet and one on mobile. A partially clipped card must never be used as the affordance for horizontal scrolling.
- Previous/next controls and the native scrollbar communicate continuation; card clipping does not.
- Rails reserve vertical interaction space for hover elevation so card shadows are never clipped by the scroll container.
- Arrow controls use the canonical `assets/img/arrow.svg` direction variants and expose an explicit disabled state at both scroll limits.
