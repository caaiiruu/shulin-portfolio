# Component: ProjectCard

Status: Active shared design-system owner

## Ownership

Structure / behavior owner:
- shared ProjectCard runtime

CSS owner:
- `public/site/assets/css/components/project-card.css`

Asset / metadata registry:
- `public/site/content/project-card-registry.json`

Page composition owners:
- Home: placement / ordering only
- Domain: carousel / wheel composition only
- Work: grid / ordering / filtering only

Page owners must not redefine ProjectCard internals.

## Variants

Only these public listing variants are allowed:

- `featured`
- `standard`
- `compact`

Variant changes may affect composition density and media allocation, but not create a second card system.

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

Pages own only external placement and composition.

## Lead Visual contract

Lead Visual is registry-first and fail-closed.

Rules:

1. Every project has exactly one approved canonical Lead Visual master.
2. `public/site/content/project-card-registry.json` is the only ProjectCard asset mapping source.
3. Home, Domain and Work must use the same canonical project image.
4. The canonical master is a high-quality JPEG derived from the Human-approved source intake image.
5. Source images must never be silently replaced with an older repository asset.
6. Responsive derivatives may be generated for delivery, but derivatives never become SSOT.
7. Never upscale a low-resolution source to manufacture a larger derivative.
8. The visible ProjectCard media frame is 16:9 and full-bleed.
9. Media uses `object-fit: cover` with project-approved focal positioning if needed.
10. Source dimensions never control card geometry.

## Brand surface contract

The card content surface uses the explicit `brandTint` registered per project.

Brand tint:

- is a soft supporting surface, not a logo-color flood
- must remain readable with the shared typography tokens
- is shared across Home / Domain / Work for the same project
- must not be generated from a project-id hash

## Interaction contract

Desktop fine pointer:

- no whole-card lift
- no page-specific shadow behavior
- Lead Visual may use the shared restrained zoom
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

Required review path:

Home / Domain / Work → ProjectCard → `/work/{slug}` → browser Back

The whole card and its visible `View case` affordance must resolve to the same destination without nested competing links.

## Responsive contract

Reference widths:

- 1419
- 871
- 430

Same-row cards of the same variant must align in outer height and media height where the page composition places them as peers.

## Governance

Forbidden:

- project-specific card renderer
- page-specific card hover
- page-specific card typography
- page-specific card media ratio
- alternate Lead Visual per page
- CSS background-image substitution for ProjectCard media
- duplicate ProjectCard CSS owner
- old and new ProjectCard systems active together
- `final`, `latest`, `new`, `fixed`, or version-suffixed asset files acting as SSOT

Any ProjectCard change requires regression checks across Home, Domain, Work and representative case-study routes before Human review.
