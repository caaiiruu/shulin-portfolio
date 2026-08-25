# FloatingNavigator

Component: FloatingNavigator

Status: Live / Current Production

JavaScript owner: public/site/assets/js/app.js

CSS owner: public/site/assets/css/components/domain-selector.css

Registry: public/site/docs/design-system/registry.json

Variants:
- Domain
- Project sections

Usage scope:
- Homepage Domain navigation
- Project detail section navigation at desktop, tablet, and mobile

Shared ownership:
- Shell owns fixed bottom positioning, safe-area inset, surface, border, radius, elevation, backdrop, visibility motion, reduced motion, and forced-colors behavior.
- Rail owns horizontal scrolling, scroll padding, and scrollbar suppression.
- Item owns chip size, neutral/active states, focus-visible behavior, and touch target.
- Project-section activation owns one smooth anchor motion, canonical control offset, settled active-state synchronization, and reduced-motion fallback.

Consumer ownership:
- Domain supplies domain labels, selection state, and domain scrolling.
- Project supplies Overview, Complexity, Decisions, Impact labels, target logic, and aria-current.
- Project consumers must use the shared anchor activation path; no project may add a local offset, motion value, or competing scroll listener.

Forbidden:
- A Project-only floating shell.
- Any pd-section-nav shell, rail, chip, disclosure, or breakpoint visual ownership.
- A Jump to section dropdown or accordion at any viewport.
