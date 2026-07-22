# SHULIN PORTFOLIO DESIGN SYSTEM — CANONICAL LOCKED VERSION

Version: 16.1 — v43 consolidated revision
Status: **Canonical / Locked / Supersedes all previous design.md files**  
Last updated: 2026-07-17

---

# 0. NON-NEGOTIABLE STATUS

This file is the only valid visual, interaction, content, and implementation source for the portfolio website.

It explicitly supersedes:

- All earlier `design.md` versions
- Warm-cream portfolio directions
- Generic SaaS landing-page layouts
- Generic node-and-line hero diagrams
- Card-grid-first homepage structures
- Full-width proof metric walls
- Separate “Solutions” page as a primary navigation model
- Any version where Search appears before Selected Work
- Any version where Domain Experience is rendered as a generic tab component
- Any version where Project Details is only a generic modal summary
- Any version that reduces the reference-led visual language into ordinary UI components

When another file, memory, prior prompt, current code, or generated output conflicts with this file:

> **This file wins.**

Do not merge old and new visual systems.

---

# 1. PRIMARY GOAL

The portfolio must help a world-class recruiter or hiring manager answer, within seconds:

1. Who is Shulin?
2. What level of product designer is she?
3. What difficult product problems can she solve?
4. Which real projects prove it?
5. What did she personally own?
6. What decisions did she make?
7. What changed because of the work?
8. Is her experience relevant to this role?

The site must feel:

- Authored
- Editorial
- Precise
- Human
- High-end
- Professional
- Immersive
- Distinctive
- Evidence-led
- Not AI-generated

The website is not a visual experiment at the expense of recruitment clarity.

The website is not a generic recruiter dashboard at the expense of personal identity.

Required balance:

- 70% recruitment clarity
- 20% immersive evidence narrative
- 10% crafted surprise

---

# 2. SOURCE-OF-TRUTH HIERARCHY

Use this order when rules conflict:

1. Verified project evidence and recruiter comprehension
2. Explicit current user instruction
3. Component / token / usage registry
4. Approved Figma node for the current breakpoint
5. This canonical `design.md`
6. Existing production implementation
7. External references
8. Trends or AI suggestions

Important:

> Figma defines intended visual appearance.  
> Registry defines implementation ownership.  
> Neither may bypass the other.

If a Figma node, component owner, token dependency, or source is unknown:

> STOP → AUDIT → VERIFY → THEN IMPLEMENT.

Never guess.

---

# 3. THE DESIGN THESIS

## Reference-led Editorial Product Portfolio

The site combines:

- Bold editorial typography
- White visual space
- Asymmetrical composition
- Hand-crafted visual language
- Product-grade interaction
- Real evidence
- Narrative continuity
- Clear recruiter scanning

Core statement:

> **Turn confusion into clear systems.**

This is both:

- The positioning statement
- The visual metaphor
- The site narrative
- The interaction logic

The portfolio journey is:

> Ambiguity → framing → decision → system → evidence → impact

The design must visibly demonstrate this transformation.

---

# 4. VISUAL IDENTITY

## 4.1 Global Background

The canonical page background is:

```css
--color-page: #FFFFFF;
```

Do not use warm cream, beige, ivory, paper yellow, or AI-template beige as the global body background.

Allowed local surfaces:

```css
--color-surface: #FFFFFF;
--color-surface-soft: #F7F9FA;
--color-cyan-soft: #EAF4F7;
--color-coral-soft: #FFF0EF;
--color-dark: #222222;
```

Rules:

- 80–92% of normal homepage viewports remain white.
- Local color fields may support one chapter.
- Local fields must not create repetitive full-width rectangular sections.
- Project media may retain authentic project colors.
- No global paper texture or film grain.
- No large blurred gradients.

## 4.2 Signature Colors

```css
--color-ink: #222222;
--color-ink-soft: #55585B;
--color-muted: #687176;
--color-line: #DCE2E5;

--color-cyan: #4FA7BC;
--color-cyan-dark: #2F7F92;
--color-cyan-soft: #EAF4F7;

--color-coral: #FF575D;
--color-coral-dark: #C83D43;
--color-coral-soft: #FFF0EF;
--color-skin-coral: #F48A84;
```

Semantic ownership:

- Near-black = authority, content, main structure
- Cyan = system, connection, interaction, logic
- Coral = human judgment, transformation, active insight
- White = clarity, space, confidence

Coral usage:

- Maximum one dominant coral phrase per major viewport
- Never color random words
- Never use coral as the default button color
- Use coral for the transformation moment or important human decision

## 4.3 Typography

Use one confident sans-serif system.

```css
--font-display:
  "Manrope",
  "Inter",
  "Noto Sans TC",
  "PingFang TC",
  sans-serif;

--font-body:
  "Inter",
  "Noto Sans TC",
  "PingFang TC",
  sans-serif;
```

Satoshi is optional only when properly licensed.

Typography identity comes from:

- Scale
- Weight
- Art-directed line breaks
- Negative space
- Selective italic emphasis
- Asymmetrical placement

Do not add a serif merely to appear editorial.

## 4.4 The Hand

The hand is the central recurring personal object.

It represents:

- Human judgment
- Synthesis
- Selection
- Responsibility
- Direction
- Turning fragmented inputs into a clear system

Allowed states:

- Open = receiving
- Pinching = selecting
- Closing = synthesizing
- Pointing = directing
- Releasing ordered lines = clarifying

Rules:

- Use only where it has narrative meaning.
- Do not repeat as background decoration.
- Keep flat cyan / coral color.
- Use authored, slightly imperfect outlines.
- Maintain believable anatomy.
- No glossy 3D.
- No generic AI character illustration.

## 4.5 Directional Lines

Directional lines represent information becoming aligned.

Rules:

- Hero uses 3–5 lines.
- Lines may begin irregular and settle into one direction.
- Thin stroke: 1–1.5px desktop.
- Elsewhere use only when connecting meaningful content.
- Do not use repeated dotted lines as decorative section separators.
- Do not use random scribbles.

---

# 5. REFERENCE TRANSLATION MATRIX

External references are not decorative inspiration. Each has a defined purpose.

| Reference | Adopt | Apply To | Do Not Copy |
|---|---|---|---|
| Remote Rituals | Content becomes the immersive environment; long-page direction; one scene per chapter | Flagship case studies | Time-of-day theme, fake desktop tools, exact layouts |
| ETOHA LAB | Left selector + right focused content stage; large chapter contrast | Domain Experience | Blue brand field, original artwork, exact service navigation |
| Izumi Tanaka | Quiet profile, restrained index, one authored animation | Profile, About | Excessive emptiness that removes recruitment information |
| andonuts | Serious content + hand-crafted marks; editorial long-page rhythm | Principles, chapter transitions | Identifiable compositions or illustrations |
| UPVEGE | Motion expresses brand meaning | Hero, footer, selected transitions | Nature-brand visual identity |
| poporpop | Soft personality and playful shape | Playground only | Cute style across professional work |
| Tashi | Recurring authored object and personal craft | Profile, experiments | Illustration replacing product evidence |
| Tsumari Chamame | Large whitespace, tactile restraint, photography rhythm | Quiet transitions, selected artifact moments | Food / agriculture brand treatment |
| e-Nisshin | Clear explanation of complex services via pictograms and structure | Domain diagrams, service logic | Corporate service-page duplication |
| yama-beer | One art direction across copy, photography, illustration and motion | Whole-site consistency | Product-brand visual theme |

Implementation rule:

> Every expressive section must identify which reference principle it translates.

Do not use vague terms such as “Japanese style” without a concrete source behavior.

---

# 6. ANTI-AI VISUAL RULES

Forbidden:

- Warm AI beige background
- Blue-purple gradients
- Glowing orbs
- Neural-network visuals
- Black-center radial node diagrams
- Generic ecosystem circles
- Glassmorphism
- Floating translucent cards
- Gradient text
- Giant pastel blobs behind normal content
- Every section inside rounded cards
- Every item inside a pill
- Generic AI illustration
- Symmetrical three-card SaaS rows everywhere
- “Evidence, not just outcomes” style abstract claims without immediate evidence
- Generic “People / Systems / Outcome” hero nodes
- Large metric grids used as the first proof of seniority
- Decorative motion without content meaning

Acceptance check for any visual element:

1. Does it show real information?
2. Does it explain a relationship?
3. Does it reinforce the personal signature?
4. Would the content remain understandable without it?
5. Does it feel authored instead of generated?

If the first three answers are no, remove it.

---

# 7. CANONICAL HOMEPAGE INFORMATION ARCHITECTURE

The homepage order is locked:

1. Header
2. Hero
3. Experience Signals
4. Selected Work
5. Challenge Matcher
6. Domain Experience
7. How I Make Decisions
8. Playground teaser
9. Compact Contact Footer

Profile is a separate complete page and is not repeated as a homepage chapter.

Search never appears before Selected Work.

Do not add a large proof wall, organisation dashboard, generic service grid, or separate Solutions page.

## 7.1 Header

Primary visible destinations:

- Work
- Playground
- Profile
- Language

Rules:

- Work, Playground, and Profile are complete pages.
- Domain Experience remains a homepage chapter unless a complete Domain page is intentionally created later.
- Resume and availability belong in Profile, not Hero.
- Contact may be reached through Profile and the compact footer.
- A hamburger may consolidate secondary navigation on compact widths.
- Do not duplicate the same destination in both a full visible navigation row and an unnecessary second menu.
- Mobile menu supports Escape, outside click, focus return, and clear current-page state.
- No separate `Solutions` navigation item.

## 7.2 Hero

Required:

- Immediate positioning
- One clear transformation statement
- Primary action: `View selected work`
- Secondary action: `Find relevant experience`
- No Resume action
- No Availability chip
- No generic capability-chip row

Recommended positioning:

> Product Designer for complex systems, 0→1 products, and AI-assisted workflows.

The word `AI` must not dominate the positioning. AI is one capability context, not the entire professional identity.

Supporting copy maximum: 2 lines desktop.

The hand / cloud animation may be added separately. Content and layout must remain complete without it.

## 7.3 Experience Signals

Purpose:

- Establish seniority, scale, and organisational credibility in one fast scan.

Use verified signals only:

- `10+ years` — Product design
- `40+ countries` — Booking.com global rollout readiness
- `6 countries` — DBS cross-country internal operations
- `40+ initiatives` — Products, systems, and workflows

DBS wording must make clear that the users were internal teams across six country operations, not consumers in six external markets.

Presentation rules:

- Show the numbers directly.
- Do not reserve a large editorial column to explain why metrics are shown.
- Follow with one quiet organisation line.
- Company names display in the active site language only.
- Organisation names are not interactive unless a real destination exists.
- Do not imply endorsement or current affiliation.

## 7.4 Selected Work

Homepage priority order:

1. Voucher Incentive Ecosystem
2. DBS Exception Management
3. Booking.com Global Rollout
4. Project Hours Tracker as supporting work

Bandzo appears on Work and within Learning Platforms evidence.

AI experiments remain visually smaller than verified professional work.

Canonical homepage composition:

- One large flagship card
- Two smaller 4:3 supporting cards
- Additional work is reached through Work

Each Homepage or Work project card shows:

- Transformation title
- Product / project context
- Role
- Scale
- Outcome

Do not show unexplained labels such as:

- Owned
- Decision
- Evidence
- Artifact

The entire visible card is one target.

Visible action:

> `View case ↗`

Do not provide separate `Quick preview` and `Full case` actions. The Project Details popup itself begins with a quick decision view and continues into the full case.

## 7.5 Challenge Matcher

Purpose:

- Help a recruiter find relevant experience by problem.
- Return a concise recommendation, not a generic category page.

Default state:

- Query and prompt are centred.
- No suggestion is preselected.
- Result panel is absent from layout.

First successful search in a browser session:

- Query panel moves left once.
- Result appears on the right.

Later searches in the same session:

- Query remains left.
- Only result content updates.

New browser session:

- Returns to the centred default.

Desktop scrolling:

- Entire page uses normal vertical flow.
- Query panel is sticky within the Matcher section.
- Result content determines section height.
- Do not create a nested vertical scroll panel.

Result content:

1. Interpreted problem
2. Recommended direction
3. Why it matters
4. Capabilities to apply
5. Related project cards

Search project cards show:

- Why it fits
- Scale
- `View case ↗`

Search cards are left aligned.

Matching model:

- Bilingual deterministic weighted intent matching
- Exact phrases score higher than individual words
- Exact tokens score higher than partial strings
- Compare all supported intents
- Require a minimum confidence threshold
- Return curated text and verified projects
- Do not generate unsupported project claims

No-match state must provide:

- A clear `No exact public match` message
- Nearby relevant projects
- Work-page route
- Explicit email route

## 7.6 Domain Experience

Purpose:

- Show reusable domain knowledge derived from real projects.
- It is not a second generic project index.

The six current domains are:

1. Financial services
2. Enterprise operations
3. Growth & incentive systems
4. Travel marketplaces
5. Retail & commerce
6. Learning platforms

Learning Platforms remains valid even when supported by one strong project. Bandzo provides evidence of practice guidance, supportive feedback, progression, and app–tablet continuity.

Desktop:

- Compact 2×3 Domain index
- Left selector remains sticky
- Right content stays in normal document flow
- No nested content carousel

Tablet and mobile:

- One visibly labelled native selector: `Choose a domain`
- Selected content follows in normal page flow
- No second navigation rail
- Related project cards may use one horizontal rail
- Diagrams reflow vertically
- No viewport overflow

Domain content order:

1. Domain name
2. One concise conclusion
3. System model
4. Recurring problems
5. Design responses
6. Related projects

Do not display vague labels such as:

- What I learned across projects
- Domain synthesis
- Relevant hiring problems

Use plain, recruiter-readable headings.

Domain project cards show:

- What this proves
- `View case ↗`

## 7.7 How I Make Decisions

Use four principles:

1. **Model the system before the screen.**  
   Define roles, states, rules, ownership, and dependencies before interface structure.

2. **Make decisions, blocked states, and recovery visible.**  
   Surface next actions, exceptions, fallback paths, and consequences so users do not become stuck.

3. **Start from analogous behaviour. Refine through real use.**  
   Study motivation and decision logic behind comparable behaviours, translate them into an initial product model, then improve it through observed use—especially hesitation, failure, and recovery.

4. **Build reusable capabilities, not one-off screens.**  
   Separate product logic from presentation so teams can extend the system without repeatedly reinterpreting the same rules.

Each principle contains:

- Principle
- One concise explanation
- What it changes
- One linked supporting case

Do not repeat the same generic Impact bullets across every principle.

## 7.8 Playground Teaser

Purpose:

- Show curiosity and authored product thinking.
- Never compete with professional work.

Homepage:

- Compact horizontal teaser
- Small visual weight
- Consistent experiment-card anatomy

Experiment cards show:

- Product question
- Current stage
- Current learning
- `View experiment ↗`

## 7.9 Profile Is a Complete Page

Profile is not repeated on the homepage.

Profile first view must show:

- Personal positioning
- Fully remote availability
- Location
- Explicit contact destination
- Role direction
- Transferable strengths

Do not define fit only as `Senior Product Designer`.

Use `Where I add the most value` with four precise strengths:

1. **Clarify ambiguity**  
   Turn incomplete information into a product direction teams can act on.

2. **Untangle exceptions and blocked workflows**  
   Trace edge cases, broken handoffs, stalled states, and unclear processes, then define practical fallback paths that keep users and teams moving.

3. **Align people, rules, and ownership**  
   Connect product, engineering, operations, and business rules without losing responsibility boundaries.

4. **Transfer behavioural insight into 0→1 products**  
   Translate motivation and decision logic from analogous behaviours into an initial product model, then refine it through real use.

Profile also includes:

- Chronological experience and collaborations
- Relationship types: In-house / Direct client / Agency engagement / Independent
- Evidence links
- Scalable Awards and Recognition list
- Resume link in the first-view information area
- Compact Outside Product Work mosaic
- Images, drawing, composition, travel, and diving
- Verified Spotify link where relevant

Do not add a separate oversized Resume card.

## 7.10 Compact Contact Footer

The footer is a thin contact bar, not a second Hero.

Use:

> **Working through a complex product problem?**

Primary action:

> **Email me about it ↗**

Rules:

- No helper paragraph
- No extra microcopy explaining that email will open
- No oversized dark closing chapter
- CTA destination must be explicit


# 8. NARRATIVE SECTION BOUNDARIES

The site must not look like stacked rectangular sections.

Preferred transition methods, in order:

1. Object continues into next chapter
2. Artifact overlaps the next composition
3. Information density changes
4. Typography scale changes
5. Alignment changes
6. Localized atmosphere field
7. White-space pause
8. Color change only when meaningful

Rules:

- No repeated full-width horizontal dividers
- No alternating rectangular backgrounds
- No wave on every section
- No random organic blob used as a separator
- No color change without narrative meaning
- Keep the global page white
- Each transition must answer:
  1. What did the previous chapter leave behind?
  2. What changes?
  3. Why does the next chapter follow?
  4. Does the transition still work without motion?

---

# 9. PROJECT DETAIL — REQUIRED DECISION-FILTER OPENING

Every professional case uses this order.

## 9.1 TITLE

Format:

> From [problem] to [outcome]

Rules:

- Communicate transformation
- Indicate problem space
- Avoid poetic titles without product meaning

## 9.2 PROBLEM TYPE

Maximum 3 tags.

A visible label must identify them as:

> `Problem types`

Use problem-based, domain-recognisable terms.

Examples:

- Operational workflows
- Exception handling
- Risk operations
- Incentive systems
- Global rollout
- Learning journeys

Avoid generic terms such as UX design or product thinking.

## 9.3 AT A GLANCE

Most important summary.

Maximum 2 lines.

Must contain:

- Role
- Problem
- Action
- Scale
- Outcome

No internal acronyms.

## 9.4 ROLE, SCALE, AND KEY DECISION

Present in one clear top-to-bottom scan.

- **Role** = actual project responsibility
- **Scale** = magnitude, such as countries, users, roles, markets, or organisational reach
- **Key decision** = the central product judgment that shaped the system

Do not use a proof or evidence index in the opening.

Do not repeat Scope as Scale.

## 9.5 INFO GRID

Required:

- TYPE
- SCOPE
- AUDIENCE
- TIMELINE

TYPE uses only:

- Internal System
- Incentive System
- Transaction System
- Marketplace Platform
- 0→1 Product

SCOPE describes system coverage, not magnitude.

AUDIENCE format:

> Primary: X  
> Secondary: Y, Z

TIMELINE must use a real duration or a confident confidentiality treatment.

## 9.6 WHY IT MATTERED

Explain:

- Business context
- Urgency
- What was missing or broken

Do not describe the solution or repeat scale.

## 9.7 BUSINESS IMPACT

Explain the business-level change.

Focus on:

- System change
- Scalability
- Consistency
- Dependency reduction
- Operational reliability

Do not repeat the problem, solution, or scale.

## 9.8 CONFIDENTIALITY NOTE

When metrics are abstracted:

> *For confidentiality reasons, exact metrics are not disclosed.*

Keep subtle and confident.


# 10. PROJECT DETAIL — FULL CASE STUDY STRUCTURE

The opening decision filter continues into one scrollable Project Details popup.

Required order:

1. Title and Problem types
2. At a glance
3. Role, Scale, and Key decision
4. Type, Scope, Audience, Timeline
5. Why it mattered
6. Business impact
7. Confidentiality note when required
8. What made this hard
9. Project evidence gallery
10. Key design decisions
11. Team impact
12. My role
13. Delivery and measurement
14. What I would validate next
15. Related cases

## 10.1 What Made This Hard

This section is essential and must not be visually buried.

Place it before Project Evidence and Key Design Decisions.

It explains:

- Roles
- Rules
- Exceptions
- Constraints
- Negative states
- Broken handoffs
- What users or teams did when they became stuck
- What would fail if the problem were simplified incorrectly

Use a strong but restrained challenge treatment.

Coral may mark constraint, risk, or failure.

## 10.2 Project Evidence Gallery

Purpose:

- Show the actual visual proof.
- Do not duplicate a proof index in the opening.

First-launch minimum:

- 3–5 images or representative artifacts
- Individual title and explanation
- Thumbnail or next / previous navigation

Desktop:

- Prefer an approximately 7:3 media-to-caption composition
- Keep the media visually left aligned
- Do not make the gallery full width when it prevents simultaneous reading of explanation

Mobile:

- Stack media and explanation
- Preserve clear image controls
- Avoid nested vertical scrolling

Evidence priority:

1. Real product UI
2. Before / after
3. Workflow
4. Service blueprint
5. State model
6. Research synthesis
7. Decision table
8. Design-system evidence
9. Original explanatory illustration
10. Abstract diagram only when no clearer evidence exists

## 10.3 Key Design Decisions

Every decision includes:

- Decision
- Alternative considered
- Trade-off accepted
- Resulting system behaviour
- Direct link to a supporting visual when available

Do not use vague labels such as:

- Evidence above
- Proof 01
- See image somewhere above

## 10.4 Team Impact

Purpose:

- Show how the work changed decisions or delivery across functions.

May include:

- PM
- Engineering
- Operations
- Business
- Research
- Legal / Compliance

Focus on changed behaviour or decisions, not meeting participation.

## 10.5 My Role

Separate:

- **I led**
- **Partnered on**

`Partnered on` means shared responsibility, not team impact.

Do not use:

- I contributed to
- Collaborated closely
- Owned everything

## 10.6 Delivery and Measurement

Separate verified categories:

- Delivery status
- Measured outcome
- Observed outcome
- Expected outcome
- Measurement method
- Remaining validation

Never present expected impact as measured impact.

## 10.7 Reflection

Use:

> What I would validate next

Keep concise and specific.

## 10.8 Related Cases

Every professional popup ends with:

> Continue exploring

Show 2–3 related cases in a horizontal rail.

The full card is clickable.

Selecting a related case:

- Keeps the popup open
- Replaces the current case
- Returns the popup to the top
- Preserves a clear close action

If the Project popup was opened from a Domain or Search popup, closing returns to the previous popup state.


# 11. PROJECT AND EXPERIMENT DETAILS POPUP

There is one details popup per content type.

Do not create separate destinations for:

- Quick preview
- Full case
- Open details

The first viewport of the popup is the quick decision view. Scrolling continues into the full case.

Required interaction:

- Native or correctly implemented modal semantics
- `aria-modal="true"`
- Visible close button
- Escape close
- Focus trap
- Focus return
- Background scroll lock
- Mobile full-height natural scrolling
- Loading and error states
- Back-step behaviour when a popup was opened from another popup
- Related cases at the bottom

Project popup colour semantics:

- White / soft neutral = primary information and evidence
- Coral = constraints, risk, failure, and negative states
- Cyan = decisions, selected states, learning, and interaction feedback
- Near-black = strongest hierarchy or final outcome only

Do not use multiple coloured blocks merely to divide sections.

Experiment popup sequence:

1. Product question
2. Current stage
3. What I built
4. Prototype evidence
5. What I learned
6. What I would test next
7. Related experiments

Do not present Prototype and Learning as equivalent side-by-side cards.

Experiment visuals may be playful, but patterns must support hierarchy rather than decorate every section.


# 12. EVIDENCE AND MEDIA SYSTEM

Priority order:

1. Real product UI
2. Before / after
3. Workflow
4. Service blueprint
5. State model
6. Research synthesis
7. Decision table
8. Design-system evidence
9. Original explanatory illustration
10. Abstract diagram only if no clearer evidence exists

Every flagship project must show at least one real artifact.

## 12.1 Media Types

### Project Hero Media

- Shows the system or main change
- 16:10, 4:3, or authored full-bleed composition
- Must have caption explaining what the evidence proves

### Before / After

- Clear labels
- Same task or state
- No misleading visual comparison
- Motion optional

### Key-solution Micro-video

- 6–15 seconds
- Muted autoplay only while visible
- Pause control
- Poster image
- No autoplay audio
- Reduced motion uses static poster
- Caption explains the decision, not the animation

### Confidential Artifact

Allowed treatments:

- Partial crop
- Blur sensitive data only
- Rebuild structure using neutral sample content
- Annotated system model
- Interview-only marker

Never fabricate product evidence.

---

# 13. INTERACTION SYSTEM

Every interaction must have a task.

## 13.1 Component State Matrix

All interactive components must define:

- Default
- Hover
- Focus-visible
- Active / pressed
- Selected
- Disabled
- Loading
- Empty
- Error
- Success where applicable

Required coverage:

- Buttons
- Links
- Search
- Suggestion chips
- Work filters
- Domain selector
- Related projects
- Popup
- Media carousel
- Video
- Language toggle
- Mobile menu
- Marquee control

## 13.2 Mouse Feedback

Allowed labels:

- Preview
- Read
- Open
- Select
- Explore

Rules:

- Desktop precise pointer only
- Small and quiet
- `pointer-events: none`
- Never replace native cursor
- Hidden on touch
- Hidden in reduced motion
- Hidden whenever popup or mobile menu is open

## 13.3 Micro-animation

Allowed:

- Hero lines align
- `clear` resolves
- Artifact subtle pointer tilt
- Button 1–2px movement
- Project evidence crop shift
- Domain detail transition
- Experiment poster lift
- Scroll reveal once
- Popup open / close

Forbidden:

- Continuous floating
- Generic fade-up everywhere
- Scroll-jacking
- Cursor-following blob
- Large 3D card rotation
- Parallax behind long text
- Animated background on every chapter

## 13.4 Motion Density

Per viewport:

- Maximum 1 narrative motion
- Maximum 2 simultaneous functional micro-interactions
- Cursor label is functional, not narrative
- Never animate hero, background atmosphere, artifact tilt, and scroll reveal at the same time
- Motion must stop off-screen
- Static page must remain fully understandable

## 13.5 Motion Tokens

```css
--motion-fast: 140ms;
--motion-standard: 220ms;
--motion-structural: 360ms;
--motion-narrative: 900ms;

--ease-standard: cubic-bezier(.2, 0, 0, 1);
--ease-enter: cubic-bezier(.16, 1, .3, 1);
--ease-exit: cubic-bezier(.4, 0, 1, 1);
```

---

# 14. Z-INDEX SYSTEM

Use only tokenized layers:

```css
--z-base: 0;
--z-decorative: 10;
--z-sticky: 100;
--z-header: 200;
--z-menu: 300;
--z-overlay: 400;
--z-dialog: 500;
--z-tooltip: 600;
--z-cursor-label: 700;
```

Rules:

- Dialog appears above header and menu
- Background becomes inert
- Cursor label is hidden while dialog / mobile menu is open
- Tooltip must not be clipped
- No arbitrary z-index values

---

# 15. LOCALIZATION

Primary hiring language:

- English

Required second language:

- Traditional Chinese

Rules:

- Both languages are complete and equivalent.
- Never leave partial sections untranslated.
- Language switch preserves:
  - Route
  - Scroll position
  - Selected domain
  - Matcher result
  - View case
  - Media position
- Chinese uses its own art-directed line breaks.
- Do not reuse English forced line breaks.
- CTA, error, empty state, dialog title, caption and ARIA labels must switch.
- English product names may remain, with translated explanation.
- Visual weight must be recalibrated for Chinese.
- Navigation labels must remain semantically identical across languages.

---

# 16. RESPONSIVE SYSTEM

Canonical CSS breakpoints:

```text
Desktop reference: 1419px
Tablet breakpoint: 871px
Mobile breakpoint: 430px
```

This explicitly supersedes all historic 375px breakpoint rules.

375px is a QA viewport, not a CSS breakpoint.

Required QA viewports:

- 1419px
- 871px
- 430px
- 375px
- 320px

Mobile rules:

- Recompose, do not scale
- Preserve project evidence
- One primary reading order
- No hover dependency
- Domain selector becomes horizontal rail
- Popup becomes full-height sheet
- Touch target minimum 44×44px
- No page-level horizontal overflow
- Internal rails have visible end behavior
- Sticky controls do not obscure focus
- Swipe is never the only navigation method

---

# 17. ACCESSIBILITY

Minimum:

- Semantic HTML
- Logical headings
- Skip link
- Keyboard navigation
- Visible focus
- WCAG AA contrast
- 44×44 touch targets
- Proper form labels
- Connected errors
- Alt text
- Decorative empty alt
- Reduced motion
- Pause / Play for moving content
- No color-only meaning
- No autoplay audio
- Escape close
- Focus trap
- Focus return
- `aria-current`
- Tab semantics for Domain selector
- Dialog status announcement
- `scroll-margin` for sticky navigation

---

# 18. DESIGN TOKENS AND OWNERSHIP

## 18.1 Canonical Breakpoint Tokens

Use only:

- Desktop 1419
- Tablet 871
- Mobile 430

## 18.2 Ownership

Tokens own:

- Color
- Typography
- Space
- Radius
- Motion
- Elevation
- Z-index
- Breakpoints

Components own:

- Internal spacing
- Internal layout
- States
- Accessibility
- Interaction

Pages own:

- Section order
- Page composition
- Chapter rhythm
- External spacing

Sanity owns:

- Content
- Images
- Metadata

Pages must not define reusable component styling.

## 18.3 Registry

Every production component must document:

- Component
- Status
- React source
- CSS owner
- Token dependencies
- Variants
- Usage scope
- Figma source
- Code Connect status
- Allowed modifications
- Forbidden modifications

No reusable component may be modified if ownership is unknown.

---

# 19. IMPLEMENTATION ORDER

Before changing UI:

1. Confirm recruiter goal
2. Confirm active route
3. Inspect Figma node
4. Audit registry
5. Audit existing components
6. Audit CSS ownership
7. Audit selectors
8. Remove legacy conflict
9. Update token only when needed
10. Update component
11. Compose page
12. Build
13. Verify runtime DOM
14. Verify interaction
15. Capture QA screenshots
16. Review 1419 / 871 / 430
17. Check 375 / 320 resilience
18. Update registry
19. Stop

If a fix fails once:

> Stop. Do not append another override.

Never:

- Patch `globals.css`
- Add inline styles
- Create duplicate component
- Keep old and new systems together
- Use `!important` as a repair strategy
- Guess Figma positions
- Rewrite large TSX with unsafe global replacement
- Modify multiple unrelated sections in one step

---

# 20. CURRENT IMPLEMENTATION REJECTION RULES

The implementation is invalid if it contains any of these:

- Body background `#f7f6f2` or similar warm beige
- Generic `People / Systems / Clear decision model` node hero
- Four-column proof metric wall immediately after Hero
- Large six-column organisation grid
- All work inside bordered rounded cards
- Search / Solutions before Selected Work
- “Solutions” as a primary global navigation destination
- Domain rendered as small generic pill tabs
- Full-page SaaS dashboard result layout
- Generic radial or node artifact
- Identical project card layouts
- Generic modal as the only case-study experience
- Profile rendered as a dashboard
- Repetitive borders defining every chapter
- No authored hand / line narrative
- No clear translation of the reference sites

If any are present, stop and rebuild from this file.

---

# 21. RECRUITER VALIDATION TESTS

## 21.1 Five-second test

Without scrolling, a user must answer:

- What is her role?
- What does she specialize in?
- What transformation does she create?
- Where can I view work?

## 21.2 Two-minute recruiter scan

A recruiter must find:

- Location
- Availability
- Resume
- Three relevant projects
- Role / ownership
- Project status
- Client or product context

## 21.3 Five-minute hiring-manager test

A manager must answer:

- Why was the problem complex?
- What did Shulin own?
- What key decision did she make?
- What alternative was rejected?
- How did she influence PM / Engineering / Business?
- What evidence supports the result?
- What remains confidential?
- Can the system scale?

## 21.4 Interaction test

A user must be able to:

- Open Quick Preview
- Close with Escape
- Return focus to trigger
- Open Full Case Study
- Switch Domain
- Use Domain with keyboard
- Pause moving logos
- Use language toggle
- Use mobile menu
- Navigate without hover

---

# 22. FINAL ACCEPTANCE CRITERIA

A page is approved only when:

1. The global background is white.
2. The hero uses the hand / cyan arm / coral emphasis / directional lines.
3. Selected Work appears before Matcher.
4. Real evidence appears before abstract claims.
5. Project previews show ownership, decision and evidence.
6. Domain uses a selector and focused experience stage.
7. Principles connect directly to projects.
8. Profile is quiet and direct.
9. Section transitions are narrative, not rectangular.
10. Interaction has clear task value.
11. Reduced motion preserves meaning.
12. English and Traditional Chinese are complete.
13. No generic AI visual patterns appear.
14. No old visual system remains active.
15. Desktop, tablet and mobile screenshots match the approved Figma / reference direction.
16. Recruiter tests pass.
17. Build passes.
18. Runtime DOM matches ownership.
19. Registry is updated.
20. No known critical interaction failure remains.

---

# 23. ONE-SENTENCE EXECUTION RULE

> Build a white, reference-led, editorial product portfolio in which the hand transforms ambiguity into evidence-backed systems; preserve recruiter clarity, real project proof, authored asymmetry, purposeful interaction, and one deterministic design-system implementation.



---

# 24. CONFIRMED PROJECT CONTENT AND CURRENT IA ADDENDUM — 2026-07-17

## 24.1 Verified experience signals

- 10+ years of product design experience
- 40+ product initiatives
- Booking.com product launched across 40+ countries with launch-readiness validation for language, content, colour, interaction, and market-specific conflicts
- DBS internal system used by internal teams across six country operations

Use `6 countries`, not `6 markets`, when describing the DBS internal-user scale.

## 24.2 Organisation presentation

Current neutral organisation names:

- NTUC
- DBS
- Booking.com
- CTBC Bank / 中國信託
- Cathay United Bank / 國泰世華
- Taishin Bank / 台新銀行

Rules:

- Display only the active language version.
- Use neutral text unless logo permission is verified.
- Do not imply endorsement.
- Profile chronology may identify relationship type after verification.

## 24.3 Professional work priority

Current priority:

1. Voucher Incentive Ecosystem
2. DBS Exception Management
3. Booking.com Global Rollout
4. Project Hours Tracker
5. Bandzo Piano Learning

Homepage:

- Voucher flagship
- DBS and Booking.com supporting
- Project Hours Tracker and Bandzo remain accessible through Work, Search, Domain, or related cases

## 24.4 Project Hours Tracker

Verified:

- Independent 0→1 product
- Built for real freelance use
- First usable version completed in two days
- Used immediately and refined through real use
- Covers effort, revisions, deliverables, and project closure
- Makes under-estimated work visible for future planning

## 24.5 Bandzo Learning Platforms evidence

Bandzo represents Learning Platforms even when it is the only project in that domain.

It may prove:

- Practice guidance
- Supportive feedback
- Progression
- Confidence and recovery
- App–tablet continuity

Exact role, dates, delivery status, and outcome must be verified before publication.

## 24.6 First-launch evidence minimum

Each flagship case includes:

- 3–5 images or representative artifacts
- What made this hard
- Key design decisions
- Business impact
- Team impact
- My role

A clean crop or annotation from the main gallery may support a decision. A unique custom visual is not required for every decision in the first launch.

## 24.7 Matcher answer structure

A matched result shows:

1. Interpreted problem
2. Recommended direction
3. Why it matters
4. Capabilities to apply
5. Related projects

Do not display prototype-state copy, result counts, or internal matching mechanics.

## 24.8 Domain content

The six domains are:

1. Financial services
2. Enterprise operations
3. Growth & incentive systems
4. Travel marketplaces
5. Retail & commerce
6. Learning platforms

Every Domain contains:

- One conclusion
- System model
- Recurring problems
- Design responses
- Related projects

`0→1` is a product stage / problem type and remains discoverable through Search, Work, Profile, Design Principles, and individual cases.

## 24.9 Profile

Profile is a complete page.

Required:

- Positioning
- Availability and location
- Explicit email action
- Four transferable strengths
- Chronological experience and collaborations
- Evidence links
- Organisation relationship context
- Awards and recognition list
- Resume link
- Side projects
- Personal interests and media
- Verified Spotify link where relevant

## 24.10 Navigation

Current primary destinations:

- Work
- Playground
- Profile
- Language

Do not restore a separate Solutions page as primary navigation.


# 25. CONFIRMED RESPONSIVE, STICKY, AND SESSION BEHAVIOUR — 2026-07-17

## 25.1 Matcher

Desktop:

- Default query is centred.
- After first result, left query panel becomes sticky.
- Right results remain in normal page flow.
- Do not use fixed-height chapters or nested vertical scrolling.

Mobile:

- Single-column natural page flow
- No sticky query panel
- No horizontal page overflow

Session:

- Use one versioned JSON object in `sessionStorage`.
- No suggestion is selected by default.
- First successful search moves the query once.
- Later searches update only results.
- New browser session restores the centred state.

## 25.2 Domain

Desktop:

- Six-item 2×3 index
- Sticky selector
- Right content in normal page flow

At 871px and below:

- One labelled native domain selector
- Natural vertical content
- No horizontal selector rail
- Only related project cards may use a horizontal rail
- Diagrams stack vertically
- Reveal effects may not leave content faded or hidden

## 25.3 Card rails

- Use scroll padding and sufficient outer inset.
- Hover may not move a card outside a clipped rail.
- Do not leave artificial spacing after the final card.
- Controls must move the rail by a meaningful card interval.
- Mobile rails show the next-card affordance without cutting content.


# 26. NATURAL FLOW AND CONCISE HIERARCHY ADDENDUM — 2026-07-16

## 26.1 Sticky does not mean nested scrolling

Matcher and Domain use normal document scrolling.

Desktop behaviour:

- The section may use `min-height: calc(100svh - header)` to create an intentional first-view composition.
- Do not set a fixed `height`, `max-height`, or `overflow: hidden` on the chapter.
- Do not create an independently scrolling right panel.
- The left query or selector panel uses `position: sticky`.
- The right content remains in normal document flow and determines the section height.
- As the page scrolls through the right content, the left control remains visible until the section ends.

Tablet and mobile:

- Remove sticky positioning.
- Restore normal single-column page flow.
- Horizontal rails may be used for cards or selectors, but never nested vertical scrolling.

## 26.2 One semantic heading per idea

Do not stack a small uppercase label above a heading when both communicate the same idea.

Reject examples:

- `Related project evidence` + `Closest supporting work`
- `Related projects` + `Evidence from this domain`
- `Filter by problem` + `Four types of product complexity`
- `Ownership` + `My contribution`

Preferred:

- `Related projects`
- `Browse by problem`
- `My contribution`

Keep a kicker only when it adds a distinct layer of meaning, such as context, sequence, domain, or evidence type.

## 26.3 Recruiter scan test

For every section:

- Can the heading alone explain the section?
- Does supporting copy add new information instead of restating the heading?
- Can a recruiter identify role, scope, decision, evidence, and impact without decoding portfolio terminology?
- Remove implementation notes, navigation explanations, and internal prototype language from the public interface.


# 27. CASE-STUDY SEMANTICS AND EXPERIMENT HIERARCHY — 2026-07-16

## 27.1 Project evidence

- Do not place an evidence index in the first-view summary.
- The first view prioritises Role, Scale, and Key decision.
- `Project evidence` names the actual visual artifacts and appears only when the artifacts are shown.

## 27.2 Challenge before decisions

`Why it mattered` and `What made this hard` must appear before the evidence gallery and key design decisions. The reading order is:

Context → Constraints → Evidence → Decisions → Impact → Ownership.

## 27.3 Impact versus ownership

- `Team impact` explains how PM, engineering, operations, or other functions changed decisions or delivery.
- `I led` lists direct ownership.
- `Partnered on` lists shared responsibility.
- Do not use `Partnered on` without clarifying shared ownership.

## 27.4 Problem-type chips

Chips below a project title require a visible `Problem types` label. Experiment chips require an `Experiment stage` label. Unlabelled chips are prohibited.

## 27.5 Experiment detail sequence

Experiment detail pages follow:

Product question → What I built → Prototype evidence → What I learned → What I would test next.

Prototype and learning must not be presented as equivalent side-by-side summary cards.

## 27.6 Experiment index cards

Experiment cards use a consistent anatomy:

- experiment number
- current stage
- product question
- available evidence
- explicit action

Visual variation may come from colour and authored geometry, not inconsistent information hierarchy.


# 28. RECRUITER SCAN AND CONTEXTUAL CARD ADDENDUM — 2026-07-16

## 28.1 Project opening
Use one top-to-bottom scan: At a glance → Role and Scale → Key decision → Type, Scope, Audience, Timeline. Do not place three competing information blocks side by side.

## 28.2 Card context
- Homepage selected work: Role, Scale, Outcome.
- Work index: Role, Scale, Outcome.
- Search result: Relevant problem and Scale.
- Domain result: What this proves and Role.
- Experiment index: Question, Stage, Learning.
Do not use Owned / Decision / Artifacts as unexplained card labels.

## 28.3 Card targets and hover
The complete visible project card is one target. Cards in clipped horizontal rails must not translate outside their container on hover. Use inset feedback, border, shadow, internal illustration motion, pressed state, and focus-visible state.

## 28.4 Search recovery
An unmatched query must show a useful empty state with adjacent projects, a Work-page path, and a direct contact path. Never silently map an unknown query to an unrelated case.

## 28.5 Domain system
The homepage domain selector contains six concise domain perspectives. The left selector stays sticky on desktop; the right synthesis remains in normal page flow.

## 28.6 Design principles
Each principle must state: the decision, what it changes, and a linked case. Repeated generic impact bullet lists are forbidden.


# 29. LEARNING DOMAIN, HUMAN CONTEXT, AND PROFILE VALUE — 2026-07-16

## 29.1 Six domain perspectives

The six homepage domains are:

1. Financial services
2. Enterprise operations
3. Growth & incentive systems
4. Travel marketplaces
5. Retail & commerce
6. Learning platforms

`0→1 product discovery` is a problem or product stage, not a domain. It remains discoverable through Work filters, search, and individual cases.

The Learning Platforms domain may be represented by one strong case. Evidence depth matters more than project count. The Bandzo piano-learning project demonstrates practice guidance, supportive feedback, progression, and app–tablet continuity.

## 29.2 Real-use design principle

One design principle must explicitly cover the complete context behind human use:

- goals and motivations
- environments and devices
- skill or confidence differences
- constraints and interruptions
- exceptions, mistakes, recovery, and reassurance

The principle is: `Design for real use—not the ideal path.`

Decide which functions to build or improve only after synthesising these conditions across target users. The intended change is confident use across real-world conditions.

## 29.3 Profile value proposition

Do not limit Profile positioning to one job title.

The first-view profile signal should emphasise transferable strengths:

- clarity in ambiguity
- cross-functional alignment
- calm systems thinking

Role level may be shown separately as the direction being explored: Senior, Lead, and Staff-level individual-contributor roles.

## 29.4 Personal interests

Outside Product Work uses a compact authored mosaic, not oversized equal cards.

- Images or original work may be shown.
- Real external work may link out, such as a Spotify composition.
- Interests are not presented as product case studies.
- Each interest uses one precise lens: observation, rhythm, context, or calm under uncertainty.

## 29.5 Contact CTA

Superseded by Sections 7.10 and 33.9. The current footer is a compact email bar with no helper paragraph.


# 30. BEHAVIOUR-LED 0→1, SEARCH MATCHING, MOBILE DOMAIN, AND CONTACT — 2026-07-16

## 29.1 0→1 principle

Use:

**Start from analogous behaviour. Refine through real use.**

Study the motivation and decision logic behind comparable behaviours, translate them into a first product model, then improve it through observed use—especially hesitation, failure, and recovery.

This principle proves that a 0→1 product can be grounded before stable product-specific usage patterns exist. Borrow the underlying logic, never copy the surface interface.

## 29.2 Profile soft-skill proof

Use:

**Behaviour-led 0→1 judgment**

Translate the motivation and decision logic behind analogous behaviours into new product models, then refine them through real use—especially hesitation, error, and recovery.

This is distinct from generic systems thinking. It describes how the designer transfers insight into a new product space.

## 29.3 Search architecture

The static portfolio matcher uses weighted, deterministic intent matching—not generative AI.

- Normalise the bilingual query.
- Score exact multi-word phrases more heavily than single terms.
- Score exact tokens more heavily than partial matches.
- Compare all intents rather than stopping at the first keyword group.
- Require a minimum confidence threshold.
- Return a curated answer and project set for the highest-scoring intent.
- Show a no-match state below the threshold.

Supported intents include exception workflows, incentives, global rollout, learning journeys, disconnected systems, and 0→1 product framing.

## 29.4 Mobile Domain rule

At 871px and below:

- Use one labelled native domain picker.
- Do not show a separate horizontal selector rail.
- Stack insight panels in the normal reading order.
- Do not create nested horizontal rails for both navigation and content.
- The only permitted horizontal rail is related project cards.
- Domain diagrams reflow vertically and may not overflow the viewport.

## 29.5 Contact CTA

The final contact block must be compact and explicit.

- Use one compact question and one explicit email action.
- Current approved copy: `Working through a complex product problem?` and `Email me about it ↗`.
- Do not add helper paragraphs or another closing Hero.


# 31. V41 CLARITY, CARD, DOMAIN, AND DETAIL RULES — 2026-07-16

## 30.1 Soft-skill positioning
Use this concise capability statement:

**Untangle exceptions and blocked workflows**
Trace edge cases, broken handoffs, stalled states, and unclear processes, then define practical fallback paths that keep users and teams moving.

Chinese:

**解開例外與流程卡點**
找出例外狀態、交接斷點、停滯流程與混亂規則，整理成清楚路徑並建立可行替代方案，讓使用者與團隊能繼續前進。

## 30.2 Project card actions
The whole card is the target. Visible action labels are concise and destination-specific:
- Professional work: `View case ↗`
- Experiment: `View experiment ↗`
- Principle proof link: `See case ↗`
Do not use `View case details`, `View full project`, or repeated explanatory text.

## 30.3 Hover geometry
Hover may not change card dimensions or move a card outside a clipped rail. Use stable borders, inset rings, shadow, pressed feedback, internal artwork motion, and focus-visible states.

## 30.4 Domain navigation
Show all six domain choices as a compact two-column index on desktop and a responsive two- or three-column index on smaller screens. The selected domain reveals one natural-flow content stage. Do not use a nested content carousel or ambiguous labels such as `Domain synthesis`.

## 30.5 Detail colour semantics
- White / soft neutral: information and evidence
- Coral: challenge, risk, failure, or unresolved constraint
- Cyan: decision, action, learning, or selected state
- Near-black: primary hierarchy and final outcome only
Decorative colour blocks without semantic meaning are rejected.

## 30.6 Search session
Use version-scoped session keys. A new browser session starts centred. After the first result, the query moves left once and remains there for further searches in the same session.

## 30.7 Detail continuation
Every Project and Experiment detail ends with a horizontal `Continue exploring` rail that switches the open dialog to another case without closing the dialog.

## 30.8 Contact CTA
The footer is a thin, explicit email bar. No helper text. Heading explains the intent; button names the destination: `Email me ↗`.


# 32. V42 COMPLETION AUDIT — HARD OVERRIDE

## 32.1 Experience proof

- Do not reserve a large editorial column for a heading that only says “Experience at a glance.”
- Present verified scale signals directly, followed by a quiet organisation line.

## 32.2 Context-specific project cards

- Homepage and Work: Role · Scale · Outcome.
- Search: Why it fits · Scale.
- Domain: What this proves.
- Popup related work: Context · Transformation · View case.
- The whole card is the target. Visible action copy is always `View case ↗` or `View experiment ↗`.

## 32.3 Search session state

- A fresh browser session starts with a centred query panel and no selected suggestion.
- The first result structurally moves the query panel left.
- Later searches in the same session only update the result panel.
- Store one versioned JSON object in `sessionStorage`; a new session returns to default.

## 32.4 Mobile Domain

- Desktop may show all six choices as a compact 2×3 index.
- Tablet and mobile use one labelled native selector followed by normal-flow content.
- Never make users traverse six large cards before reaching the selected domain.
- Disable reveal opacity that makes content appear faded or incomplete on small screens.

## 32.5 Popup terminology and colour

- Neutral surfaces hold primary content.
- Coral marks constraints, risk, and negative states.
- Cyan marks decisions, selection, and learning.
- Decision cards use `Alternative considered`, `Trade-off accepted`, and a direct link to the supporting visual.
- Do not use `Evidence above`, `Owned`, `Partnered on` as impact, or unexplained colour blocks.

## 32.6 Footer

- Footer contact is a compact bar, not a closing hero.
- One question plus one explicit email action is sufficient.

# 33. LATEST CONFIRMED REQUIREMENTS — V43 HARD OVERRIDE — 2026-07-17

This section is the fastest current implementation reference.

When Sections 24–32 contain older wording, this section and the rewritten canonical Sections 7, 9, 10, and 11 win.

## 33.1 Core recruitment filter

Every visible section must help answer one of these:

- What problems can she solve?
- What did she personally own?
- How large or complex was the work?
- What decision did she make?
- What changed?
- What evidence can I inspect?
- Is this relevant to my role?

Remove labels, support text, and decorative categories that do not improve one of these decisions.

## 33.2 Context-specific card information

Do not force one card anatomy into every section.

- Homepage and Work: Role · Scale · Outcome
- Search: Why it fits · Scale
- Domain: What this proves
- Popup related cases: Context · Transformation
- Experiments: Product question · Current stage · Current learning

The whole card is one target.

Visible actions:

- `View case ↗`
- `View experiment ↗`
- `See case ↗`

Card titles and information are left aligned.

## 33.3 Hover, focus, pressed, and selected states

All buttons, links, cards, selectors, hamburger controls, tabs, and rails need:

- Default
- Hover
- Pressed
- Selected when applicable
- Focus-visible
- Disabled when applicable

Hover rules:

- Do not change card width or height.
- Do not translate cards outside clipped rails.
- Use an inset feedback ring with visible internal spacing.
- Use stable shadow and border treatment.
- Decorative artwork may move inside the card.
- Focus-visible must remain distinct from hover.

## 33.4 Search

- Fresh session starts centred.
- No default selected chip.
- First valid result moves query left once.
- Same-session searches never return to centre.
- Search uses weighted bilingual intent matching.
- Results are curated and evidence-safe.
- Unknown queries show a real empty state.
- Empty state offers related work, Work page, and email contact.
- Search cards stay left aligned.

## 33.5 Domain

- Six domains only.
- Desktop: compact 2×3 index.
- Mobile: labelled native selector.
- Left control is sticky only on desktop.
- Right content uses normal page flow.
- Remove ambiguous labels such as `What I learned across projects`.
- Domain conclusion must read as an integrated point of view, not a generic category description.
- Learning Platforms remains present with Bandzo evidence.

## 33.6 Professional Project Details

Opening must not contain a proof index.

Top-level information:

- At a glance
- Role
- Scale
- Key decision
- Type
- Scope
- Audience
- Timeline

Important distinctions:

- Scale = magnitude
- Scope = system coverage
- Business impact = business-level change
- Team impact = changed cross-functional decisions or delivery
- Partnered on = shared responsibility
- Project evidence = actual visual artifacts

`What made this hard` is visually prominent and appears before Evidence and Key Design Decisions.

The popup ends with related cases.

## 33.7 Experiment Details

Use one restrained sequential narrative:

> Product question → What I built → Prototype evidence → What I learned → What I would test next

Do not:

- Add decorative patterns to every section
- Place Prototype and Learning side by side
- Repeat stage, status, evidence count, and type in multiple places
- Use professional-case colour treatments without semantic reason

Experiment details end with related experiments.

## 33.8 Profile

Profile first view uses an editorial composition, not a generic contact card.

Right-side content must communicate:

- Where I add the most value
- Fully remote availability
- Role direction
- Explicit email destination
- Resume and LinkedIn destinations when verified

Approved strengths:

- Clarify ambiguity
- Untangle exceptions and blocked workflows
- Align people, rules, and ownership
- Transfer behavioural insight into 0→1 products

Experience is chronological and may include in-house work, direct clients, agency clients, and independent work.

Awards use a scalable list.

Outside Product Work uses a compact authored mosaic with optional images and real external links.

## 33.9 Footer

Use only:

> **Working through a complex product problem?**

> **Email me about it ↗**

No helper text.

## 33.10 QA acceptance

Do not claim completion without verifying:

- Desktop, tablet, and mobile reflow
- No horizontal page overflow
- Search default / first result / repeated search / no-match
- All six Domain states
- Project and Experiment popup opening, switching, closing, and back-step behaviour
- Related-case switching
- Card target areas
- Hover geometry and focus-visible
- Horizontal-rail final spacing
- Language switching
- Reduced motion
- Keyboard navigation
- Console errors
- CSS and JavaScript syntax
- Duplicate IDs


# 34. V44 ALIGNMENT, FILTER, INTERACTION, AND DENSITY RULES — 2026-07-17

## 34.1 Experience signals

- All metric values share one baseline and one structure: number + unit.
- Do not let one value remain on one line while equivalent values break inconsistently.
- Supporting labels align to the same vertical rhythm.
- Selected organisations appear in a separate static wordmark grid.
- Organisation names must not look interactive when they are not links.
- Avoid placing the organisation label in the same crowded row as unequal wordmark widths.

## 34.2 Work problem filters

- `Browse by problem` is a separate heading above the controls.
- The filter list begins with `All work` fully visible.
- The list uses a native horizontal rail with `scroll-padding`.
- Desktop and tablet provide previous / next controls when the rail overflows.
- Mobile supports direct touch scrolling and does not hide the first option.
- Selected state uses more than colour alone and remains visible at all widths.

## 34.3 Hover and focus geometry

- Hover must not change width, height, or page position.
- Interactive-card feedback uses an internal ring approximately 8px from the outer edge.
- The feedback ring may not overlap text or imagery.
- Rail containers reserve top and bottom room for shadow and focus indicators.
- Focus-visible remains outside the component and uses at least a 3:1 contrasting indicator.
- Buttons, chips, cards, menu controls, selectors, and related-content cards are included in the same state audit.

## 34.4 Professional-card density

- A project card uses one outer boundary only.
- Role, Scale, and Outcome appear in a soft grouped region rather than a table of separator lines.
- Do not use multiple horizontal rules inside a card.
- Preserve the authored cyan / coral palette through semantic accents, not repeated borders.

## 34.5 Project Details density

- Use whitespace and grouped surfaces before separator lines.
- Role, Scale, and Key Decision appear as grouped signal cards.
- Type, Scope, Audience, and Timeline appear as soft tiles without a surrounding table grid.
- Why It Mattered stays neutral.
- What Made This Hard uses the coral constraint treatment.
- Key Decisions use a cyan decision accent.
- Business Impact uses near-black emphasis; Team Impact uses cyan emphasis.
- Do not place borders above every subsequent section.

## 34.6 Profile first view

- Transferable strengths use a 2×2 index on desktop and one column on mobile.
- Each strength contains one short title and one short explanation.
- Avoid a long four-item vertical list inside a narrow side panel.
- Availability, role direction, location, and email remain visible but secondary to the capability scan.

## 34.7 V44.1 visual QA clarification

- Metric number and unit styles must override generic metric-span styling; number size may not collapse to body text.
- Selected organisations use one static wordmark ribbon rather than six button-like chips.
- Work-filter rail padding must not create false overflow or unnecessary arrow controls.
- Project Details opening uses grouped At a Glance, Role / Scale tiles, and one cyan Key Decision panel with no horizontal-rule stack.
- At tablet widths, Role and Scale share one row and Outcome spans the full metadata width to preserve readable line length.

## 34.8 Final density audit

- Homepage Project Cards use the same 8px inset hover ring as other cards.
- Decision alternatives and trade-offs use one white grouped surface rather than another separator line.
- Experiment learning and next-validation steps use spaced surfaces rather than a vertical stack of rules.


# 45. V45 SEARCH, DETAIL, DOMAIN, TOKEN, AND INTERACTION HARD OVERRIDE — 2026-07-17

## 45.1 Search

Default state:

- Centred query
- Full text submit button
- No selected chip
- No visible status sentence

Result state:

- Query remains left for the rest of the browser session
- Submit becomes a compact right-arrow button
- Top label uses `Results for “query”`
- Project cards include a representative visual
- Search cards omit `Professional work · Confidential`
- Search cards show Why it fits and Scale
- Whole card is clickable and uses pointer cursor

Suggested chips:

- Fill the corresponding phrase into the input
- Trigger the matched result
- Remain keyboard operable

No-match state:

- Must be visually different from successful results
- Uses editorial query treatment and explicit next routes
- Offers closest visible directions, Work, and Email
- Must not imitate the standard result panel

## 45.2 Project and Experiment cards

Hover:

- No inset outline that overlaps content
- No layout-size change
- Use surface tint, subtle elevation, internal image motion, and arrow feedback
- Focus-visible uses an external coral outline

All visible cards are single targets.

## 45.3 Professional Project Details

The first decision viewport uses a product-detail composition:

- Representative visual and gallery on the left
- At a glance, Role, Scale, Key decision, Type, Scope, Audience, and Timeline on the right

Rules:

- Problem-type tags are non-interactive metadata
- Show only a quiet `Confidential` badge when required
- Do not show `Professional work`
- Image and explanation remain visible together on desktop
- Gallery moves above the long narrative
- Key design decisions use a full-width readable list
- Do not push decision content into narrow right columns
- Related cases include representative visuals and a highlighted company or project source
- Opening any case resets the popup to the title position

## 45.4 Experiment Details

- Do not show an Experimental work chip
- Do not repeat Experiment stage below the title when Current stage is already in the overview
- Use the same image-left / explanation-right composition
- Grey or neutral surfaces may organise the overview
- Narrative order remains Question → What I built → Prototype evidence → Learning → Next test

## 45.5 Domain

- Remove helper copy that explains how to select a domain
- Financial services is the default open state
- Desktop selected state is a professional high-contrast tile, not a generic focus border
- Keyboard focus remains a distinct external outline
- Switching a domain moves the content stage back to its title
- Supporting-work cards use representative visuals
- Supporting-work cards omit Professional work / Confidential

## 45.6 Design Principles and Experiments

Design Principles:

- Desktop composition should fit within one intentional viewport where content length allows
- Use an editorial intro plus a compact 2×2 authored board
- Preserve playful offsets and semantic colour without reducing readability

Small Experiments:

- May use varied card heights and local colour
- Must feel like an authored lab board, not a uniform SaaS card row
- Keep consistent interaction and accessible structure

## 45.7 Work Page

- Maintain varied project emphasis
- Each project card should present its essential information within one viewport-height composition on desktop
- Flagship remains wider
- Supporting projects may use smaller ratios
- Mobile recomposes naturally and does not preserve forced height

## 45.8 Global Tokens

All pages use shared tokens for:

- Font family
- Type scale
- Font weight
- Line height
- Spacing
- Radius
- Colour
- Elevation
- Motion

White remains the primary page background.

Warm off-white is permitted only as a local authored surface.

## 45.9 Press State and Mobile Header

Every interactive control requires a pressed state.

On compact widths:

- Header remains fixed and visible
- Mobile menu opens below the visible header at the current scroll position
- Work and Experiment hero artwork remains right-aligned rather than stacking into a separate content block

# 46. V46 COMPONENT RHYTHM, SEARCH FOCUS, DOMAIN, AND DETAIL HARD OVERRIDE — 2026-07-17

## 46.1 Hover and focus

- Hover does not use an inner or outer line around cards.
- Card hover uses surface change, elevation, internal-media movement, and action movement.
- Hover cannot change card dimensions or move the card outside a rail.
- Keyboard focus retains a distinct external coral indicator with sufficient contrast and area.
- Pressed state is required for every button, chip, selector, card, and rail control.

## 46.2 Search

- Result state moves keyboard and visual focus to the top of the right result after the user submits or selects a chip.
- Restored session state does not steal focus on page load.
- The compact result-state submit button contains only a right arrow.
- Use `Recommended direction for “query”`, not `Results for` or an absolute `Solution for` claim.
- Search cards are compact and include representative media, Why it fits, Scale, and View case.
- No-match uses a warm editorial surface rather than a dominant black panel.

## 46.3 Domain

- Financial services is always the initial selection on a fresh page load.
- Do not restore a different Domain from session storage.
- Number and title use a fixed two-column alignment.
- Selected state is expressed through surface and number treatment, not a pseudo-element that changes Grid placement.
- Desktop tabs support arrow, Home, and End keys.
- When Supporting work contains one project, show one full-width card with the visual on the right.

## 46.4 Detail gallery

- Main evidence retains the complete available width.
- Evidence title and explanation appear immediately below the main visual.
- Thumbnails appear below the evidence explanation and may not reduce the main visual width.
- The same pattern applies to professional projects and experiments.

## 46.5 Key decisions and Team impact

- Each Key decision is one readable full-width item.
- Title and resulting behaviour appear first.
- Alternative and Trade-off appear in a balanced two-column group below.
- Do not push decision content into a narrow right column.
- Team impact is structured as stakeholder / area plus the actual changed decision or behaviour.

## 46.6 Title and section rhythm

Use component tokens:

- `--component-title-gap`
- `--component-content-gap`
- `--component-section-gap`
- `--component-panel-padding`

All popup section titles use the same heading line height and title-to-content gap.
Delivery & Measurement follows the same rhythm as Business Impact, Team Impact, and My Role.

## 46.7 Work and related-card consistency

- Every Work card uses the same action placement and `View case ↗` label.
- The action remains aligned at the bottom of the content region in every card proportion.
- Related project and related experiment cards use the same action height and vertical placement.

## 46.8 Registry ownership

Current v47 implementation includes:

- `assets/css/tokens.css`
- `assets/css/components-v47.css`
- `docs/design-system/tokens/design-tokens-v47.json`
- Component registry entries for ProjectCard, DetailDialog, DomainSelector, and ChallengeMatcher

No new page-level spacing or state styling may bypass these owners.



# 47. RESPONSIVE REFLOW AND VISUAL QA HARD OVERRIDE — 2026-07-17

## 47.1 Mobile readability

- Mobile is recomposed, never a scaled desktop.
- Domain uses a compact Cyan introduction and a white natural-flow content card.
- Domain title is `Patterns across six domains.`
- Domain diagrams stack vertically.
- Impact, ownership, delivery, and decision sections stack before text becomes narrow.
- Popup titles use mobile-specific size and line-height tokens.
- No section may produce one-word text columns like the previous Team Impact layout.

## 47.2 Team impact

Business Impact and Team Impact are not displayed as equal-width halves.

- Business Impact is one readable section.
- Team Impact follows as a separate section.
- Desktop Team Impact may use three equal cards.
- Each card shows target function first and the changed behaviour below.
- Tablet and Mobile use one column.

## 47.3 Horizontal rails

Every swimlane uses:

- `--component-rail-gap: 12px`
- `--component-rail-edge: 12px`
- Stable top and bottom padding
- No artificial trailing gap
- No card hover translation outside the rail

The rule applies to Search projects, no-match projects, related work, experiments, profile side projects, gallery thumbnails, chips, and Work filters.

## 47.4 Runtime QA completion path

The source package contains an automated Playwright harness for a real browser environment.

Required environments:

- Chromium
- WebKit
- 1440, 900, 768, 430, 375, and 320 CSS px

Required interaction tests:

- Hover screenshots
- Search focus at result title
- Same-session search position
- Domain switch and stage reset
- Popup open and related-case scroll reset
- Keyboard focus and Escape close
- Mobile menu at non-zero page scroll

Container static QA is not a substitute for the real-browser harness.


# 48. V48 ENFORCED COMPONENT OWNERSHIP AND MOBILE QA — 2026-07-17

## 48.1 Registry is enforced

The registry is no longer documentation only.

Every production page must load exactly:

1. `tokens.css`
2. `foundation-v48.css`
3. `components-v48.css`

`components-v48.css` is the single active component style owner.

`qa/design-system-lint.mjs` fails when:

- stylesheet order changes
- a custom cursor label returns
- required component tokens are not consumed

## 48.2 Custom cursor feedback

Remove the floating `Open` / `Explore` cursor label.

Use the native pointer cursor, card elevation, internal visual motion, and explicit CTA text.

## 48.3 Mobile Domain navigation

At 871px and below:

- Hide the native select
- Show a horizontal chip rail
- Keep the chip rail sticky beneath the header until the Domain section ends
- Hide numerical prefixes inside mobile chips
- Auto-centre the selected chip
- Preserve keyboard tabs and clear selected state

## 48.4 Design Principles

Principle explanations are static content.

The linked case is a separate explicit action:

- label: `Supporting case`
- visible project name
- arrow

Only the supporting-case control opens the project popup.

## 48.5 Mobile card heights

- Work project card maximum: 680px
- Experiment index card: 420px
- Homepage experiment card: 360px
- Summary copy may clamp on mobile when full content is available in the popup
- CTA remains visible without scrolling inside a card

## 48.6 Runtime QA without Playwright

A deployed site must expose `/qa`.

The browser-native QA page verifies:

- six responsive widths
- horizontal overflow
- mobile sticky Domain chips
- Domain selection
- Search chip input and result focus
- Popup related-case scroll reset
- custom cursor removal
- mobile card height
- experiment colour safety

This page requires no Playwright installation.


# 49. V49 WORLD-CLASS UI QA HARD OVERRIDE — 2026-07-17

- Remove all legacy CSS from the active load chain.
- Static content must remain visible when reveal JavaScript fails.
- Desktop chapters use natural document height; no unexplained viewport-sized whitespace.
- Mobile work and experiment cards target one-screen comprehension through compact media, two-line summaries, Scale, Outcome, and one action.
- Mobile Domain uses sticky horizontal chips beneath the fixed header until the section ends.
- Principle cards are static explanations; the only project-opening control is the clearly labelled Supporting case button.
- Popup evidence uses Image → explanation → thumbnails.
- Popup summaries, decisions, impacts, ownership, and delivery share one spacing system.
- Non-sequential sections do not use decorative numbering.
- Hover never replaces semantic colours, creates content-obscuring overlays, or changes geometry.
- Focus-visible remains a separate 3px high-contrast indicator.
- Runtime QA is executed with Chromium through CDP in the container; no user-side Playwright installation is required.

# 50. V50 WORLD-CLASS UI QA HARD OVERRIDE — 2026-07-17

## 50.1 Completion gate

A design-system registry is not evidence that the rendered interface is correct. Completion requires:

1. One active owner for every shared component style
2. Token consumption in rendered CSS
3. Static HTML, CSS, and JavaScript checks
4. Real Chromium rendering at 1440, 900, 768, 430, 375, and 320 CSS px
5. Interaction checks for Search, Domain, Dialog, related-case switching, hover, focus-visible, and pressed state
6. Screenshot review after all automated checks pass

## 50.2 Responsive containment

All Grid and Flex children that contain rails, long labels, diagrams, or cards require `min-width: 0`.

Horizontal rails:

- Scroll internally
- Use `--rail-gap: 12px`
- Use `--rail-edge: 12px`
- Never increase document `scrollWidth`
- Preserve focus and hover safety space

Mobile pages must meet the WCAG 320 CSS px reflow requirement without two-dimensional page scrolling.

## 50.3 Supporting-case actions

A Design Principle is explanatory content, not itself a project link.

The supporting evidence is a separate control containing:

- Label: `Supporting case`
- Case name
- Separate directional icon

Only this control opens the case.

## 50.4 Representative evidence

Placeholder artifacts must look intentionally designed rather than like unstyled text.

Required artifact families:

- Browser / workflow model
- Global rollout readiness map
- Project closure dashboard
- Learning and practice feedback
- Experiment geometry

Every artifact must remain legible and contained at 320 CSS px.

## 50.5 Experiment readability

Experiment feature and index cards must:

- Preserve semantic card colours on hover
- Separate Current learning label and content
- Fit the key question, stage, learning, and action within one mobile decision viewport where content length permits
- Use horizontal rails on mobile rather than vertically stacking every experiment

## 50.6 Target and focus standards

- Custom non-inline targets aim for at least 44 × 44 CSS px
- Focus-visible uses a clear external indicator with sufficient contrast
- Sticky controls must not obscure the newly focused content
- Hover never replaces focus or changes component geometry


# 51. V51 MOTION RESTORATION AND POPUP COMPLETION — 2026-07-20

## 51.1 Motion ownership

Motion is functional and token-driven.

- Hero line resolution and `clear` reveal are the only narrative motions in the first viewport.
- Scroll reveal occurs once per selected chapter or card group.
- Search, Domain, Gallery, Dialog, and internal artwork feedback are functional motions.
- Whole cards do not translate outside clipped rails.
- Content remains visible without JavaScript and in reduced-motion mode.

## 51.2 Popup quick decision view

The first popup decision view is one system:

1. Transformation and problem types
2. Evidence image, explanation, and thumbnails
3. At a glance
4. Role, scale, and key decision
5. Type, scope, audience, and timeline

The quick view uses one connected surface rather than multiple unrelated floating boxes.

## 51.3 Runtime class ownership

The following dynamic classes must be explicitly styled:

- `decision-card-v46`
- `decision-number-v48`
- `decision-body-v46`
- `decision-considerations-v46`
- `decision-visual-link-v46`
- `team-impact-item-v47`
- `team-impact-role-v47`
- `recruiter-proof-item-v46`
- `detail-related-card-v45__brand`
- `detail-related-card-v45__flow`
- `detail-related-action-v46`

Missing CSS ownership for a generated runtime class is a release blocker.
