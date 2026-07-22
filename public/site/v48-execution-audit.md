# Portfolio v48 — execution correction audit

## Why v47 still had visible errors

- The registry described ownership but did not enforce stylesheet loading or selector ownership.
- Historical component rules remained active in `site-base.css`.
- Later overrides fixed individual screenshots but preserved conflicting geometry.
- Custom cursor feedback created the floating Open / Explore labels.
- Runtime browser QA was not completed before delivery.

## v48 structural corrections

- One active component stylesheet owner.
- Automated design-system lint.
- Custom cursor feedback removed.
- Mobile Domain uses sticky horizontal chips.
- Principle evidence is a separate supporting-case action.
- Mobile Work and Experiment cards have explicit maximum heights.
- Experiment hover preserves semantic card colour.
- Popup section numbering is reduced and decisions use descriptive labels.
- Browser-native `/qa` page replaces the Playwright requirement.

## Honest limitation

The container Chromium process still cannot start reliably. Vercel deployment improves real HTTP loading and gives a stable preview URL, but it does not repair this container-level Chromium failure. `/qa` executes the required DOM/runtime assertions in the visitor's real browser without installing Playwright. Full Safari visual comparison still requires Safari or screenshots from that browser.
