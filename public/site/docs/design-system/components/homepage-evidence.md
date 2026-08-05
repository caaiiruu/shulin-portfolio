# HomepageEvidence

`HomepageEvidence` is the single production owner for the homepage experience proof and Principle Constellation.

- Desktop experience metrics support rapid side-by-side comparison.
- Mobile metrics use a natural vertical reading order without horizontal scrolling.
- All four principles are visible in the default state and are presented as parallel decision lenses, not a sequence.
- One shared renderer maps the stable IDs and bilingual `collapsed`, `expanded`, and `diagramLabels` fields from `content/portfolio-content.json`.
- Only one principle can be expanded at a time. The active trigger collapses itself, and Escape returns the constellation to its fully collapsed state.
- Language changes rerender copy while preserving the active stable ID.
- Wide desktop opens the selected principle as the left focus card while the other three form a narrower vertical rail on the right. Selecting a rail card exchanges its position with the focus card.
- Tablet retains the two-column constellation with a full-width detail region. Mobile uses a vertical numbered rail with intrinsic content height.
- Stable card IDs participate in the shared 300ms layout transition; reduced-motion removes the transition without changing state or focus behaviour.
- Expanded detail is keyboard operable and connected through `aria-expanded`, `aria-controls`, `role=region`, and visible focus.
- Motion is limited to the shared state transition and is removed under `prefers-reduced-motion`.
- Organisation names wrap instead of clipping or becoming a second carousel.
- The component never uses carousel, horizontal scroll, modal, hover-only information, inline style, or duplicated per-principle markup.

CSS owner: `assets/css/components/homepage-evidence.css`
