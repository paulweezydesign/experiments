# Fieldnotes

A local-only dashboard for tracking isolated product experiments from proposal through promotion or archive.

## Run locally

```bash
npm install
npm run dev
```

Experiment metadata lives in `src/data/experiments.json`, while longer-form findings live in `src/data/findings/*.md`. The app bundles these files at build time and does not use a database, deployment service, or external integration.

## Commands

- `npm run dev` — start the local development server
- `npm run test` — run component and utility tests
- `npm run build` — type-check and create a production build for local preview
- `npm run lint` — run ESLint
