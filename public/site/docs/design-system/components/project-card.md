# Component: ProjectCard

Status: Live / Current production mockup

HTML Source: Homepage dynamic renderer and Work page cards
CSS Owner: `assets/css/components/project-card.css`
Token Dependencies: card padding, project card media block, control height, surface, elevation
Variants: Homepage, Work, Search, Domain, Related
Usage Scope: Homepage, Work, Matcher, Domain, Detail popup
Allowed Modifications: content fields, representative visual, variant extension
Forbidden Modifications: hover outlines, page-level spacing overrides, multiple nested links
Accessibility: whole-card target, pointer cursor, focus-visible, pressed state, concise accessible label
Responsive Contract: every repeated card family owns an explicit grid/flex structure; paired cards share an action baseline; media height is token-owned at desktop and mobile sizes; CTA alignment never depends on an unrelated outer layout.
Media Contract: every listing-card media slot renders one stable 16:9 visible frame. Source dimensions never set card height. Images use the shared containment and centered safe-area treatment, shared radius, overflow, surface and fallback behavior. Recommended future source size is 1920 × 1080; minimum acceptable source size is 1600 × 900. Tall or narrow interface captures remain inside this frame without a project-specific wrapper.
Related Work Contract: every related-work variant uses `--project-card-related-title` and a wider text measure, so mixed Chinese/English titles remain readable without arbitrary word breaking.
Related Work Content Contract: compact related cards use the canonical `cardTitle`, not the full case-study transformation title. Company is the only supporting metadata; redundant Domain copy is omitted. Title is the primary scan target and the shared View case CTA is the final row; decorative process headers are omitted.
Work Variant Contract: featured cards use the full media token, horizontal desktop composition, and company plus Domain context. Compact cards use the compact media row, company-only metadata, explicitly reset the general media minimum height, and begin content after a visible boundary; visual content must never overflow into company, title, summary, or CTA. Compact typography is a complete semantic tier rather than a scaled copy of the featured card: 22–26px transformation title, 14px supporting copy, and 14px action on desktop, with readable responsive sizing on narrow screens. Company names are indivisible metadata: they keep max-content width and never wrap in Work, Search, Domain, or Related work cards.
Work Hierarchy Contract: `workIndex.principalPortfolioArchitecture.featuredOrder` supplies one primary featured project and four supporting compact projects. Every remaining project is rendered through the same ProjectCard owner under More work.
Domain Variant Contract: company name is an independent high-emphasis text identifier; domain and product context remain on the same metadata row and must not be mistaken for the company.
Work Interaction Contract: homepage, Work page, Profile timeline, search, domain and related Work cards use the shared `--work-card-hover-*` tokens. Hover is a restrained lift, organic radius, visible border and cyan shadow; the CTA underlines. Do not introduce page-specific Work hover surfaces.
Experiment Variant Contract: Experiments may carry less copy and the `View exploration` label, but reuse the ProjectCard geometry, border/radius family, spacing rhythm, title family, CTA alignment and 16:9 media contract. A second shell or experiment-owned media ratio is forbidden.
Search Variant Contract: text-first compact card; context, transformation title, one relevance statement, and one action only. It must not inherit Domain visual, single-card split layout, or multi-row metadata.
