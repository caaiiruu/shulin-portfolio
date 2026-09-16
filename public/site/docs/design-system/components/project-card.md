# Component: ProjectCard

Status: Active shared design-system owner

## Ownership

Structure / behavior owner:
- shared ProjectCard runtime (`public/site/assets/js/project-card-media.js` plus the shared card projection used by Work / Domain)

CSS owner:
- `public/site/assets/css/components/project-card.css`

Canonical content owner:
- `public/site/content/portfolio-content.json`

Canonical asset owner:
- `public/site/content/portfolio-asset-manifest.json`

Project presentation-route owner:
- `public/site/content/project-presentation-registry.json` for non-legacy presentation contracts only

Page composition owners:
- Home: placement / ordering only
- Domain: carousel / wheel composition only
- Work: grid / ordering / filtering only

Page owners must not redefine ProjectCard internals or duplicate project asset mappings.

## Variants

Only these public listing variants are allowed:

- `featured`
- `standard`
- `compact`

Variant changes may affect composition density and media allocation, but must not create a second card system.

## Internal contract

ProjectCard owns:

- metadata hierarchy
- title typography
- metric slot
- CTA row
- border / radius
- internal spacing
- Lead Visual frame
- hover / focus behavior
- responsive internal layout
- text-decoration reset
- canonical whole-card navigation behavior

Pages own only external placement and composition.

## Lead Visual contract

Lead Visual is canonical-asset-first and fail-closed.

Rules:

1. Every legacy project resolves its approved Lead Visual from the project hero asset ID in `portfolio-content.json` to the production asset record in `portfolio-asset-manifest.json`.
2. The asset manifest is the only ProjectCard asset-resolution SSOT; page JS must not maintain project-to-image maps.
3. Daily Hours remains outside the legacy 13-project roster and uses only the listing projection at `portfolio-asset-manifest.json#projectCardLeadVisuals.dailyHours`; its frozen case-study asset owners remain untouched.
4. Home, Domain and Work must use the same canonical project image for the same project.
5. Canonical masters are production-approved JPEG assets. Responsive delivery derivatives may be generated later from those masters, but derivatives must never become an independent SSOT.
6. Source images must never be silently replaced with an older repository asset.
7. Never upscale a low-resolution source to manufacture a larger derivative.
8. The visible ProjectCard media frame is 16:9 and full-bleed.
9. Media uses `object-fit: cover` with project-approved focal positioning if needed.
10. Source dimensions never control card geometry.
11. CSS background-image substitution and SVG/base64 wrappers are forbidden for ProjectCard Lead Visuals.

## Brand surface contract

The card content surface uses the canonical `--project-card-tint` value owned by `project-card.css`.

Brand tint:

- is a soft supporting surface, not a logo-color flood
- must remain readable with the shared typography tokens
- is shared across Home / Domain / Work for the same project family
- must not be generated from a project-id hash
- must not be re-declared by Work or Domain page owners

## Interaction contract

Desktop fine pointer:

- no whole-card lift
- no page-specific shadow behavior
- Lead Visual uses the shared restrained zoom
- navigation arrow moves on the horizontal axis only
- CTA text is never underlined

Touch / coarse pointer:

- no sticky hover visual state
- carousel / disclosure interactions must not activate card hover styling

Keyboard:

- whole-card navigation remains keyboard accessible
- focus-visible remains explicit

## Navigation contract

Every ProjectCard instance resolves to one canonical public Work route.

- Legacy project cards resolve to `/work/{projectId}` unless an existing canonical route owner explicitly supplies another public route.
- Non-legacy presentation contracts resolve from `project-presentation-registry.json`.
- Listing cards must normalize old dialog/button triggers into one accessible whole-card link; legacy modal triggers are not a second public navigation contract.
- The whole card and its visible `View case` affordance resolve to the same destination without nested competing links.

Required review path:

Home / Domain / Work → ProjectCard → `/work/{slug}` → browser Back

## Responsive contract

Reference widths:

- 1419
- 871
- 430

Same-row cards of the same variant must align in outer height and media height where the page composition places them as peers.

Lead Visuals remain full-bleed at every reference width. Fine-pointer hover motion must be absent on coarse/touch input.

## Governance

Forbidden:

- project-specific card renderer
- page-specific card hover
- page-specific card typography
- page-specific card media ratio
- alternate Lead Visual per page
- page-owned project-to-image map
- CSS background-image substitution for ProjectCard media
- duplicate ProjectCard CSS owner
- duplicate ProjectCard asset registry
- old and new ProjectCard systems active together
- `final`, `latest`, `new`, `fixed`, or version-suffixed asset files acting as SSOT

Any ProjectCard change requires regression checks across Home, Domain, Work and representative case-study routes before Human review.
