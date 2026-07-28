import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Column, Task } from '../types'
import { createEmptyBoard } from './board'
import { loadBoard, saveBoard, STORAGE_KEY } from './storage'

const task: Task = {
  id: 'task-1',
  title: 'Persisted task',
  status: 'todo',
  created_at: '2026-07-01T10:00:00.000Z',
  due_at: '2026-08-01T00:00:00.000Z',
}

const customColumn: Column = {
  id: 'column-1',
  label: 'Blocked',
  status: 'blocked',
  created_at: '2026-07-01T10:00:00.000Z',
}

const coreColumns = () => createEmptyBoard().columns
const statusesOf = (columns: Column[]) => columns.map((column) => column.status)

function store(value: unknown) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
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

describe('loadBoard', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()))
  afterEach(() => vi.unstubAllGlobals())

  it('returns a seeded board when nothing is stored', () => {
    expect(statusesOf(loadBoard().columns)).toEqual(['todo', 'in_progress', 'done'])
    expect(loadBoard().tasks).toEqual([])
  })

  it('round-trips a saved board', () => {
    const state = { columns: [...coreColumns(), customColumn], tasks: [task] }
    saveBoard(state)
    expect(loadBoard()).toEqual(state)
  })

  it('falls back for malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(statusesOf(loadBoard().columns)).toEqual(['todo', 'in_progress', 'done'])
  })

  it('falls back for valid JSON of the wrong shape', () => {
    store({ tasks: 'nope', columns: 3 })
    expect(loadBoard().tasks).toEqual([])
  })

  it('survives storage being unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
    expect(loadBoard().tasks).toEqual([])
    expect(() => saveBoard(createEmptyBoard())).not.toThrow()
  })

  it('drops entries that are not tasks', () => {
    store({ tasks: [task, { id: 7 }, null], columns: coreColumns() })
    expect(loadBoard().tasks).toEqual([task])
  })

  it('drops entries that are not columns', () => {
    store({ tasks: [], columns: [...coreColumns(), { id: 'x' }, customColumn] })
    expect(statusesOf(loadBoard().columns)).toEqual(['todo', 'in_progress', 'done', 'blocked'])
  })

  it('drops duplicate task ids and duplicate column statuses', () => {
    store({
      tasks: [task, { ...task, title: 'Duplicate' }],
      columns: [...coreColumns(), customColumn, { ...customColumn, id: 'column-2' }],
    })
    const loaded = loadBoard()

    expect(loaded.tasks).toHaveLength(1)
    expect(loaded.tasks[0].title).toBe('Persisted task')
    expect(statusesOf(loaded.columns)).toEqual(['todo', 'in_progress', 'done', 'blocked'])
  })

  it('restores missing core columns', () => {
    store({ tasks: [], columns: [customColumn] })
    expect(statusesOf(loadBoard().columns)).toEqual(['todo', 'in_progress', 'done', 'blocked'])
  })

  it('rehomes tasks whose status matches no column', () => {
    store({ tasks: [{ ...task, status: 'gone' }], columns: coreColumns() })
    expect(loadBoard().tasks[0].status).toBe('todo')
  })
})
