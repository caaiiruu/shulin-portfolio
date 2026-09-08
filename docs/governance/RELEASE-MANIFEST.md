# Release Manifest

Status: `BLOCKED`

Production domain: `https://shulinchou.com/`

## Required release identity

- Approved Baseline ID: `UNVERIFIED`
- Commit SHA: `UNVERIFIED`
- Tree SHA: `UNVERIFIED`
- Preview deployment ID: `UNVERIFIED`
- Production candidate deployment ID: `UNVERIFIED`
- Human release approval: `NO`

## Release gate

Production promotion is forbidden until all fields above are exact and VERIFIED, the Regression Lock is fully VERIFIED, and the Human explicitly approves release.

After promotion, verify the live domain maps to the expected deployment and run Production smoke QA before closing the release.
