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

InteractiveTransactionLab keeps one customer-phone frame and one cashier/self-checkout frame inside a bounded stage. Selecting a product decision updates both surfaces; selecting Phone, Cashier / SCO, or Connected view changes visual emphasis without hiding the system relationship. Controls support click, tap, focus and arrow-key traversal, while reduced-motion preferences remove transition effects.
