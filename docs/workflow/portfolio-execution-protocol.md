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

Required state progression:

`IMPLEMENTED → ENGINEERING QA PASS → READY FOR HUMAN VISUAL REVIEW → HUMAN VISUAL QA PASS / FREEZE`

Production promotion is never implied by an engineering or visual QA result.
