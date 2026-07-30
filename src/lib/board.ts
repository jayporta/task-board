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
 * What the confirm dialog says before a delete. One wording, whether the task
 * is being removed from its card or from the all-tasks list.
 */
export function deleteTaskPrompt(task: Task): { title: string; description: string } {
  return {
    title: 'Delete this task?',
    description: `"${displayTitle(task)}" will be removed from the board. This cannot be undone.`,
  }
}

/** The label of the column a task belongs to, falling back to the raw key. */
export function columnLabel(columns: Column[], status: Status): string {
  return columns.find((column) => column.status === status)?.label ?? status
}

export const SORT_KEYS = ['title', 'status', 'due_at'] as const
export type SortKey = (typeof SORT_KEYS)[number]
export type SortDirection = 'asc' | 'desc'

/** An empty list means no filter, so "all" and "nothing picked" are one state. */
export function filterTasksByStatus(tasks: Task[], statuses: Status[]): Task[] {
  if (statuses.length === 0) return tasks
  return tasks.filter((task) => statuses.includes(task.status))
}

const compareTitles = (a: Task, b: Task) =>
  displayTitle(a).localeCompare(displayTitle(b), undefined, { sensitivity: 'base' })

/** Column order, so ascending reads left to right like the board does. */
const compareStatuses = (columns: Column[]) => {
  const rank = (task: Task) => {
    const index = columns.findIndex((column) => column.status === task.status)
    return index === -1 ? columns.length : index
  }
  return (a: Task, b: Task) => rank(a) - rank(b)
}

/** Only ever reached for two dated tasks; `sortTasks` strands the rest first. */
const compareDueDates = (a: Task, b: Task) => (a.due_at ?? '').localeCompare(b.due_at ?? '')

/** A sorted copy — `newestFirst` breaks ties so the order is never arbitrary. */
export function sortTasks(
  tasks: Task[],
  columns: Column[],
  key: SortKey,
  direction: SortDirection,
): Task[] {
  const comparators: Record<SortKey, (a: Task, b: Task) => number> = {
    title: compareTitles,
    status: compareStatuses(columns),
    due_at: compareDueDates,
  }

  const compare = comparators[key]
  /**
   * An undated task is absent from the due-date order, not later than every
   * date, so it is pinned to the bottom outside the direction flip below.
   */
  const undated = (task: Task) => (key === 'due_at' && !task.due_at ? 1 : 0)
  const sign = direction === 'desc' ? -1 : 1

  return [...tasks].sort((a, b) => {
    const stranded = undated(a) - undated(b)
    if (stranded !== 0) return stranded

    const primary = compare(a, b)
    return primary === 0 ? newestFirst(a, b) : primary * sign
  })
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
  | { type: 'edit_task'; id: string; title: string; description?: string; due_at?: string }
  /** Title-only update, so inline renaming cannot clear the other fields. */
  | { type: 'rename_task'; id: string; title: string }
  /** Due-date-only update, set from the card without opening the details dialog. */
  | { type: 'set_due_date'; id: string; due_at?: string }
  | { type: 'move_task'; id: string; status: Status }
  | { type: 'delete_task'; id: string }
  /** Bulk clear-out from the all-tasks list, in one pass rather than one each. */
  | { type: 'delete_tasks'; ids: string[] }
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

    case 'delete_tasks': {
      const doomed = new Set(action.ids)
      return { ...state, tasks: state.tasks.filter((task) => !doomed.has(task.id)) }
    }

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
