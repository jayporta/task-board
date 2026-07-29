import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useBoard } from '../hooks/useBoard'
import { newId } from '../lib/board'
import type { Status, Task } from '../types'
import { BoardContext, type BoardContextValue } from './boardContext'

export function BoardProvider({ children }: { children: ReactNode }) {
  const { board, dispatch } = useBoard()
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null)
  const [detailsTaskId, setDetailsTaskId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const createTask = useCallback(
    (status: Status) => {
      // The id is minted here so the new card can take focus once it renders.
      const id = newId()
      dispatch({ type: 'add_task', id, title: '', status })
      setFocusTaskId(id)
    },
    [dispatch],
  )

  const clearFocus = useCallback(() => setFocusTaskId(null), [])
  const openDetails = useCallback((task: Task) => setDetailsTaskId(task.id), [])
  const closeDetails = useCallback(() => setDetailsTaskId(null), [])

  // Looked up rather than stored, so the dialog never shows a stale task.
  const detailsTask = board.tasks.find((task) => task.id === detailsTaskId) ?? null

  const value = useMemo<BoardContextValue>(
    () => ({
      board,
      dispatch,
      createTask,
      focusTaskId,
      clearFocus,
      detailsTask,
      openDetails,
      closeDetails,
      query,
      setQuery,
    }),
    [
      board,
      dispatch,
      createTask,
      focusTaskId,
      clearFocus,
      detailsTask,
      openDetails,
      closeDetails,
      query,
    ],
  )

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}
