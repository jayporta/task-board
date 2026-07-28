import type { Task } from '../types'

/**
 * Placeholder data so the board has something to show before the create/edit
 * dialog exists. Removed once tasks can be added for real.
 */
const daysFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export const SAMPLE_TASKS: Task[] = [
  {
    id: 'sample-1',
    title: 'Draft the API contract',
    description:
      'Agree the task and column payloads with the backend before the board wiring starts, so the storage shape does not have to change later.',
    status: 'todo',
    created_at: daysFromNow(-3),
    due_at: daysFromNow(-2),
  },
  {
    id: 'sample-2',
    title: '',
    status: 'todo',
    created_at: daysFromNow(0),
  },
  {
    id: 'sample-3',
    title: 'Wire up the board grid',
    description: 'Responsive columns that stack on narrow screens.',
    status: 'in_progress',
    created_at: daysFromNow(-1),
    due_at: daysFromNow(1),
  },
]
