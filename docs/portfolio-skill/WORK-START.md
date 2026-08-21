# WORK START — Token-Saver Protocol

Every Work round:

1. Read `CORE.md`.
2. Read `registry.json`.
3. Verify the real current canonical QA HEAD in GitHub.
4. Run and record capability preflight before choosing an execution path:

```text
Repository read via GitHub connector: YES / NO
GitHub connector writes: YES / NO
Branch create/update: YES / NO
PR create/update: YES / NO
Workflow dispatch: YES / NO
Workflow rerun: YES / NO
Workflow logs: YES / NO
Local repo available: YES / NO
Local Git auth available: YES / NO
gh CLI available: YES / NO
Binary/blob write available: YES / NO
```

5. Load ONLY the task-relevant reference:
   - content / SSOT → `references/content.md`
   - decisions → `references/decisions.md`
   - evidence → `references/evidence.md`
   - outcomes → `references/outcomes.md`
   - images / assets → `references/images.md`
   - GitHub / CI / execution → `references/execution.md`
   - QA / runtime certification → `references/qa.md`
6. Choose an execution strategy only from capabilities proven available. Never assume repo attachment, `gh`, workflow dispatch, or local Git auth; never repeat unauthenticated clone recovery.
7. For normal project work, branch from actual canonical QA and open the isolated project PR directly back to canonical QA. Stacked repair PRs are exception handling only.
8. Read the project-specific Work Order only.
9. Do not re-audit frozen topics not named in the Work Order.
10. Stop only for a TRUE repo conflict, content integration conflict, generic shared capacity gap, or failed blocking engineering gate.

This file exists to reduce token usage. Do not load the full `SKILL.md` on every execution unless the task changes governance itself.
