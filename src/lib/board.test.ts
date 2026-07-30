import { describe, expect, it } from 'vitest'
import type { BoardState, Task } from '../types'
import {
  boardReducer,
  createEmptyBoard,
  displayTitle,
  filterTasksByStatus,
  searchTasks,
  sortTasks,
  UNTITLED_LABEL,
} from './board'

function boardWith(tasks: Task[]): BoardState {
  return { ...createEmptyBoard(), tasks }
}

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'id-1',
    title: 'Write the plan',
    status: 'todo',
    created_at: '2026-07-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('boardReducer', () => {
  it('accepts a blank title instead of rejecting it, so capture stays fast', () => {
    const next = boardReducer(createEmptyBoard(), { type: 'add_task', title: '   ', status: 'todo' })

    expect(next.tasks[0].title).toBe('')
    expect(displayTitle(next.tasks[0])).toBe(UNTITLED_LABEL)
  })

  it('renames a task without disturbing its other fields', () => {
    // Inline editing dispatches this rather than `edit_task`, which writes every
    // field — reusing that here would silently drop the description and due date.
    const original = task({ description: 'details', due_at: '2026-08-01T00:00:00.000Z' })
    const next = boardReducer(boardWith([original]), {
      type: 'rename_task',
      id: original.id,
      title: '  Renamed  ',
    })

    expect(next.tasks[0]).toEqual({ ...original, title: 'Renamed' })
  })

  it('moves a task to another column, and ignores a status no column owns', () => {
    const state = boardWith([task()])

    expect(boardReducer(state, { type: 'move_task', id: 'id-1', status: 'done' }).tasks[0].status)
      .toBe('done')
    // Returning the same object, not a copy, is what keeps a rejected action from re-rendering.
    expect(boardReducer(state, { type: 'move_task', id: 'id-1', status: 'ghost' })).toBe(state)
  })

  it('returns a deleted column’s tasks to Todo, and refuses to delete a core column', () => {
    const added = boardReducer(boardWith([task()]), { type: 'add_column', label: 'Blocked' })
    const custom = added.columns[added.columns.length - 1]
    const moved = boardReducer(added, { type: 'move_task', id: 'id-1', status: custom.status })

    const next = boardReducer(moved, { type: 'delete_column', id: custom.id })
    expect(next.columns.map((column) => column.status)).toEqual(['todo', 'in_progress', 'done'])
    expect(next.tasks[0].status).toBe('todo')

    expect(boardReducer(next, { type: 'delete_column', id: next.columns[0].id })).toBe(next)
  })

  it('deletes exactly the tasks named in a bulk delete', () => {
    const tasks = [task({ id: 'a' }), task({ id: 'b' }), task({ id: 'c' })]

    const next = boardReducer(boardWith(tasks), { type: 'delete_tasks', ids: ['a', 'c', 'ghost'] })
    expect(next.tasks.map((t) => t.id)).toEqual(['b'])
  })
})

describe('searchTasks', () => {
  it('matches title and description across every column, case-insensitively', () => {
    const tasks = [
      task({ id: 'a', title: 'Write the plan' }),
      task({ id: 'b', title: 'Ship it', description: 'Deploy on Friday', status: 'done' }),
    ]

    expect(searchTasks(tasks, 'FRIDAY').map((t) => t.id)).toEqual(['b'])
    expect(searchTasks(tasks, 'zzz')).toEqual([])
    // A blank query means "not searching", not "match everything".
    expect(searchTasks(tasks, '   ')).toEqual([])
  })
})

describe('filterTasksByStatus', () => {
  it('treats an empty status list as no filter rather than no results', () => {
    // The all-tasks modal has one state for "All" and "nothing picked".
    const tasks = [task({ id: 'a' }), task({ id: 'b', status: 'done' })]

    expect(filterTasksByStatus(tasks, [])).toEqual(tasks)
    expect(filterTasksByStatus(tasks, ['done']).map((t) => t.id)).toEqual(['b'])
  })
})

describe('sortTasks', () => {
  const columns = createEmptyBoard().columns

  it('sorts titles case-insensitively, with untitled tasks under their placeholder', () => {
    const tasks = [
      task({ id: 'a', title: 'apple' }),
      task({ id: 'z', title: 'Zebra' }),
      task({ id: 'u', title: '' }),
    ]

    // 'u' renders as "Untitled task", so it lands between apple and Zebra.
    expect(sortTasks(tasks, columns, 'title', 'asc').map((t) => t.id)).toEqual(['a', 'u', 'z'])
  })

  it('sorts by column order rather than alphabetically by status key', () => {
    const tasks = [
      task({ id: 'd', status: 'done' }),
      task({ id: 'p', status: 'in_progress' }),
      task({ id: 't', status: 'todo' }),
    ]

    // Alphabetically this would be done, in_progress, todo — the board reads
    // todo, in_progress, done, and that is the order the list should follow.
    expect(sortTasks(tasks, columns, 'status', 'asc').map((t) => t.id)).toEqual(['t', 'p', 'd'])
  })

  it('keeps undated tasks last in both directions', () => {
    const tasks = [
      task({ id: 'none' }),
      task({ id: 'late', due_at: '2026-09-01T00:00:00.000Z' }),
      task({ id: 'soon', due_at: '2026-08-01T00:00:00.000Z' }),
    ]

    // A missing due date is absent, not later than every date — flipping the
    // direction must not float those tasks to the top.
    expect(sortTasks(tasks, columns, 'due_at', 'asc').map((t) => t.id))
      .toEqual(['soon', 'late', 'none'])
    expect(sortTasks(tasks, columns, 'due_at', 'desc').map((t) => t.id))
      .toEqual(['late', 'soon', 'none'])
  })

  it('returns a sorted copy rather than reordering the board in place', () => {
    const tasks = [task({ id: 'z', title: 'Zebra' }), task({ id: 'a', title: 'apple' })]

    sortTasks(tasks, columns, 'title', 'asc')
    expect(tasks.map((t) => t.id)).toEqual(['z', 'a'])
  })
})
