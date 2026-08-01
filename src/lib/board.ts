import type { BoardState, Column, CoreStatus, Status, Task } from '../types'
import { CORE_STATUSES } from '../types'

/**
 * Where orphaned tasks land: when their column is deleted, or when a stored
 * task's status matches no column. Typed as a core status so it can only ever
 * name a column that cannot itself be deleted.
 */
export const FALLBACK_STATUS: CoreStatus = 'todo'

/** The column new tasks are created in, and the only one with an add control. */
export const CREATE_STATUS: CoreStatus = 'todo'

/** Shown in place of a title the user has not filled in yet. */
export const UNTITLED_LABEL = 'Untitled task'

const CORE_COLUMN_LABELS: Record<CoreStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
}

/**
 * `crypto.randomUUID` needs a secure context, which covers localhost and any
 * https deploy — the fallback just keeps ids working anywhere else.
 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createCoreColumns(): Column[] {
  const created_at = new Date().toISOString()
  return CORE_STATUSES.map((status) => ({
    id: newId(),
    label: CORE_COLUMN_LABELS[status],
    status,
    created_at,
  }))
}

export function createEmptyBoard(): BoardState {
  return { tasks: [], columns: createCoreColumns() }
}

export function isCoreColumn(column: Column): boolean {
  return (CORE_STATUSES as readonly string[]).includes(column.status)
}

/** Titles are stored trimmed, and may legitimately end up empty. */
export function normalizeTitle(raw: string): string {
  return raw.trim()
}

export function isBlank(raw: string): boolean {
  return normalizeTitle(raw).length === 0
}

/**
 * Tasks can be created without a title so capture stays fast — the title is
 * filled in later via edit. Untitled tasks still need something to render.
 */
export function displayTitle(task: Task): string {
  return task.title || UNTITLED_LABEL
}

/**
 * Turns a column label into the status key its tasks will carry:
 * "In Review" -> "in_review". Empty when the label has nothing to slug.
 */
export function toStatusKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Why a column label was rejected. `'blank'` covers both an empty label and one
 * that slugs to nothing ("!!!"); `'duplicate'` covers a clash on either the
 * label or the status key it slugs to.
 */
export type ColumnLabelError = 'blank' | 'duplicate'

/**
 * Columns have no rename path, so a label must be usable up front: it needs a
 * slug, and it cannot collide with a column that already exists.
 */
export function validateColumnLabel(label: string, columns: Column[]): ColumnLabelError | null {
  const status = toStatusKey(label)
  if (isBlank(label) || !status) return 'blank'

  const normalized = normalizeTitle(label).toLowerCase()
  const clashes = columns.some(
    (column) => column.label.toLowerCase() === normalized || column.status === status,
  )
  return clashes ? 'duplicate' : null
}

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function createTask(
  title: string,
  status: Status,
  description?: string,
  due_at?: string,
  id: string = newId(),
): Task {
  const text = optionalText(description)

  return {
    id,
    title: normalizeTitle(title),
    ...(text ? { description: text } : {}),
    status,
    created_at: new Date().toISOString(),
    ...(due_at ? { due_at } : {}),
  }
}

export function createColumn(label: string): Column {
  return {
    id: newId(),
    label: normalizeTitle(label),
    status: toStatusKey(label),
    created_at: new Date().toISOString(),
  }
}

const newestFirst = (a: Task, b: Task) => b.created_at.localeCompare(a.created_at)

/** Tasks in one column, newest first. */
export function visibleTasks(tasks: Task[], status: Status): Task[] {
  return tasks.filter((task) => task.status === status).sort(newestFirst)
}

/**
 * Tasks matching a search, across every column. Empty for a blank query, so an
 * untouched search box shows no results rather than the whole board.
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []

  return tasks
    .filter((task) => `${task.title} ${task.description ?? ''}`.toLowerCase().includes(needle))
    .sort(newestFirst)
}

/** Every way the board can change. The reducer is the only thing that applies these. */
export type BoardAction =
  /** `id` may be supplied so the caller can focus the card it just created. */
  | {
      type: 'add_task'
      id?: string
      title: string
      description?: string
      status: Status
      due_at?: string
    }
  /** Writes every field, backing the details dialog — omitted fields are cleared. */
  | { type: 'edit_task'; id: string; title: string; description?: string; due_at?: string }
  /** Title-only update, so inline renaming cannot clear the other fields. */
  | { type: 'rename_task'; id: string; title: string }
  /** Due-date-only update, set from the card without opening the details dialog. */
  | { type: 'set_due_date'; id: string; due_at?: string }
  /** Sends a task to another column. Ignored when no column holds `status`. */
  | { type: 'move_task'; id: string; status: Status }
  | { type: 'delete_task'; id: string }
  /** Ignored when `validateColumnLabel()` rejects the label. */
  | { type: 'add_column'; label: string }
  /** Rehomes the column's tasks to `FALLBACK_STATUS`. Ignored for core columns. */
  | { type: 'delete_column'; id: string }

const hasStatus = (state: BoardState, status: Status) =>
  state.columns.some((column) => column.status === status)

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'add_task': {
      const status = hasStatus(state, action.status) ? action.status : FALLBACK_STATUS
      return {
        ...state,
        tasks: [
          ...state.tasks,
          createTask(action.title, status, action.description, action.due_at, action.id),
        ],
      }
    }

    case 'rename_task':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, title: normalizeTitle(action.title) } : task,
        ),
      }

    case 'edit_task':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                title: normalizeTitle(action.title),
                description: optionalText(action.description),
                due_at: action.due_at || undefined,
              }
            : task,
        ),
      }

    case 'set_due_date':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, due_at: action.due_at || undefined } : task,
        ),
      }

    case 'move_task': {
      if (!hasStatus(state, action.status)) return state
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, status: action.status } : task,
        ),
      }
    }

    case 'delete_task':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) }

    case 'add_column': {
      if (validateColumnLabel(action.label, state.columns)) return state
      return { ...state, columns: [...state.columns, createColumn(action.label)] }
    }

    case 'delete_column': {
      const target = state.columns.find((column) => column.id === action.id)
      if (!target || isCoreColumn(target)) return state
      return {
        columns: state.columns.filter((column) => column.id !== action.id),
        tasks: state.tasks.map((task) =>
          task.status === target.status ? { ...task, status: FALLBACK_STATUS } : task,
        ),
      }
    }
  }
}
