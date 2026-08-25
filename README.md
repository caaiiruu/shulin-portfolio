# Shulin Chou Portfolio

Source repository for Shulin Chou’s product design portfolio.

## Install and verify

```bash
npm ci
npm test
```

## Local development

```bash
npm run dev
```

## Project structure

The portfolio application, content, assets, design-system styles, and automated QA live in this repository. Generated production bundles should not be edited directly; update their canonical source files and rebuild through the project scripts.

## Development workflow

Changes are developed and reviewed through branches and pull requests. Automated checks validate the build, content integrity, and regression coverage before changes are integrated.

Production deployment is managed separately from day-to-day repository changes.
