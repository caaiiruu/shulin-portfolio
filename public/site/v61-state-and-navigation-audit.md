# V61 state and navigation audit

## Matcher

- Matcher storage key is versioned so this release starts every new review session in the centred default state.
- Result state uses a compact sticky card with a visible micro-label, editable field, and right-side submit button.
- Default and result layouts have separate selectors so sticky rules cannot leak into the initial state.

## Horizontal rails

- All rail masks are explicitly disabled.
- Floating domain navigation no longer uses gradient pseudo-element overlays.
- Native horizontal overflow, scroll snapping, and equal edge spacing remain.

## Popup metadata and navigation

- Project and experiment headers show category and period in one line with a `|` separator.
- Experiment details retain Current stage only; Type and Timeline are no longer duplicated.
- Nested detail navigation uses a labelled `← Back` pill. The top-level close remains `×`.
- Both controls retain accessible labels, keyboard operation, and compliant target size.

## Verification

- JavaScript syntax, design-system lint, production build, artifact validation, four automated tests, and whitespace validation pass.
