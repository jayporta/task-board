import { useEffect, useReducer, type Dispatch } from 'react'
import { boardReducer, type BoardAction } from '../lib/board'
import { loadBoard, saveBoard } from '../lib/storage'
import type { BoardState } from '../types'

export type BoardValue = {
  /** Current board, restored from localStorage on the first render. */
  board: BoardState
  /** Applies an action; the resulting board is saved on the next effect. */
  dispatch: Dispatch<BoardAction>
}

/**
 * The board state plus its persistence — the only place the pure reducer and
 * localStorage meet.
 */
export function useBoard(): BoardValue {
  const [board, dispatch] = useReducer(boardReducer, undefined, loadBoard)

  useEffect(() => {
    saveBoard(board)
  }, [board])

  return { board, dispatch }
}
