import { describe, expect, it } from 'vitest'
import type { BoardState, Task } from '../types'
import {
  boardReducer,
  createColumn,
  createEmptyBoard,
  createTask,
  displayTitle,
  isBlank,
  isCoreColumn,
  newId,
  normalizeTitle,
  toStatusKey,
  UNTITLED_LABEL,
  validateColumnLabel,
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

/** Adds a custom column and hands back the new board plus that column. */
function withCustomColumn(state: BoardState, label: string) {
  const next = boardReducer(state, { type: 'add_column', label })
  return { next, column: next.columns[next.columns.length - 1] }
}

describe('newId', () => {
  it('generates distinct ids', () => {
    expect(newId()).not.toBe(newId())
  })
})

describe('title handling', () => {
  it('trims titles', () => {
    expect(normalizeTitle('  hi  ')).toBe('hi')
  })

  it.each(['', '   ', '\n\t'])('treats %j as blank', (raw) => {
    expect(isBlank(raw)).toBe(true)
  })

  it('falls back to a placeholder for untitled tasks', () => {
    expect(displayTitle(task({ title: '' }))).toBe(UNTITLED_LABEL)
    expect(displayTitle(task({ title: 'Real title' }))).toBe('Real title')
  })
})

describe('createEmptyBoard', () => {
  it('seeds the three core columns with uuids and timestamps', () => {
    const { columns, tasks } = createEmptyBoard()

    expect(tasks).toEqual([])
    expect(columns.map((column) => column.status)).toEqual(['todo', 'in_progress', 'done'])
    expect(columns.map((column) => column.label)).toEqual(['Todo', 'In Progress', 'Done'])
    expect(new Set(columns.map((column) => column.id)).size).toBe(3)
    for (const column of columns) {
      expect(new Date(column.created_at).toISOString()).toBe(column.created_at)
      expect(isCoreColumn(column)).toBe(true)
    }
  })
})

describe('createTask', () => {
  it('stores a trimmed title and an ISO created_at', () => {
    const created = createTask('  Ship it  ', 'todo')
    expect(created.title).toBe('Ship it')
    expect(created.status).toBe('todo')
    expect(new Date(created.created_at).toISOString()).toBe(created.created_at)
    expect(created.id).not.toHaveLength(0)
  })

  it('omits blank optional fields but keeps real ones', () => {
    const bare = createTask('a', 'todo', '   ')
    expect(bare).not.toHaveProperty('description')
    expect(bare).not.toHaveProperty('due_at')

    const full = createTask('a', 'todo', '  details ', '2026-08-01T00:00:00.000Z')
    expect(full.description).toBe('details')
    expect(full.due_at).toBe('2026-08-01T00:00:00.000Z')
  })
})

describe('add_task', () => {
  it('adds a task to the requested column', () => {
    const next = boardReducer(createEmptyBoard(), {
      type: 'add_task',
      title: 'Review PR',
      status: 'in_progress',
    })
    expect(next.tasks).toHaveLength(1)
    expect(next.tasks[0]).toMatchObject({ title: 'Review PR', status: 'in_progress' })
  })

  it('keeps a due date', () => {
    const next = boardReducer(createEmptyBoard(), {
      type: 'add_task',
      title: 'Ship',
      status: 'todo',
      due_at: '2026-08-01T00:00:00.000Z',
    })
    expect(next.tasks[0].due_at).toBe('2026-08-01T00:00:00.000Z')
  })

  it('accepts a blank title so capture stays fast', () => {
    const next = boardReducer(createEmptyBoard(), { type: 'add_task', title: '   ', status: 'todo' })
    expect(next.tasks[0].title).toBe('')
    expect(displayTitle(next.tasks[0])).toBe(UNTITLED_LABEL)
  })

  it('falls back to todo for an unknown status', () => {
    const next = boardReducer(createEmptyBoard(), {
      type: 'add_task',
      title: 'Orphan',
      status: 'nope',
    })
    expect(next.tasks[0].status).toBe('todo')
  })
})

describe('edit_task', () => {
  it('updates the editable fields without touching id, created_at or status', () => {
    const original = task({ description: 'old', due_at: '2026-08-01T00:00:00.000Z' })
    const next = boardReducer(boardWith([original]), {
      type: 'edit_task',
      id: original.id,
      title: '  New title  ',
      description: '  new details  ',
      due_at: '2026-09-01T00:00:00.000Z',
    })

    expect(next.tasks[0]).toMatchObject({
      id: original.id,
      created_at: original.created_at,
      status: original.status,
      title: 'New title',
      description: 'new details',
      due_at: '2026-09-01T00:00:00.000Z',
    })
  })

  it('clears the description and due date when emptied', () => {
    const original = task({ description: 'old', due_at: '2026-08-01T00:00:00.000Z' })
    const next = boardReducer(boardWith([original]), {
      type: 'edit_task',
      id: original.id,
      title: 'Still here',
      description: '  ',
    })
    expect(next.tasks[0].description).toBeUndefined()
    expect(next.tasks[0].due_at).toBeUndefined()
  })

  it('allows clearing the title back to untitled', () => {
    const next = boardReducer(boardWith([task()]), { type: 'edit_task', id: 'id-1', title: '  ' })
    expect(next.tasks[0].title).toBe('')
  })

  it('leaves other tasks alone', () => {
    const other = task({ id: 'id-2', title: 'Untouched' })
    const next = boardReducer(boardWith([task(), other]), {
      type: 'edit_task',
      id: 'id-1',
      title: 'Changed',
    })
    expect(next.tasks[1]).toEqual(other)
  })
})

describe('rename_task', () => {
  it('changes only the title, leaving description and due date intact', () => {
    const original = task({ description: 'details', due_at: '2026-08-01T00:00:00.000Z' })
    const next = boardReducer(boardWith([original]), {
      type: 'rename_task',
      id: original.id,
      title: '  Renamed  ',
    })

    expect(next.tasks[0]).toEqual({ ...original, title: 'Renamed' })
  })
})

describe('set_due_date', () => {
  it('sets and clears the due date, leaving the other fields intact', () => {
    const original = task({ description: 'details' })
    const withDue = boardReducer(boardWith([original]), {
      type: 'set_due_date',
      id: original.id,
      due_at: '2026-08-01T00:00:00.000Z',
    })
    expect(withDue.tasks[0]).toEqual({ ...original, due_at: '2026-08-01T00:00:00.000Z' })

    const cleared = boardReducer(withDue, { type: 'set_due_date', id: original.id })
    expect(cleared.tasks[0].due_at).toBeUndefined()
    expect(cleared.tasks[0].description).toBe('details')
  })
})

describe('move_task', () => {
  it('moves a task to another core column', () => {
    const next = boardReducer(boardWith([task()]), {
      type: 'move_task',
      id: 'id-1',
      status: 'done',
    })
    expect(next.tasks[0].status).toBe('done')
  })

  it('moves a task into a custom column', () => {
    const { next: withColumn, column } = withCustomColumn(boardWith([task()]), 'Blocked')
    const next = boardReducer(withColumn, { type: 'move_task', id: 'id-1', status: column.status })
    expect(next.tasks[0].status).toBe('blocked')
  })

  it('ignores a move to a status no column owns', () => {
    const state = boardWith([task()])
    expect(boardReducer(state, { type: 'move_task', id: 'id-1', status: 'ghost' })).toBe(state)
  })
})

describe('delete_task', () => {
  it('removes only the named task', () => {
    const next = boardReducer(boardWith([task(), task({ id: 'id-2' })]), {
      type: 'delete_task',
      id: 'id-1',
    })
    expect(next.tasks.map((t) => t.id)).toEqual(['id-2'])
  })
})

describe('toStatusKey', () => {
  it('slugifies labels', () => {
    expect(toStatusKey('In Review')).toBe('in_review')
    expect(toStatusKey('  Waiting on QA!  ')).toBe('waiting_on_qa')
  })

  it('is empty when there is nothing to slug', () => {
    expect(toStatusKey('***')).toBe('')
  })
})

describe('validateColumnLabel', () => {
  const columns = createEmptyBoard().columns

  it('accepts a fresh label', () => {
    expect(validateColumnLabel('In Review', columns)).toBeNull()
  })

  it.each(['', '   ', '***'])('rejects %j as blank', (label) => {
    expect(validateColumnLabel(label, columns)).toBe('blank')
  })

  it('rejects a duplicate label regardless of case or padding', () => {
    expect(validateColumnLabel('  todo  ', columns)).toBe('duplicate')
  })

  it('rejects a label that slugs onto an existing status', () => {
    expect(validateColumnLabel('In-Progress', columns)).toBe('duplicate')
  })
})

describe('columns', () => {
  it('adds a custom column with a uuid, slug status and timestamp', () => {
    const { column } = withCustomColumn(createEmptyBoard(), '  In Review  ')

    expect(column).toMatchObject({ label: 'In Review', status: 'in_review' })
    expect(column.id).not.toHaveLength(0)
    expect(new Date(column.created_at).toISOString()).toBe(column.created_at)
    expect(isCoreColumn(column)).toBe(false)
  })

  it('gives each column a distinct id', () => {
    expect(createColumn('One').id).not.toBe(createColumn('Two').id)
  })

  it.each(['   ', '***', 'Todo', 'in progress'])('ignores the invalid label %j', (label) => {
    const state = createEmptyBoard()
    expect(boardReducer(state, { type: 'add_column', label })).toBe(state)
  })

  it('sends tasks back to todo when their column is deleted', () => {
    const { next: withColumn, column } = withCustomColumn(boardWith([task()]), 'Blocked')
    const moved = boardReducer(withColumn, { type: 'move_task', id: 'id-1', status: column.status })
    const next = boardReducer(moved, { type: 'delete_column', id: column.id })

    expect(next.columns.map((c) => c.status)).toEqual(['todo', 'in_progress', 'done'])
    expect(next.tasks[0].status).toBe('todo')
  })

  it('leaves tasks in other columns alone when one is deleted', () => {
    const { next: withColumn, column } = withCustomColumn(
      boardWith([task({ status: 'done' })]),
      'Blocked',
    )
    const next = boardReducer(withColumn, { type: 'delete_column', id: column.id })
    expect(next.tasks[0].status).toBe('done')
  })

  it('refuses to delete a core column', () => {
    const state = createEmptyBoard()
    expect(boardReducer(state, { type: 'delete_column', id: state.columns[0].id })).toBe(state)
  })

  it('ignores an unknown column id', () => {
    const state = createEmptyBoard()
    expect(boardReducer(state, { type: 'delete_column', id: 'nope' })).toBe(state)
  })
})

describe('visibleTasks', () => {
  const older = task({ id: 'old', title: 'Older task', created_at: '2026-07-01T10:00:00.000Z' })
  const newer = task({ id: 'new', title: 'Newer task', created_at: '2026-07-05T10:00:00.000Z' })
  const done = task({ id: 'done', title: 'Finished', status: 'done' })
  const all = [older, newer, done]

  it('returns only the column, newest first', () => {
    expect(visibleTasks(all, 'todo').map((t) => t.id)).toEqual(['new', 'old'])
  })

  it('matches title and description case-insensitively', () => {
    expect(visibleTasks(all, 'todo', 'NEWER').map((t) => t.id)).toEqual(['new'])
    expect(
      visibleTasks([task({ description: 'about caching' })], 'todo', 'CACHING').map((t) => t.id),
    ).toEqual(['id-1'])
  })

  it('returns nothing when the query matches no task', () => {
    expect(visibleTasks(all, 'todo', 'zzz')).toEqual([])
  })

  it('does not mutate the input array', () => {
    const input = [...all]
    visibleTasks(input, 'todo')
    expect(input).toEqual(all)
  })
})
