import { createContext, useContext, type Dispatch } from 'react'
import type { BoardAction } from '../lib/board'
import type { BoardState, Status, Task } from '../types'

/**
 * Everything a component may need from the board. Components read from here
 * rather than taking board state and callbacks through props.
 */
export type BoardContextValue = {
  /** The whole persisted board — every task and every column. */
  board: BoardState
  /** The only way to change the board; the rules live in the `lib/board.ts` reducer. */
  dispatch: Dispatch<BoardAction>
  /** Adds an empty task to `status` and marks its card to take focus. */
  createTask: (status: Status) => void
  /** Card waiting to take focus on its next render, or `null` when none is. */
  focusTaskId: string | null
  /** Called once the focus has been taken, so it cannot fire again on remount. */
  clearFocus: () => void
  /** The task whose details dialog is open, resolved fresh from board state. */
  detailsTask: Task | null
  /** Opens the details dialog for a task; only its id is held onto. */
  openDetails: (task: Task) => void
  /** Closes the details dialog. */
  closeDetails: () => void
  /** Search text narrowing every column at once. */
  query: string
  /** Replaces the search text. */
  setQuery: (query: string) => void
}

/** Null by default so a read from outside the provider is a detectable mistake. */
export const BoardContext = createContext<BoardContextValue | null>(null)

/** Reads the board context, throwing outside the provider so callers never see null. */
export function useBoardContext(): BoardContextValue {
  const value = useContext(BoardContext)
  if (!value) throw new Error('useBoardContext must be used inside <BoardProvider>')
  return value
}
