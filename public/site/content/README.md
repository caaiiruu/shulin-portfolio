# Portfolio content SSOT

Production owner: `portfolio-content.json`

This is the only editable content database used by the website. Replace this
file in place; never create release-named, numbered, `new`, `final`, `latest`,
or `fixed` copies.

## What lives here

- `search`: short chips, full queries, weighted matching terms, fallback work
- `projects`: all Work cards and detail content
- `experiments`: all Experiment cards and detail content
- `matcher`: recruiter-facing search answers and ranked project IDs
- `domains`: domain conclusions, problems, patterns, and related project IDs
- `relations`: reusable matching metadata
- `profile.caseLinks`: experience-to-case and experience-to-experiment links
- `assets`: canonical media references and accessibility metadata

## Relationship model

Every Work and Experiment item uses stable IDs in six dimensions:

- `problem`: the user or business problem
- `capability`: what Shulin demonstrated
- `domain`: product or operating context
- `principle`: reusable design principle
- `evidence`: available proof type
- `career`: employer or experience linkage

Visible copy must not be duplicated inside relations. Matching systems compare
stable IDs and then display copy from the matched entity.

## Editing rules

- Keep IDs stable; change visible labels and copy, not IDs.
- Keep English and Chinese fields together.
- Use `null` for unknown content. Never invent metrics, dates, employers,
  claims, or evidence.
- Search-chip labels stay concise: English 24 characters or fewer; Chinese
  8 characters or fewer. Full natural-language questions belong in `query`.
- A project must retain transformation, problem types, At a glance, My role,
  Scale & reach, Design strategy, Audience, Why it mattered, and Business
  impact.
- Use `editorialPolicy.allowedStatuses` for content workflow.
- Use root-relative media URLs and add bilingual alt text before an asset is
  published.

The production gate validates structure, required fields, relation dimensions,
references, chip length, and duplicate content owners before deployment.
