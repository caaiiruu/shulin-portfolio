# Component: DetailDialog

Status: Live / Current production mockup

HTML Source: shared `#detailDialog` in all complete pages
CSS Owner: `assets/css/components/popup-shell.css`
Token Dependencies: dialog gutter, section gap, panel padding, title gap
Variants: Professional project, Experiment
Usage Scope: Homepage, Work, Playground, Profile
Allowed Modifications: verified content, gallery assets, related cases
Forbidden Modifications: independent popup variants per page, retained scroll position between cases, nested vertical scroll panels
Accessibility: modal semantics, visible close, Escape, focus return, scroll reset, related-case switching

## Navigation and viewport contract

- `popup-shell.css` is the only owner of the dialog surface, sticky controls, safe-area spacing, and open/close motion.
- Back and Close use the shared dialog control inset; page-level top or side offsets are forbidden.
- `project-detail-overview.css` owns the Related work section layout; `horizontal-rail.css` owns its horizontal scrolling and controls.
- Pointer or route entry does not programmatically focus the detail title. Keyboard opening relies on the modal control order; closing or pressing Escape returns focus to the original card.
- Every newly opened project, experiment, related case, search result, or deep link begins at the top and clears unrelated detail history.
- Header metadata is one non-wrapping, horizontally scrollable line in the order company · domain/type · timeline. Company and domain/type share the same text baseline and separator rhythm.
- Navigator clicks run as one cancellable navigation transaction. A newer click cancels every older animation frame and correction, owns the active state through arrival, and only then returns control to scroll-spy without moving visible focus to the section heading. Manual wheel, touch, or keyboard scrolling cancels the transaction and immediately restores scroll-spy.
- Every section heading uses the shared title-to-subtitle and subtitle-to-content spacing tokens. A section may not add a second margin between its heading block and content.
- Professional project cases with at least two available chapters use one compact bottom-floating anchor navigator with Overview, Complexity, Decisions, and Impact. It is a direct child of the dialog shell, outside the animated scroll container, so it remains stationary throughout the popup. It is document navigation rather than a tablist; missing chapters are omitted without hiding the remaining navigator. Every destination is calculated against the dialog scroll root after the mobile disclosure closes, with the sticky control height included exactly once.
- At every viewport, Project navigation reuses the shared FloatingNavigator shell, horizontal chip rail, and item states. A Project-only disclosure, dropdown, accordion, or `Jump to section` control is forbidden.
- Every programme child resolves its parent from the canonical `parentKey`; return never depends on a temporary stack being present.
- Parent → child navigation restores the stored parent reading position. A direct child deep link returns to the parent overview at the top.
- Every public Project Popup owns one canonical, reload-safe path at `/site/work/{canonical-project-slug}`. Programme children extend the same path as `/site/work/{canonical-project-slug}/{child-slug}` without mounting a nested dialog.
- Browser Back / Forward, the visible Back control, and Close use the same canonical route state. Direct routes open the same shared dialog over Work; Close restores the pre-open page, hash, and scroll context when available, or `/site/work.html` for a direct deep link.
- At 900px and below, the dialog occupies the dynamic viewport and its sticky controls include the device top safe area.
- Base styles must not contain `detail-related-v45` selectors or popup-control overrides.

## First-viewport density contract

- Parent and complete child cases use title, up to three problem types, The value I brought, At a glance, and the shared context grid to establish relevance without horizontal scrolling. Type, Scope, Audience, and Timeline appear only in the context grid; project title metadata must not duplicate them.
- The value I brought sits immediately below the project heading. Until project-specific copy is approved, it renders the bilingual SSOT placeholder and must never borrow or paraphrase Business impact.
- Project titles use the shortest specific verb-and-system change that distinguishes the case. A repeated `From … to …` formula is optional, never mandatory; title variety must improve project-type recognition without sacrificing the transformation.
- The Problem types label and chips share one internal text baseline: the label uses the same vertical inset and line-height as the chip content. Do not center the label box against the chip surface.
- Project relevance metadata is presented as a labelled inline list with a left accent rule, not as selectable pills or tabs. Its public label is `Key problems / 聚焦問題`.
- The system-change map uses `Original state / 原始狀態`, `Key intervention / 關鍵介入`, and `Established state / 建立後`; dark nodes must explicitly use inverse text tokens for both labels and body copy.
- Ownership cards explain decision boundaries: candidate-led work, co-decisions, and specialist inputs integrated into the product decision. They must not read as a list of other people's responsibilities.
- All Traditional Chinese copy passes through the canonical public-copy normalizer, which removes accidental CJK spacing, isolated stray letters, and deprecated first-person section labels before rendering.
- A journey-stage case does not repeat the parent decision filter. Its first viewport shows only the stage transformation title, one compact delivery-status chip, and a two-part Customer breakpoint → System response summary.
- The opening signal grid uses one shared renderer for every professional parent and child case. Paired fields keep equal columns and natural height; a field spans only when its content model explicitly requires a full-width row.
- Role, action, scale and outcome belong in At a glance. Why it mattered and Business impact follow it before the Info Grid. Why it mattered contains business urgency only; Business impact contains the system-level value only.
- Wide desktop uses an evidence-led two-column view: overview on the left and Key Intervention Map in the former media frame on the right. At 1400px and below the two regions stack only when their text measure requires it; at 700px and below, paired signal cards become one column.
- Deep decisions follow one scan order: decision title, outcome, rationale, then an essential trade-off only when the content SSOT contains a real and decision-relevant constraint. Never invent or require a trade-off to satisfy a template.
- Canonical project decisions resolve through `projectDecisionRefs` and `decisionRegistry`; project-local legacy arrays are fallback input only. Decision ownership is rendered as Led by me, Co-led, or Co-decided when the approved registry supplies that boundary.
- Popup section rhythm uses the shared title-to-subtitle and subtitle-to-content component tokens. Page-level margins must not redefine this vertical hierarchy.
- Popup typography uses the shared semantic page-title, section-title, subsection-title, body, meta, eyebrow, and outcome-metric roles plus their semantic text-colour roles. HTML heading level controls structure only; individual renderers must not introduce a parallel visual scale or primitive text colour.
- Decision fields use subtle semantic information surfaces rather than decorative divider lines.
- Professional project evidence is placed beside the claim it proves; a detached project-wide image gallery is prohibited. Gallery controls remain available only for experiments and bounded initiative demonstrations.
- Decision visuals reuse the gallery artifact renderer; no duplicate image asset or alternate content owner is permitted.
- Navigation controls retain the shared minimum control height at every viewport.
- Natural phrase wrapping is required. Forced mid-word breaking and page-level overflow fixes are prohibited.
- Adjacent evidence sections use the semantic neutral/accent evidence surfaces to remain distinct without divider lines. Brand character comes from the controlled surface rhythm, organic radii, and cyan/coral accents rather than arbitrary offsets.
- Related-work cards use one token-owned media height per breakpoint and keep every CTA at the card's bottom edge, regardless of title length.
- The programme journey is the single child navigator: five named case cards support desktop comparison and a touch-friendly single-column sequence on smaller viewports.
- Programme stage cards use one causal hierarchy: stage identity in the first column, breakpoint and design decision in the evidence column, then the programme proof directly beneath that evidence. A child-case action stays in normal flow, remains one line where space permits, and becomes a full-width touch target at 430px.
- Programme stage cards explicitly opt out of the global body-copy measure applied to list items. Their border, two-column grid and focus surface must occupy the same full row without internal horizontal overflow.
- Stage detail names its position in the same five-stage taxonomy without rendering a progress bar or repeating parent-level At a glance, business context, impact, decisions, or gallery content. Empty or missing image placeholders are never rendered.
- Programme content follows one evidence-to-decision scan path: evidence signals and resulting priorities, five stage cases, an accessible four-view system-evidence gallery, explicit cross-functional use, delivery maturity, then accountability.
- A stage proof uses the same project-card hierarchy whether or not a deep case is available: work label, project title, problem addressed, reusable result/system outcome, and availability/action. Avoid the abstract label “Capability added”. Only approved child cases receive an active CTA.
- The system-evidence gallery uses one tablist and one panel, supports click plus Left/Right Arrow keys, and never presents abstract diagrams as shipped product screenshots.
- The system-evidence panel reserves one token-owned desktop/tablet block height across all four tabs, so switching evidence never moves the following section. Mobile returns to natural height.
- Deep-dive initiatives reuse the canonical Design Decision card and scan order: Problem to solve → What I decided → Why this choice → one optional factual constraint → ownership → delivery boundary. Do not create a parallel initiative-card hierarchy. Until a public derivative exists, omit the media region instead of showing a decorative pseudo-screenshot.
- The Voucher Center validation path is an explicitly approved temporary exception: its two registered but unavailable public-derivative slots render clearly labelled, non-evidentiary placeholders until the canonical Asset Manifest exposes production URLs. These placeholders must never be described as shipped-product proof.
- The validation path keeps one causal sequence at every viewport: Flash Voucher pilot → sponsor-conversation evidence → Voucher Center product foundation → carry-forward mapping. It never renders the legacy Product Evolution section in parallel.
- Cross-functional impact cards must name the team, decision context, what the team can now do, and the repeated work or ambiguity removed. A role plus a generic verb is not sufficient evidence.
- The Key Intervention Map owns the former project media frame and keeps Before → Intervention → After as one uninterrupted visual proof. The visual flow contains no section heading above it. The semantic section heading sits below the visual, directly above its supporting copy, so reviewers first see the system change and then read its interpretation. It belongs to Overview and never creates a duplicate navigator destination. Definition lists stack when a split label/value grid would force short phrases into narrow columns.
- Structured case-evidence sections render only public semantic fields: one claim-led intro, metric pairs, capability groups and an optional public delivery boundary. Authoring reasons, completeness notes, asset instructions and other internal metadata are never flattened into public cards.
- Executive-summary data must not repeat the opening decision filter. Structured system-evidence items render as labelled Before → After rows; they must never be flattened into detached text pills.
- Before/after comparison blocks share equal width, padding, label baseline and body line-height.
- Parallel accountability cards share label, heading and body rows so both columns begin on the same baselines.
- Delivery maturity must explicitly distinguish delivered foundations, capabilities proven only in selected cases, and future direction that is not claimed as shipped.
- `Validated outcomes`, `Shipped outcomes`, `Delivery proof`, and `Delivery & measurement` resolve into one `Delivery & outcomes` evidence section. It presents delivery status first, then publicly supportable outcome evidence and a measurement boundary; duplicate standalone outcome sections are forbidden.
- Delivery cards share one hierarchy: evidence type, prominent metric or concise outcome, then attribution boundary. They use equal padding and spacing and never mix display-size prose with body copy.
- Embedded prototypes replace an indefinite spinner with a localized delayed-load state after 12 seconds; the experience remains sandboxed and never links reviewers to an editable source file.
- Verified numbers in Delivery & outcomes use the semantic outcome-metric role whether they appear at the start or inside an approved evidence statement. Arabic values and Chinese quantity phrases render value first, the complete evidence statement second, and attribution or source last. Multi-metric evidence stays grouped inside one evidence-tier card; qualitative outcomes remain readable statements and are never forced into a numeric template.
- The r83 `outcomeEvidenceModel` is the preferred evidence source. Tier A product outcomes, Tier B behavioural evidence, and Tier C shipped adoption must remain distinguishable; research scale and delivery output cannot be relabelled as product outcome.
- Research-scale evidence uses one restrained section surface with one white container per metric. Delivery and outcome evidence uses the same two-column evidence rhythm, semantic label style, body size, weight and spacing; all-caps source headings are normalised for readable display without changing SSOT.
- Ownership input is normalised before rendering. Primitive strings are single items rather than character arrays; empty `I led`, `Partnered on`, `Design leadership`, and `What made this hard` containers are omitted.
- The r83 ownership model uses three explicit columns when data exists: Led by me, Co-decided, and Partner-owned inputs. Its approved public summary replaces generic collaboration copy.
- Research-scale headings span the full section width. Desktop keeps a short approved title on one line; narrow screens may wrap by phrase but never into a word-per-line side column.
- Programme ownership uses only two responsibility levels: accountable outcome and shared decisions. Ambiguous `co-led` and team-only `partnered with` lists are not rendered.
- Professional projects read their approved order from `publicContent.sectionOrder`. `PROJECT_SECTION_REGISTRY` maps shared overview, decision, ownership, related-work, and project-specific public sections to the existing dialog shell; missing sections are omitted without placeholders.
- Confidentiality is rendered only from the project's approved `confidentialityNote` and sits directly below At a glance as supporting text.
- Child-case journey breakpoints use one causal reading line: stage → breakdown → design implication. Breakdown and implication share the evidence column instead of becoming competing narrow columns, and the row becomes one column on mobile.
- Programme entry controls reuse the Work interaction contract, stay visible without hover, preserve a complete focus ring, and keep title plus action on one compact row on mobile.
