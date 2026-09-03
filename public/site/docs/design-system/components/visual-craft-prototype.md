# VisualCraftPrototype

- Status: Live / Current Production on isolated prototype branch only
- React Source: Not applicable; static template plus runtime enhancement
- Render Source: `site-source/templates/index.html`, `public/site/assets/js/visual-craft-prototype.js`
- CSS Owner: `public/site/assets/css/components/visual-craft-prototype.css`
- Token Dependencies: Existing semantic colour, spacing, typography, radius and motion tokens
- Variants: ProductComposition, VisualFirstProjectCard, ProductSequence, InteractiveTransactionLab, PrincipleEvidence
- Usage Scope: Homepage prototype and Payment prototype only
- Figma Source: None
- Code Connect Status: Not applicable
- Allowed Modifications: Prototype-only composition, responsive behaviour, accessibility and motion
- Forbidden Modifications: Approved content facts, metrics, research, ownership, production routes and shared production component ownership

This owner deliberately groups the five V1 prototype primitives until the visual direction is validated. Split ownership only when the direction is approved for wider rollout.

InteractiveTransactionLab uses approved shopper voice and journey questions as the control layer around one bounded product stage. Selecting a question changes the corresponding real product evidence and concise design consequence. Controls support click, tap, focus and arrow-key traversal.

Video is progressive enhancement only. The lightweight H.264 source has no initial `src`, uses `preload="none"`, is attached only when its question is selected near the viewport, pauses and detaches when inactive, and falls back to a small WebP poster. Reduced-motion preferences always receive the poster rather than autoplay video.
