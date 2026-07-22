# Portfolio v52 optimisation audit

## Corrected from the supplied screenshots

- Team impact now uses the same vertical rhythm as Business impact and cannot stretch into large blank gaps.
- Desktop Domain controls transform into a bottom floating horizontal rail only while the reader is inside the content portion of the Domain chapter.
- The original Domain controls disappear without collapsing layout while the floating rail is active.
- Matcher title and supporting copy share one alignment axis; chips use smaller, consistent typography.
- Experiment Cyan, Cream, and Dark variants retain their semantic colours and compliant text contrast in rest and hover states.
- Experiment quick preview no longer resembles an unfinished table.
- Medium-size headings use less aggressive negative tracking so words do not visually merge.
- Profile side projects support a project-level award badge, but unverified award claims remain hidden.
- Placeholder award rows and placeholder career copy were removed from the public review.

## Runtime verification

Chromium 144 CDP tests passed at 1440, 900, 768, 430, 375, and 320 px with no page-level horizontal overflow. Interaction checks covered the Matcher, floating Domain navigation, professional project impact, experiment colour variants, experiment popup, and Profile recognition structure.

Safari and physical iPhone verification are still separate deployment-stage checks.
