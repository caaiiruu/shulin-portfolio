# Portfolio Skill Complete v2

This package has two layers:

## Full governance
`SKILL.md`
Use for:
- changing global rules
- architecture decisions
- onboarding a new AI agent
- auditing governance

## Token-saving Work execution
`CORE.md` + `registry.json` + one or two task-relevant reference files.
Use for normal Work mode rounds.

Work mode should NOT read the full SKILL.md every time.
This keeps the complete rules available while reducing repeated context tokens.

Recommended repo location:
`docs/portfolio-skill/`

Normal Work preamble:
`Read docs/portfolio-skill/CORE.md and registry.json. Load only the reference files relevant to this Work Order. Do not re-audit frozen rules.`

This package is a repo-level skill artifact; it is not automatically installed as a platform plugin skill.
