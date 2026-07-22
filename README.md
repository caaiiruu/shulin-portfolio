# Shulin Chou Portfolio

This repository is the GitHub-ready source snapshot for the deployed Portfolio v44 baseline.

## Baseline

- Source ancestor: `19086bb` (`Preserve project overview render targets`)
- Snapshot: canonical v44 working tree recovered from the deployed Sites build
- Production URL: <https://shulin-portfolio-v53.dr-piipii.chatgpt.site/>
- Node.js: `>=22.13.0`

This snapshot intentionally comes before the next visual-QA corrections. Treat it as the recovery checkpoint and create future changes on branches or pull requests.

## Install and verify

```bash
npm ci
npm test
```

The test command validates design-system governance, builds the production worker, and runs the rendered HTML regression suite.

## Local development

```bash
npm run dev
```

The root route redirects to `/site/index.html`. The editable portfolio source is under `public/site/`.

## Canonical ownership

- Project content: `public/site/assets/js/project-ssot.js`
- Base project data/schema: `public/site/assets/js/data.js`
- Tokens: `public/site/assets/css/tokens.css`
- Global/page layout: `public/site/assets/css/base.css`
- Component styles: `public/site/assets/css/components/`
- Current component registry: `public/site/docs/design-system/registry.current.json`
- Production bundle builder: `scripts/build-production-assets.mjs`

Files named `production.<hash>.css` and `production.<hash>.js` are generated outputs. Edit the canonical files above, then rebuild.

## Repository rules

The supplied portfolio, Figma, design-system registry, and visual-QA rules are preserved under `docs/project-rules/`.

Do not start future work from the unrelated `portfolio-v56-source` static package. Its version number belongs to a separate historical line and it is not this canonical Sites baseline.

## GitHub workflow

The included GitHub Actions workflow runs `npm ci` and `npm test` for pushes and pull requests. Recommended setup:

1. Upload this folder to a new private repository.
2. Commit it as `Portfolio v44 recovered baseline`.
3. Protect `main` and require the `test` check.
4. Make visual-QA and content changes in separate branches.

## Deployment note

`.openai/hosting.json` preserves the current Sites project mapping. GitHub is the source of truth; a Vercel migration should be handled as a separate, verified deployment change rather than mixed into this recovery commit.
