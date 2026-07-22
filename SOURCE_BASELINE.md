# Source baseline record

## Included state

- Git ancestor: `19086bb`
- Recovered branch name: `design-governance-v44`
- Snapshot purpose: preserve the complete buildable v44 source before the next visual-QA phase
- Verification at packaging time: production build passed; 27/27 rendered regression tests passed

## Deliberately excluded

- `.git/` history and local branch metadata
- `node_modules/`
- `.next/`, `dist/`, `.wrangler/`, `.sites-runtime/`
- environment files and local caches

## Known next-phase work

The screenshot review identified unresolved visual and interaction issues in project cards, popup alignment, thumbnail fallbacks, project-detail hierarchy, search focus/sticky behavior, contrast, horizontal-rail spacing, responsive grids, and supporting-page navigation. Those changes are not silently included in this recovery baseline.

Create the next work as a pull request from this baseline so source, review deployment, and production can remain traceable to the same commit.
