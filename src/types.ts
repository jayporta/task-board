export const CORE_STATUSES = ['todo', 'in_progress', 'done'] as const

export type CoreStatus = (typeof CORE_STATUSES)[number]

/**
 * The core statuses are fixed, but custom columns contribute their own status
 * keys. The `string & {}` arm keeps editor autocomplete for the core values
 * while still accepting custom ones.
 */
export type Status = CoreStatus | (string & {})

export type Task = {
  /** uuid — primary key. */
  id: string
  /** May be empty; rendered as "Untitled task" until filled in. */
  title: string
  description?: string
  /** References a column's `status`, not its `id`. */
  status: Status
  /** ISO 8601 — survives the JSON round trip through localStorage. */
  created_at: string
  due_at?: string
}

export type Column = {
  /** uuid — primary key. */
  id: string
  label: string
  /** The key tasks point at. Core columns keep 'todo' | 'in_progress' | 'done'. */
  status: Status
  created_at: string
}

export type BoardState = {
  tasks: Task[]
  columns: Column[]
}
