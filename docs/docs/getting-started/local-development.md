---
sidebar_position: 2
---

# Local Development

## Install dependencies

```bash
nvm use
npm install
```

## Run in development mode

Uses `ts-node` — no compile step needed:

```bash
npm run dev
```

## Build and run compiled output

```bash
npm run build
npm start
```

The server listens on port `8888` by default. Override with `PORT`:

```bash
PORT=9000 npm start
```

## Run tests

```bash
npm test
```

Coverage thresholds are enforced at 80% statements/functions/lines and 75% branches. The report is written to `coverage/` after each run.

## Lint

```bash
npm run lint
```

ESLint runs with `@typescript-eslint/recommended` rules. `console` calls are errors — use the `pino` logger instead.

## Pre-commit hooks

Husky runs lint-staged automatically before every commit. Any staged `src/**/*.ts` file is checked with ESLint and `tsc --noEmit`. The commit is blocked if either fails.
