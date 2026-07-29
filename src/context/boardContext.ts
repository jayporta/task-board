import { createContext, useContext, type Dispatch } from 'react'
import type { BoardAction } from '../lib/board'
import type { BoardState, Status, Task } from '../types'

export type BoardContextValue = {
  board: BoardState
  dispatch: Dispatch<BoardAction>
  /** Adds an empty task to `status` and marks its card to take focus. */
  createTask: (status: Status) => void
  focusTaskId: string | null
  /** The task whose details dialog is open, resolved fresh from board state. */
  detailsTask: Task | null
  openDetails: (task: Task) => void
  closeDetails: () => void
  /** Search text narrowing every column at once. */
  query: string
  setQuery: (query: string) => void
}

export const BoardContext = createContext<BoardContextValue | null>(null)

export function useBoardContext(): BoardContextValue {
  const value = useContext(BoardContext)
  if (!value) throw new Error('useBoardContext must be used inside <BoardProvider>')
  return value
}
