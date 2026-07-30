import { describe, expect, it } from 'vitest'
import type { BoardState, Task } from '../types'
import {
  boardReducer,
  createEmptyBoard,
  displayTitle,
  searchTasks,
  UNTITLED_LABEL,
  visibleTasks,
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

  it('reorders any column, core ones included, and ignores a move that lands nowhere', () => {
    const state = createEmptyBoard()
    const [todo, inProgress, done] = state.columns

    // Dragged onto Done, Todo takes its place and the others close up.
    const next = boardReducer(state, { type: 'move_column', id: todo.id, targetId: done.id })
    expect(next.columns.map((column) => column.status)).toEqual(['in_progress', 'done', 'todo'])

    // Same object back, so a drop on itself or on nothing costs no re-render.
    expect(boardReducer(next, { type: 'move_column', id: todo.id, targetId: todo.id })).toBe(next)
    expect(boardReducer(next, { type: 'move_column', id: todo.id, targetId: 'ghost' })).toBe(next)
    expect(boardReducer(next, { type: 'move_column', id: 'ghost', targetId: inProgress.id })).toBe(
      next,
    )
  })

  it('leaves every task untouched when columns move, so search and lists are unaffected', () => {
    // Order is layout. Anything reading tasks joins on `status`, which a move
    // never rewrites — a reordered board answers exactly as it did before.
    const tasks = [task({ id: 'a' }), task({ id: 'b', title: 'Ship it', status: 'done' })]
    const state = boardWith(tasks)
    const [todo, , done] = state.columns

    const next = boardReducer(state, { type: 'move_column', id: done.id, targetId: todo.id })

    expect(next.tasks).toBe(state.tasks)
    expect(searchTasks(next.tasks, 'ship').map((t) => t.id)).toEqual(['b'])
    expect(visibleTasks(next.tasks, 'todo').map((t) => t.id)).toEqual(['a'])
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
