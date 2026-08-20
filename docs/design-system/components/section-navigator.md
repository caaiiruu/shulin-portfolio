# SectionNavigator

Component: SectionNavigator
Status: Live / Current Production
React/JS Source: public/site/assets/js/app.js#renderProjectSectionNav
CSS Owner: public/site/assets/css/components/project-detail-overview.css (.floating-navigator)
Token Dependencies: --control-height, --page-gutter, shared color/focus tokens
Variants: Floating project-detail section rail
Usage Scope: All active project-detail dialogs
Figma Source: Not registered in repository; R164.9E Human interaction contract is authoritative for the current repair
Code Connect Status: Not registered
Allowed Modifications: Shared activation, active-state, accessibility and reduced-motion behavior
Forbidden Modifications: Page-specific handlers, duplicate navigator namespaces, globals.css overrides

Interaction contract:
- Pointer and keyboard activation prevent default anchor jumps.
- The dialog scroll owner performs smooth scrolling unless prefers-reduced-motion is reduce.
- The shared header/control inset is applied once.
- history.replaceState preserves the target hash without a second browser jump.
- Scroll position remains the source of truth for aria-current.
