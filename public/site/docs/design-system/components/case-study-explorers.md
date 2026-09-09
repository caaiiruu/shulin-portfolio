# Case Study Presentation System v2 explorers

Status: Live / Current Production — Daily Hours opt-in pilot

Runtime Owner: `assets/js/app.js`

CSS Owner: `assets/css/components/project-detail-overview.css`

Content Owner: `content/portfolio-content.json`

Figma Source: Not mapped. Code and the Content SSOT are authoritative until a user-approved Figma mapping exists.

## Decision Explorer

The Decision Explorer is a registered `Decision` variant. It presents exactly one selected decision story and its primary proof. The selector labels remain compact; the selected panel reads question, decision title, one rationale, and primary proof. Arrow keys move focus without changing selection; Enter or Space selects. Selection is exposed with `aria-selected` and a non-colour visual marker.

Required decision fields: `id`, `label`, `question`, `title`, `whyThisChoice`, `primaryProof`, and `supportingEvidence[]`.

## EvidenceExplorer

EvidenceExplorer is the only new shared primitive in v2. It progressively discloses evidence that supports—but never replaces—the selected decision's primary proof. Desktop and tablet use an index plus one stage. At 871px the index moves above the stage. At 430px it becomes a single-open accordion and starts fully collapsed. Each item reads title, media, then proof.

Required proof fields: `assetId`, `mediaType`, `alt`, `caption`, `proof`, `mediaRole`, and `presentationIntent`. Optional video fields are `posterAssetId`, `autoplayOnView`, and `loop`. Approved presentation intents are `wide`, `interactive`, `cinematic`, and `device`.

Video media delegates to EvidenceFrame for native controls, visible poster, muted inline playback, in-view autoplay only when explicitly enabled, offscreen pause, reduced-motion suppression, and no forced loop unless explicitly enabled.

## Shared v2 composition

The opt-in scene order is Opening, First Question, Reframe, Decision Explorer, Primary Proof, Evidence Explorer, What Changed, Outcomes, CTA, and Related. `ChangeSequence` and `ProjectCTA` remain extensions of ProjectDetailOverview; they are not new primitives.

Allowed modifications: shared variant extensions, accessibility fixes, responsive refinements at existing breakpoints, and new opt-in consumers with complete governed content.

Forbidden modifications: project-name branching, replacing primary proof with an evidence dump, reusing retired SelectedEvidence, hidden autoplay without controls, unregistered breakpoints, raw spacing or colour values, and implicit opt-in for existing case studies.
