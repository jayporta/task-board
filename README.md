# Task Board

A small task management board built with Vite, React 19, TypeScript and MUI. Tasks live in three columns — Todo, In Progress and Done — and persist to `localStorage`, so a refresh keeps your board.

## Running it

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Type-check with `tsc -b`, then build for production |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Run the tests in watch mode |

## What you can do

- **Create a task** from the Todo column header. The card appears immediately with its title focused, so you can type straight into it.
- **Edit a title** inline on the card — Enter commits, Escape reverts.
- **Add details** via the link under the title, which opens a dialog for a description and a due date.
- **Set a due date** by clicking the due-date chip on the card. Overdue dates turn red.
- **Move a task** by dragging it from the grip at the top of the card into another column.
- **Delete a task** with the bin icon, behind a confirmation.
- **Search** from the toolbar. Matches across every column, by title and description; clicking a result opens that task.
- **Add a column** with the `+` beside the last column. Custom columns can be deleted, and their tasks return to Todo.
- **Toggle dark mode** from the toolbar. The choice is remembered, and defaults to your system preference.

## How it is put together

```
src/
  lib/         pure logic — reducer, storage, dates, theme. No React.
  hooks/       state and side effects — board, drag and drop, theme mode
  context/     board state, shared without prop drilling
  components/  presentation
```

The rule is that decisions live in `lib/` and components stay thin. `lib/board.ts` holds the reducer and every behaviour rule — what a blank title means, which columns can be deleted, how search matches — which is also what the unit tests cover.

A few decisions worth knowing:

- **A task's `status` refers to a column's `status`, not its `id`.** Both records have UUID primary keys, but tasks point at the status key, so a stored task still reads `status: "todo"` as the spec describes. Custom columns get a slug of their label.
- **Blank titles are allowed.** Creating a task shouldn't require naming it first; untitled tasks render as "Untitled task" and can be named later.
- **`rename_task` and `set_due_date` are separate reducer actions** from `edit_task`. Inline edits change one field, and reusing the full-form action would wipe the others.
- **Loading from storage is defensive.** Malformed JSON, missing core columns, or tasks pointing at a column that no longer exists all resolve to a working board rather than a blank screen.

State is plain `useReducer` plus context — no state library, which is the right size for this app.
