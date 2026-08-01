/** The three columns every board starts with, and the ones it cannot lose. */
export const CORE_STATUSES = ['todo', 'in_progress', 'done'] as const

/**
 * A status belonging to a column that cannot be deleted — what `isCoreColumn()`
 * tests for, and the reason `FALLBACK_STATUS` is typed this way.
 */
export type CoreStatus = (typeof CORE_STATUSES)[number]

/**
 * The core statuses are fixed, but custom columns contribute their own status
 * keys. The `string & {}` arm keeps editor autocomplete for the core values
 * while still accepting custom ones.
 */
export type Status = CoreStatus | (string & {})

/** A single card on the board. */
export type Task = {
  /** uuid — primary key. */
  id: string
  /** May be empty; rendered as "Untitled task" until filled in. */
  title: string
  /** Long-form notes, edited only through the details dialog. Absent when blank. */
  description?: string
  /** References a column's `status`, not its `id`. */
  status: Status
  /** ISO 8601 — survives the JSON round trip through localStorage. */
  created_at: string
  /** ISO 8601 due date. Absent when the task has no deadline. */
  due_at?: string
}

/** A column on the board. Core columns are fixed; the rest are user-added. */
export type Column = {
  /** uuid — primary key. */
  id: string
  /** Shown in the header. Fixed at creation — there is no rename path. */
  label: string
  /** The key tasks point at. Core columns keep 'todo' | 'in_progress' | 'done'. */
  status: Status
  /** ISO 8601 — survives the JSON round trip through localStorage. */
  created_at: string
}

/** The entire board, and the unit that is persisted and reduced as a whole. */
export type BoardState = {
  /** Every task across every column; grouped for display by `visibleTasks()`. */
  tasks: Task[]
  /** Displayed left to right in this order, core columns first. */
  columns: Column[]
}
