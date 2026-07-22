
# Real Safari and device QA

Playwright WebKit catches many Safari rendering problems but is not the installed Safari application.
Final release still requires:

- Current macOS Safari
- One physical iPhone in portrait
- VoiceOver keyboard/focus pass when accessibility is release-critical

The automated package removes manual screenshot work for Chromium and WebKit. Physical-device verification cannot be completed inside the current Linux container.
