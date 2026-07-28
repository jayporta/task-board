# AGENTS.md

This file provides guidance to AI when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) and produce a production build via Vite
- `npm run lint` — run ESLint over the project
- `npm run preview` — serve the production build locally

There is no test runner configured in this project yet.

## Architecture

This is a Vite + React 19 + TypeScript app, currently at initial scaffold state (unmodified `create-vite` React-TS template plus a custom hero image). All application code lives in `src/`:

- `src/main.tsx` — entry point, mounts `<App />` into `#root`
- `src/App.tsx` — currently the only component; the "task board" application logic has not been built out yet
- `src/assets/` — static images imported by components
- `public/` — static files served as-is (`favicon.svg`, `icons.svg` referenced via `<use href="/icons.svg#...">`)

TypeScript is split into two project references: `tsconfig.app.json` (browser code in `src/`, bundler module resolution, `verbatimModuleSyntax` on) and `tsconfig.node.json` (config files like `vite.config.ts`). ESLint config (`eslint.config.js`) uses flat config with `typescript-eslint` recommended rules, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` (Vite-only ruleset, not type-aware).

## Rules

- Write unit test for custom functions.
