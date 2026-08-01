# AGENTS.md

This file provides guidance to AI when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) and produce a production build via Vite
- `npm run lint` — run ESLint over the project
- `npm test` — run the unit tests once
- `npm run test:watch` — run the tests in watch mode
- `npm run preview` — serve the production build locally

## Architecture

A Vite + React 19 + TypeScript task board using MUI v9 for the component layer, with `@mui/x-date-pickers` and `dayjs` for due dates. Everything is client-side; there is no backend.

```
src/
  lib/         pure logic, no React imports — reducer, storage, dates, theme, drag mime
  hooks/       state and side effects — useBoard, useTaskDrag, useTaskDropTarget
  context/     board state shared across the tree
  components/  presentation
```

**Decisions live in `lib/`, components stay thin.** `lib/board.ts` holds the reducer and every behaviour rule — what a blank title means, which columns may be deleted, how search matches. Behaviour changes belong there, not in a component, which is also what keeps the tests fast and DOM-free.

**Components read state from context, not props.** `useBoardContext()` (`src/context/boardContext.ts`) exposes `board`, `dispatch`, the search `query`, the open details task, and the focus target. `Board`, `TaskCard`, `BoardColumn`, `TaskForm`, `SearchResults`, and `useTaskDropTarget` all reach for it directly. Do not thread callbacks down through components — if something needs board state, take it from context.

**One component per file, no exceptions.** `App` composes the providers and the layout shell; everything it renders lives in `components/`, including `Board`, which exists solely to read the columns off the context. Dialogs are split across two files rather than one — a thin `*Dialog` wrapper alongside its `*Form` (`TaskDialog`/`TaskForm`, `AddColumnDialog`/`AddColumnForm`) — so the form can mount fresh each time the dialog opens.

### Data model — `src/types.ts`

```ts
Task   { id, title, description?, status, created_at, due_at? }
Column { id, label, status, created_at }
```

- **A task's `status` references a column's `status`, never its `id`.** Both records carry UUID primary keys, but the join is on the status key, so a stored task still reads `status: "todo"`. Custom columns get a slug of their label.
- **A column is deletable exactly when its status is not one of `CORE_STATUSES`** — `isCoreColumn()` derives it, so there is no stored `removable` flag to fall out of sync.
- **Blank task titles are allowed** and render via `displayTitle()` as "Untitled task". Column labels are not: they have no rename path, so `validateColumnLabel()` rejects blank, unsluggable, and duplicate names up front.

### Reducer actions worth knowing

`rename_task` and `set_due_date` exist **alongside** `edit_task`, not instead of it. `edit_task` writes every field and backs the details dialog; the other two write one field each and back the inline controls on the card. Reusing `edit_task` for an inline edit would silently wipe the fields that edit did not touch.

`delete_column` rehomes its tasks to `FALLBACK_STATUS` rather than orphaning them. That constant is typed `CoreStatus` on purpose — the fallback must name a column that cannot itself be deleted. `CREATE_STATUS` is separate despite holding the same value: it answers "where does the add button live", which is a UI question.

### Persistence

`lib/storage.ts` reads and writes the whole board under `task-board:v1`, and `useBoard` is the only place state and storage meet. `loadBoard()` is deliberately defensive — malformed JSON, wrong-shaped records, duplicate ids, missing core columns, and tasks pointing at a column that no longer exists all resolve to a working board rather than a blank screen. Keep it that way when changing the schema.

MUI owns the light/dark mode via `colorSchemes` and `defaultMode="system"` (`src/lib/theme.ts`), persisting under `task-board:mode`. Read or set it with `useColorScheme()`; do not hand-roll mode state.

## Conventions and constraints

- `tsconfig.app.json` sets `verbatimModuleSyntax` and `erasableSyntaxOnly`: use `import type`, and no `enum` or constructor parameter properties. `noUnusedLocals` means `npm run build` fails on leftover imports.
- Tests run in the default **node** environment and stub `localStorage` with an in-memory `Storage` via `vi.stubGlobal`. jsdom does not provide a working `Storage` on current Node, and stubbing is deterministic regardless. Import Vitest helpers explicitly.
- Prefer an MUI component or prop over hand-rolled markup, and theme tokens over hardcoded values. Shared styling that repeats across files belongs in `theme.components`.
- The spec for this project rules out a backend, routing, and state libraries (Redux/MobX/react-query). Plain hooks plus context are the right size — do not add state machinery.

## Rules

- Run unit tests after changing code to prevent regression and introducing new bugs.
- Always write doc comments for variables and types. Every type, every member of a type, and every exported constant gets a `/** … */`, so hovering it in an editor explains what it is for. Say why the thing exists or what it is used for — not a restatement of its name. `/** ISO 8601 — survives the JSON round trip through localStorage. */` earns its place; `/** The task's id. */` does not.
