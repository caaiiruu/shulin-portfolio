# Interactive State

Status: Live / Current Production  
CSS Owner: `assets/css/system-v72.css`  
Token Source: `assets/css/tokens-v72.css`

## Variants

- Selected: solid semantic surface, explicit on-state text, and persistent border.
- Disabled: readable semantic surface and text; never communicated by opacity alone.
- Current: selected navigation or tab state with an additional border/ring cue.

## Usage

Search chips, Work filters, Domain navigation, and Horizontal Rail controls.

## Modification boundary

Extend the shared selector only when a production control adopts the same state contract. Do not add raw state colours or page-level disabled/selected overrides.
