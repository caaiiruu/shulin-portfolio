# Figma MCP Uncertainty Verification Rule

## Purpose

When implementation details are unclear, Figma is the visual source of truth.

The AI must not guess layout, spacing, asset behavior, responsive behavior, or component structure when the Figma node can be inspected through MCP.

---

## Core Rule

If there is uncertainty about how a design should be implemented, stop coding and inspect the relevant Figma node through MCP before modifying code.

This applies to:

- Layout structure
- Asset positioning
- SVG / PNG usage
- Responsive behavior
- Typography
- Spacing
- Z-index / layering
- Section height
- Component ownership
- Visual hierarchy
- Interaction details

---

## Required Flow

Before implementing an uncertain design detail:

1. Use Figma MCP to inspect the relevant node.
2. Confirm the node ID, frame name, and visual structure.
3. Identify exact layout values from Figma when available.
4. Compare the Figma structure with the current repo structure.
5. Decide whether the repo needs:
   - Asset replacement
   - Component markup change
   - Component CSS change
   - Token update
   - Responsive rule update
6. Implement only the smallest scoped change.
7. Run build.
8. Run visual QA when the change affects layout or visuals.

---

## Forbidden

Do not guess:

- Positions
- Dimensions
- Responsive values
- Asset behavior
- Typography values
- Section height
- Cloud / SVG / hero image placement
- Component structure

Do not continue patching if the result visually diverges from Figma.

Do not stack CSS overrides when the Figma structure has not been rechecked.

---

## Special Asset Rule

If a Figma asset behaves differently from the exported file, inspect the Figma node structure again.

Example:

If Figma uses:

- An outer container
- An inner image
- Overflow beyond the container

Do not replace it with a simple CSS background unless that preserves the same behavior.

---

## Hero / SVG Rule

Hero image or SVG placement must be checked in Figma before calibration.

Do not tune hero SVG position by guessing `bottom`, `left`, `width`, or `height` repeatedly.

If the first calibration fails:

1. Stop.
2. Return to Figma MCP.
3. Audit the actual Figma node structure.
4. Compare Figma structure with current DOM / CSS ownership.
5. Modify markup or CSS only after the mismatch is confirmed.

---

## Figma First When Uncertain

When the AI is not sure whether the issue comes from Figma design, asset export, DOM structure, CSS ownership, responsive behavior, or visual interpretation:

1. Stop.
2. Pull the relevant Figma node again through MCP.
3. Inspect the Figma structure before giving a new terminal command.
4. Do not proceed based on memory or assumption.

This rule applies even if a previous Figma check was already done, because the inspected node may have been incomplete, misunderstood, or changed.

---

## Design-System Compatibility

Figma MCP is used to understand the design, but implementation must still follow the project design system.

All implementation must:

- Reuse existing components when possible
- Respect CSS ownership
- Avoid `globals.css` patches
- Avoid duplicate selectors
- Avoid one-off implementations
- Keep changes reversible
- Include backup before modification
- Run build after modification

---

## Visual QA Rule

After any Figma-informed visual change:

1. Run build.
2. Generate visual QA screenshots through the existing QA script.
3. Review desktop / tablet / mobile against the Figma reference.
4. Clean up QA screenshots after review.
5. Do not continue to the next fix until the current visual delta is understood.

---

## Failure Handling

If a Figma-based implementation fails once:

1. Stop patching.
2. Do not append another override.
3. Do not add another `!important`.
4. Audit:
   - Actual DOM class
   - Active CSS sources
   - Import order
   - Duplicate selectors
   - Figma node structure
   - Asset behavior
5. Remove or disable conflicting legacy CSS before applying a new scoped fix.

---

## Example: Hero Arm SVG

If the Figma hero arm is structured as:

- Outer container: `bottom: 123px`, `height: 271px`, `left: -180px`, `width: 782px`
- Inner image: overflowing with custom inset values

Then implementation should not use only:

```css
background-image: url("/figma-assets/home-hero-arm.svg");
background-size: contain;
```

Instead, inspect whether the repo markup should become:

```tsx
<div className="home-hero__arm" aria-hidden="true">
  <img src="/figma-assets/home-hero-arm.svg" alt="" />
</div>
```

Then CSS should reproduce the Figma outer container and inner image overflow behavior.

---

## One-Sentence Rule

When unsure, do not guess: go back to Figma MCP, inspect the node, compare it with the repo, then make the smallest reversible change.
