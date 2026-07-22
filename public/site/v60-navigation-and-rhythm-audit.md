# V60 navigation and rhythm audit

## Root cause corrected

The previous rhythm pass targeted static heading/body structures. Team impact is rendered dynamically and its legacy selector had higher specificity, so it fell outside that coverage. V60 moves the dynamic component onto the same popup spacing tokens and adds automated source contracts for all four pages.

## Changes

- Domain options are fixed-width horizontal scroll items with native scrollbars and scroll snapping; they no longer shrink to fit.
- Project period is supporting header metadata beside project context and is removed from the lower information grid.
- Team impact cards consume shared popup padding and heading-gap tokens.
- Detail navigation keeps a stack: the close control returns one level, while the backdrop closes the complete stack.
- Supporting-case actions use a shared bottom baseline.
- Experiment, profile side-project, playground, and related-work rails share equal edge spacing and fixed card widths. Experiment cards retain a controlled playful tilt.
- Navigation uses root-relative `/site/…` paths so Profile remains reachable from every route.

## Verification

- All four HTML routes return successfully in the production server.
- Every referenced local asset exists and loads.
- JavaScript syntax, design-system lint, Sites artifact validation, and three production tests pass.
