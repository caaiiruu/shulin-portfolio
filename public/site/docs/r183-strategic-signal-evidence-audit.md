# R183 Strategic Signal and Evidence Audit

Internal editorial control artefact. This file is not a recruiter-facing content owner. Canonical public copy remains in `portfolio-content.json`.

## Strategic signal audit

| Project | Input | Reframe | Representation | Decision | Experience | Signature move |
|---|---|---|---|---|---|---|
| Voucher | Campaigns and channels expressed qualification, participation and redemption differently. | The problem was incentive behaviour, not a set of Voucher screens. | Qualification, activation, redemption and post-use rules. | Which behaviour should be shared, channel-specific, validated or deferred. | Reusable discovery, eligibility, participation, recovery and review states. | Turned Voucher rules into a reusable incentive behaviour model spanning qualification, activation and redemption. |
| Payment | App entry, cashier/SCO execution, loyalty value and recovery could diverge across one purchase. | Payment was a new cross-channel transaction product whose state had to survive success, failure and recovery. | Transaction stages, handoffs, value visibility and recoverable state. | How App, checkout, confirmation and recovery should behave as one product. | A 0→1 payment product with visible value, checkout continuity and return recovery. | Defined a new cross-channel payment product around transaction continuity, including success, failure and recovery. |
| DBS | Six markets used different reports, authority checks and local workarounds for credit exceptions. | The design question was which market variation was necessary and which could use one exception model. | End-of-day vs real-time contexts, role rights, case state and approval paths. | What should vary by context or market and what should remain common. | Role-based workbenches and traceable cross-market exception handling. | Separated meaningful market variation from variation the product could absorb into a common exception model. |
| Booking Connected Trip | Travellers compared ride options, repeated known trip data and faced market-specific pickup uncertainty. | Behavioural evidence could determine when known trip context should change the next action. | Ride mix, edit behaviour, itinerary context and pickup constraints. | What to compare, what data to reuse and where guidance must remain market-specific. | Comparable ride options, confirm/edit behaviour and traveller-native pickup guidance. | Used behavioural signals to decide where known trip context should change the product’s next action. |
| Game Center | One featured-game entry could not support growing inventory, concurrent sponsors or visible lifecycle state. | The product needed discovery and configuration structure, not another campaign page. | Inventory, game state, task/reward relationship and operator controls. | What the first reusable release needed and what could be deferred. | Multi-game discovery, configurable listings and lifecycle-aware behaviour. | Recognised that growing game inventory required a discovery and configuration model, not another campaign page. |
| Taishin P2P | Payment alone did not define buyer/seller responsibility across fulfilment, logistics and exceptions. | The core design problem was multi-party transaction governance. | Participant roles, transaction state, functional rules and ownership handoffs. | Who could act, what each action changed and who owned delivery decisions. | A marketplace model connecting buyer, seller, client and vendor responsibilities. | Made multi-party transaction responsibility explicit before defining the marketplace experience. |
| Cathay Review | Interface symptoms, system dependencies and operating handoffs competed for one remediation scope. | Remediation needed operating-cause diagnosis before screen work. | Roles, systems, exception paths, benefit/feasibility and phased dependencies. | Which issues needed interface change, operating change or later investment. | Prioritised near-, mid- and long-term remediation recommendations. | Separated interface symptoms from operating causes so remediation investment could be prioritised. |
| CTBC Mortgage | Applicants entered with different readiness, paused for documents and involved related parties at different times. | Application state—not screen sequence—was the product model. | Product boundary, entry readiness, persistent state and participant contribution. | How entry, resume, related-party work and post-submission behaviour should connect. | A staged, resumable and multi-party mortgage application model. | Defined the product model before designing the mortgage application screens. |
| Booking Taxi | An existing taxi proposition had uncertain traveller value, supplier feasibility and market readiness. | The question was where the proposition was worth improving and testing, not whether to create a new product. | Traveller context, supply readiness, proposition comparison and pre-mortem risks. | Which proposition attributes and markets justified a bounded experiment. | A lower-risk experiment and investment direction for the existing taxi experience. | Turned traveller, supply and proposition differences into criteria for deciding where the existing taxi experience was worth improving and testing. |

## Principal signal coverage

| Capability | Primary carrier | Secondary carrier | Gap / boundary |
|---|---|---|---|
| 0→1 product definition | Payment; CTBC | Game Center | Booking Taxi is explicitly excluded. |
| Platform / system thinking | Voucher; Payment | DBS; Game Center; Taishin | No need for every case to use platform language. |
| Multi-market reasoning | DBS | Booking; Booking Taxi | Taxi evidence supports comparison, not a verified selected market outcome. |
| Operational reasoning | Cathay Review; Payment | Voucher; Taishin; DBS | Implementation outcomes remain bounded in consulting cases. |
| Remediation | Cathay Review | Payment recovery | Do not recast other projects as remediation. |
| Product strategy | Booking Taxi | Voucher; Booking | Recommendation outcome only for Booking Taxi. |
| Research synthesis | Booking; Voucher | DBS; Payment; Cathay; Taishin | Methods are not seniority proof without a decision consequence. |
| Decision framing | Booking Taxi; DBS | Voucher; Cathay; Payment | Avoid generic alignment language. |
| Product model definition | CTBC; Payment | Game Center; Taishin | CTBC launch remains unverified. |
| Cross-functional delivery | Payment | Voucher; Taishin; DBS | Preserve partner-owned implementation boundaries. |
| Measurable shipped impact | Payment; Voucher; Booking | Game Center | Do not contaminate Taxi, Taishin, Cathay or CTBC with these metrics. |
| Experimentation | Booking; Booking Taxi | Voucher; Game Center | Booking Taxi proves framing, not experiment results. |
| Design quality leadership | Profile; Booking | Voucher; Payment | Evidence is critique/specification practice, not title inflation. |
| Visual / creative craft | Product expression across Payment, Voucher and Booking | Game Center; CTBC | No decorative asset work authorised in R183. |

## Recruiter-facing Evidence audit

Scores use Relevance, Interpretability, Decision linkage, Authenticity and Information density (0–2 each). Total is `/10`.

| Project | Evidence | Role | R | I | DL | A | D | /10 | Leverage | What changed because it existed |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| Voucher | Current-system map | Synthesis | 2 | 2 | 2 | 2 | 2 | 10 | High | Identified rules that needed reusable ownership. |
| Voucher | Workshop hypotheses | Framing | 2 | 2 | 2 | 2 | 2 | 10 | High | Created initial principles while retaining an exploratory-taxonomy boundary. |
| Voucher | Validation and revision | Validation | 2 | 2 | 2 | 2 | 2 | 10 | High | Determined which hypotheses shipped and which remained deferred. |
| Voucher | Hypothesis → validated model | Synthesis | 2 | 2 | 2 | 2 | 2 | 10 | High | Prevented early definitions from becoming the final operating taxonomy. |
| Voucher | Contextual discovery | Experience | 2 | 2 | 2 | 2 | 2 | 10 | High | Moved eligible value into the product-shopping context. |
| Voucher | Eligibility rules | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Defined qualification before commitment. |
| Voucher | Mechanic-specific participation | Experience | 2 | 2 | 2 | 2 | 2 | 10 | High | Replaced one generic collection action with behaviour by incentive mechanic. |
| Voucher | Redemption recovery | Experience | 2 | 2 | 2 | 2 | 2 | 10 | High | Made application and recovery states explicit. |
| Voucher | Payment review state | Experience | 2 | 2 | 2 | 2 | 1 | 9 | Medium | Confirmed selected Voucher value while preserving the post-use claim boundary. |
| Payment | Checkout compression | Outcome | 2 | 2 | 2 | 2 | 2 | 10 | High | Proved the transaction was compressed from 19.78s to 7.29s. |
| Payment | Live checkout fieldwork | Discovery | 2 | 2 | 2 | 2 | 2 | 10 | High | Made assurance and time pressure product requirements. |
| Payment | Journey synthesis | Synthesis | 2 | 2 | 2 | 2 | 2 | 10 | High | Defined continuity across loyalty, checkout and recovery. |
| Payment | SCO validation | Validation | 2 | 2 | 2 | 2 | 2 | 10 | High | Validated entry recognition and QR handoff language. |
| Payment | Value visibility | Experience | 2 | 2 | 2 | 2 | 2 | 10 | High | Kept LinkPoints, discounts and payable value legible inside payment. |
| Payment | Return recovery | Experience | 2 | 2 | 2 | 2 | 2 | 10 | High | Moved return initiation into the payment record. |
| Payment | Shopper Voice | Discovery | 2 | 2 | 1 | 2 | 1 | 8 | Medium | Grounded the value of one-app and shorter-payment behaviour in real voice. |
| Payment | Award | Recognition | 2 | 2 | 1 | 2 | 1 | 8 | Medium | Proved team recognition, not individual ownership. |
| DBS | Separate operating contexts | Synthesis | 2 | 2 | 2 | 2 | 2 | 10 | High | Separated necessary context variation from the common model. |
| DBS | Highest-risk friction | Framing | 2 | 2 | 2 | 2 | 2 | 10 | High | Focused investment on system-level exceptions. |
| DBS | Validate before standardising | Validation | 2 | 2 | 2 | 2 | 2 | 10 | High | Tested decision context before six-market standardisation. |
| Booking | Journey uncertainty curve | Framing | 2 | 2 | 2 | 2 | 2 | 10 | High | Extended design attention beyond checkout. |
| Booking | Workshop criteria | Synthesis | 2 | 1 | 1 | 2 | 1 | 7 | Medium | Connected customer, product and implementation criteria. |
| Booking | Feedback synthesis | Framing | 2 | 2 | 2 | 2 | 2 | 10 | High | Prioritised comparison and navigation. |
| Booking | Ride mix | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Shaped option comparison and hierarchy. |
| Booking | Edit Trip behaviour | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Supported confirm/edit instead of repeated entry. |
| Booking | Baggage and pickup context | Experience | 2 | 2 | 2 | 2 | 2 | 10 | High | Turned supplier constraints into traveller-native guidance. |
| Game Center | Single-game constraint | Framing | 2 | 2 | 2 | 2 | 2 | 10 | High | Reframed the brief as reusable multi-game discovery. |
| Game Center | Task/reward model | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Defined shared effort, completion and reward behaviour. |
| Game Center | Concurrent operations model | Delivery | 2 | 2 | 2 | 2 | 2 | 10 | High | Enabled multiple campaigns without a front-end release for each change. |
| Game Center | ~50% completion | Outcome | 2 | 2 | 1 | 2 | 1 | 8 | Medium | Proved shipped completion; it did not cause earlier decisions. |
| Taishin | Buyer/seller synthesis | Synthesis | 2 | 2 | 2 | 2 | 2 | 10 | High | Defined participant responsibility. |
| Taishin | Transaction regulation | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Unified payment, logistics, notifications and exception states. |
| Taishin | Marketplace structure | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Connected participant actions to state-changing functions. |
| Taishin | Wireframe specification | Delivery | 2 | 2 | 1 | 2 | 2 | 9 | Medium | Preserved functional and edge-case rules for implementation. |
| Taishin | Client/vendor clarification | Delivery | 2 | 2 | 2 | 2 | 1 | 9 | High | Resolved ownership and rule gaps before handoff. |
| Cathay Review | Research coverage | Discovery | 2 | 2 | 2 | 2 | 1 | 9 | High | Separated recurring operating causes from isolated symptoms. |
| Cathay Review | Operating model | Synthesis | 2 | 2 | 2 | 2 | 2 | 10 | High | Exposed operating dependencies behind interface friction. |
| Cathay Review | Benefit/feasibility | Framing | 2 | 2 | 2 | 2 | 2 | 10 | High | Created a defensible remediation priority. |
| Cathay Review | Phased direction | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Separated immediate interface work from later operating investment. |
| CTBC | Entry readiness | Framing | 2 | 2 | 2 | 2 | 2 | 10 | High | Defined the state-driven entry model. |
| CTBC | Interruption | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Made persistent progress and resume behaviour core product logic. |
| CTBC | Related applicants | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Defined coordinated multi-party completion. |
| Booking Taxi | Traveller context | Synthesis | 2 | 2 | 2 | 2 | 2 | 10 | High | Identified where the existing proposition warranted improvement. |
| Booking Taxi | Supply readiness | Framing | 2 | 1 | 2 | 2 | 1 | 8 | High | Bound the recommendation to supportable markets; exact criteria remain source-limited. |
| Booking Taxi | Proposition comparison | Decision | 2 | 2 | 2 | 2 | 2 | 10 | High | Identified proposition attributes worth testing. |
| Booking Taxi | Pre-mortem | Framing | 2 | 2 | 2 | 2 | 2 | 10 | High | Shaped a bounded experiment direction without claiming a result. |

## Claim and classification controls

- Payment is a true 0→1 transaction product and remains a `Transaction System` in the controlled Info Grid taxonomy.
- Booking Taxi is an optimisation and experiment-framing case inside an existing taxi product. It is not 0→1; its controlled Type is `Transaction System`.
- Taishin delivery counts are scale indicators, not launch, adoption, revenue or seniority proof.
- Voucher workshop taxonomy is exploratory; later operating rules are the validated model. Flash Voucher Phase 2 remains deferred, not rejected.
- Payment and Voucher asset IDs, order, crops, hashes and media hierarchy are outside R183 mutation scope.
