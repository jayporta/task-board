import type { BoardState, Column, Task } from '../types'
import { createCoreColumns, createEmptyBoard, FALLBACK_STATUS } from './board'

export const STORAGE_KEY = 'task-board:v1'

const isOptionalString = (value: unknown) => value === undefined || typeof value === 'string'

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.status === 'string' &&
    typeof task.created_at === 'string' &&
    isOptionalString(task.description) &&
    isOptionalString(task.due_at)
  )
}

function isColumn(value: unknown): value is Column {
  if (typeof value !== 'object' || value === null) return false
  const column = value as Record<string, unknown>
  return (
    typeof column.id === 'string' &&
    typeof column.label === 'string' &&
    typeof column.status === 'string' &&
    typeof column.created_at === 'string'
  )
}

/** Keeps the first record for each key — ids and column statuses must be unique. */
function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const value = key(item)
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

/**
 * Reads the saved board, falling back to an empty one for anything unexpected —
 * a corrupt or hand-edited entry should not white-screen the app.
 */
export function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyBoard()

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return createEmptyBoard()

    const { tasks, columns } = parsed as Record<string, unknown>
    if (!Array.isArray(tasks) || !Array.isArray(columns)) return createEmptyBoard()

    const storedColumns = dedupeBy(
      dedupeBy(columns.filter(isColumn), (column) => column.id),
      (column) => column.status,
    )

    // Losing a core column would strand its tasks, so put any missing ones back.
    const restored = createCoreColumns().filter(
      (core) => !storedColumns.some((column) => column.status === core.status),
    )
    const nextColumns = [...restored, ...storedColumns]
    const statuses = new Set(nextColumns.map((column) => column.status))

    return {
      columns: nextColumns,
      tasks: dedupeBy(tasks.filter(isTask), (task) => task.id).map((task) =>
        statuses.has(task.status) ? task : { ...task, status: FALLBACK_STATUS },
      ),
    }
  } catch {
    return createEmptyBoard()
  }
}

/** Persistence is best-effort: a full or blocked quota should not break the UI. */
export function saveBoard(state: BoardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}
