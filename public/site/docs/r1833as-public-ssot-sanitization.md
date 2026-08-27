# R183.3A-S Public SSOT sanitization

## Boundary

`public/site/content/portfolio-content.json` is the public content and presentation SSOT. It may contain verified public content, public-safe asset IDs, semantic IDs, archetype/component metadata, and stable JSON source pointers. It must not contain private access URLs, source filenames, Library handles, local paths, private working values, or audit workspaces.

The original source documents and private working evidence remain owned by their existing external source packs. No second content SSOT is introduced in this repository.

## Classification

| Field family | Classification | Public treatment |
|---|---|---|
| Project copy, classifications, metrics and claim boundaries | REQUIRED BY PUBLIC RUNTIME | Retained |
| `sourcePath`, `sourceAssetId`, decision and evidence IDs | SAFE PUBLIC METADATA | Retained as stable identifiers |
| Archetype, slot, resolver and Approved Baseline contracts | REQUIRED BY PUBLIC RUNTIME | Retained |
| Private Figma prototype URL | REQUIRED FOR INTERNAL PROVENANCE ONLY | URL removed; safe file/frame/node metadata retained |
| Source filenames, Library file IDs, working-file hashes | REQUIRED FOR INTERNAL PROVENANCE ONLY | Removed from public SSOT; original source packs remain canonical |
| `sourceArchives`, Principal-readiness audits and content-update workspaces | MIGRATION-ONLY | Removed from public SSOT |
| `privateSource*`, `privateTarget*`, `privateValues*`, `keepInternal*` | REMOVE FROM PUBLIC SSOT | Removed; approved public approximations remain |
| Public press and award URLs on allowlisted domains | SAFE PUBLIC METADATA | Retained |

## Runtime dependency

Voucher Center previously coupled a public interactive control directly to a private Figma URL. The public adapter now requires a public-safe `prototypeUrl` before exposing that control. With only the safe Figma reference present, it renders no broken or access-bearing prototype action. No project fact, Evidence item, archetype contract, semantic slot, or Design Library mapping changes.

## Regression

`public/site/qa/public-ssot-boundary.mjs` blocks private Figma URLs, non-allowlisted URLs, Library handles, local paths, source-document filenames, working-file hashes, private provenance fields, source archives, and working audit owners from re-entering the public SSOT.
