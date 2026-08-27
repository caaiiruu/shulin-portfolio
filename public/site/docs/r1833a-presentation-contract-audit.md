# R183.3A Presentation Contract Architecture Audit

Exact starting HEAD: `5c4a8b8949e6c7d3f3d2649da7578b04f3260d2f`

## Production influence map

| Path | Previous production influence | Classification | R183.3A disposition |
|---|---|---|---|
| `projects.*.sectionOrder` / adapted `section_order` | Ordered public Primary sections | PRESENTATION CONFIGURATION — MUST MOVE TO CONTRACT | Retained as migration-only data; ignored by public renderer |
| `projects.*.presentation.sectionOrder` | Could override shared order | PRESENTATION CONFIGURATION — MUST MOVE TO CONTRACT | Ignored; archetype contract owns order |
| `projects.*.presentation.navigation` | Could define a parallel Navigator IA | PRESENTATION CONFIGURATION — MUST MOVE TO CONTRACT | Ignored; Navigator derives from rendered contract slots |
| `projects.*.presentation.visibility` | Per-project section presence | PRESENTATION CONFIGURATION — MUST MOVE TO CONTRACT | Only verified content presence controls contract-defined optional slots |
| `publicContent.contribution`, `publicContent.myContribution`, `valueIBrought` | Could create standalone Contribution | LEGACY — REMOVE FROM PUBLIC RUNTIME | Retained as migration/data truth input only; never a public slot |
| `criticalProblem`, `keyProblems` | Could render Key/Critical Problems | LEGACY — REMOVE FROM PUBLIC RUNTIME | Retained as historical/data truth only; forbidden resolver inputs |
| `businessImpact`, `impactEvidence`, `outcomeEvidenceModel` | Mixed legacy Business Impact and result evidence | DATA TRUTH ONLY | May feed Outcomes semantics; cannot create a Business Impact section |
| `ownershipModel` and old ownership aliases | Fed multiple ownership renderers | CANONICAL plus MIGRATION-ONLY aliases | `ownershipModel` is canonical; aliases are adapter-only |
| `publicContent.*Evidence`, `canonicalEvidence`, `sourceEvidence` | Selected by project-specific refs/renderers | DATA TRUTH ONLY | Semantic resolver selects a registered Evidence variant deterministically |
| `renderProgrammeParent()` | Voucher-specific top-level IA | LEGACY — REMOVE FROM PUBLIC RUNTIME | Isolated to migration/history; Primary top level uses Primary contract |
| `applyCaseStudySectionSystem()` / `CASE_STUDY_SECTION_REGISTRY` | Generic legacy section-order renderer | LEGACY — REMOVE FROM PUBLIC RUNTIME | No longer reachable for public Primary pages |
| `renderSystemCaseParent()` | Shared recruiter-first renderer but still created Contribution | CANONICAL with forbidden legacy branch | Becomes the only Primary renderer; Contribution path removed |
| `renderExperiment()` | Compact Experiment renderer | CANONICAL, incomplete governance | Governed by Experiment archetype slots and component resolver |

## Ownership conflict found

Overview typography and borders had two active owners: `.project-summary-v45 p` and `.project-signals-v45 strong` used different semantic sizes, while both `.project-signals-v45>div` and `.info-grid-v45>div` owned divider borders. R183.3A consolidates these into one Overview body intent and one no-divider InfoGrid intent.
