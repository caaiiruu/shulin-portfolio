# Release Manifest

Status: `BLOCKED`

Production domain: `https://shulinchou.com/`

## Required release identity

- Approved Baseline ID: `DH-PHASE1-PRODUCTION-BASELINE-2026-09-15`
- Commit SHA: `f0c4ca0a770d7adb1f29d39a2a514c8715e1944e`
- Tree SHA: `d66980327f1313c4827a50303dccb86330816d01`
- Preview deployment ID: `UNVERIFIED`
- Production candidate deployment ID: `UNVERIFIED`
- Human release approval: `NO`

Daily Hours Phase 1 source deployment: `dpl_2LBWUMectR5hDG8Jkm7xj3eiGRwE`

The approved identity above is an implementation baseline only. `DH-WEB-1.0` remains `FUTURE_RELEASE_BLOCKED`; Daily Hours is not Live and Production promotion is not unlocked.

## Release gate

Production promotion is forbidden until all fields above are exact and VERIFIED, the Regression Lock is fully VERIFIED, and the Human explicitly approves release.

After promotion, verify the live domain maps to the expected deployment and run Production smoke QA before closing the release.
