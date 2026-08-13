# Portfolio Execution Protocol

This protocol is mandatory for all future portfolio Work Orders.

1. The repository is the implementation single source of truth.
2. Never reconstruct canonical SSOT content from chat.
3. Connector-native Git Data is the preferred execution path.
4. A missing local checkout is not a blocker once this remote execution plane is available.
5. Updating the existing QA branch and using the existing pull request `synchronize` event is the preferred CI trigger.
6. Implementation follows the shared-owner-first rule: audit the registry, tokens, shared component owner, CSS owner, responsive contract, and interaction contract before changing page composition.
7. Engineering QA and Human Visual QA are separate gates. CI may declare `ENGINEERING QA PASS`; it must never declare `FINAL VISUAL PASS`.
8. The latest user screenshot or interaction result overrides an earlier automated PASS.
9. Implementation is incomplete without:
   - Final QA HEAD
   - a CI run tied to that exact HEAD
   - QA screenshot artifacts
   - a new Preview URL
   - a new contentVersion and canonical SSOT SHA when SSOT changed
10. Production requires explicit user approval.
11. A reference implementation may be frozen only after:
   - Engineering QA PASS
   - Human Visual QA PASS
   - P0 = 0
   - P1 = 0

## Generated runtime ownership

- Git owns canonical content, asset mappings, source CSS, source JS, generation scripts, and the four HTML templates in `site-source/templates/`.
- The build owns `public/site/index.html`, `work.html`, `experiments.html`, `profile.html`, `public/site/work/*.html`, and fingerprinted `production.*.css` / `production.*.js` bundles.
- Vercel consumes those generated files only after `scripts/build-production-assets.mjs` has produced them from canonical source.
- Generated runtime files are deployment output, never a second content or component source of truth.
- Future Work migrations edit and commit canonical source only. Generated bundles must never be downloaded, manually edited, or transferred through Chat/GitHub connector blobs.
- A valid build must preserve SSOT, source CSS/JS, registry, mappings, and templates; generate the same path, byte-size, hash, and HTML-reference manifest twice from identical source; and resolve every referenced runtime asset.

Required state progression:

`IMPLEMENTED → ENGINEERING QA PASS → READY FOR HUMAN VISUAL REVIEW → HUMAN VISUAL QA PASS / FREEZE`

Production promotion is never implied by an engineering or visual QA result.
