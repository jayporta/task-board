import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '../types'
import { createEmptyBoard } from './board'
import { loadBoard, saveBoard, STORAGE_KEY } from './storage'

const task: Task = {
  id: 'task-1',
  title: 'Persisted task',
  status: 'todo',
  created_at: '2026-07-01T10:00:00.000Z',
  due_at: '2026-08-01T00:00:00.000Z',
}

/** Enough of the Storage interface for these tests, with no environment surprises. */
function memoryStorage(): Storage {
  const entries = new Map<string, string>()
  return {
    get length() {
      return entries.size
    },
    key: (index) => [...entries.keys()][index] ?? null,
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => void entries.set(key, String(value)),
    removeItem: (key) => void entries.delete(key),
    clear: () => entries.clear(),
  }
}

describe('storage', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()))
  afterEach(() => vi.unstubAllGlobals())

  it('round-trips a board', () => {
    const state = { ...createEmptyBoard(), tasks: [task] }
    saveBoard(state)

    expect(loadBoard()).toEqual(state)
  })

  it('recovers a usable board from unusable stored data', () => {
    // Corrupt entries, hand-edited JSON and a stranded task must never leave the
    // user staring at a blank screen.
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadBoard().columns.map((column) => column.status)).toEqual([
      'todo',
      'in_progress',
      'done',
    ])

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tasks: [task, { id: 7 }], columns: [] }),
    )
    const repaired = loadBoard()
    expect(repaired.tasks).toEqual([task])
    expect(repaired.columns).toHaveLength(3)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tasks: [{ ...task, status: 'gone' }], columns: createEmptyBoard().columns }),
    )
    expect(loadBoard().tasks[0].status).toBe('todo')
  })
})
