import type { BoardState, Column, CoreStatus, Status, Task } from '../types'
import { CORE_STATUSES } from '../types'

/** Where tasks land when their column is deleted, and the default for new tasks. */
export const FALLBACK_STATUS: Status = 'todo'

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
): Task {
  return {
    id: newId(),
    title: normalizeTitle(title),
    ...(optionalText(description) ? { description: optionalText(description) } : {}),
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

/** Tasks in one column, narrowed by an optional search query, newest first. */
export function visibleTasks(tasks: Task[], status: Status, query = ''): Task[] {
  const needle = query.trim().toLowerCase()

  return tasks
    .filter((task) => task.status === status)
    .filter((task) => {
      if (!needle) return true
      return `${task.title} ${task.description ?? ''}`.toLowerCase().includes(needle)
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export type BoardAction =
  | { type: 'add_task'; title: string; description?: string; status: Status; due_at?: string }
  | { type: 'edit_task'; id: string; title: string; description?: string; due_at?: string }
  | { type: 'move_task'; id: string; status: Status }
  | { type: 'delete_task'; id: string }
  | { type: 'add_column'; label: string }
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
          createTask(action.title, status, action.description, action.due_at),
        ],
      }
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

    default:
      return state
  }
}
