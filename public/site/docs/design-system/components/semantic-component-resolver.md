# Semantic Component Resolver

- Status: Live / Current Production
- Runtime source: `assets/js/app.js#resolveProjectSemanticSlot`
- CSS owner: `assets/css/components/project-detail-overview.css`
- Contract owner: `content/portfolio-content.json#implementationContracts.portfolioPresentation`
- Registry owner: `docs/design-system/registry.json#governanceGraph.componentContracts.SemanticComponentResolver`

The resolver is deterministic. It selects the first verified source path allowed for a semantic slot, then maps that slot to a registered Design Library component. It never uses project identity, runtime AI, or fabricated content.

Evidence priority is Product Evidence → Research Evidence → Prototype Evidence → Artefact Evidence → Framework Evidence → Text Evidence. Missing optional content produces no section. Text Evidence may display only verified source text.

Archetype contracts exclusively own section order. Project `sectionOrder`, presentation navigation, visibility flags, and legacy Contribution/Key Problems structures are migration-only and cannot create public sections.
