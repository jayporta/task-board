import { useEffect, useReducer } from 'react'
import { boardReducer } from '../lib/board'
import { loadBoard, saveBoard } from '../lib/storage'

/**
 * The board state plus its persistence — the only place the pure reducer and
 * localStorage meet.
 */
export function useBoard() {
  const [board, dispatch] = useReducer(boardReducer, undefined, loadBoard)

  useEffect(() => {
    saveBoard(board)
  }, [board])

  return { board, dispatch }
}
