import { useMemo, useState } from 'react'
import { useBoardContext } from '../context/boardContext'
import { DRAG_MIME } from '../lib/dnd'
import type { Status } from '../types'

/**
 * Accepts task cards dropped onto a column and moves them to `status`.
 *
 * Spread `dropProps` on the drop area; `isOver` drives its highlight.
 */
export function useTaskDropTarget(status: Status) {
  const { dispatch } = useBoardContext()
  const [isOver, setIsOver] = useState(false)

  const dropProps = useMemo(
    () => ({
      onDragOver: (event: React.DragEvent) => {
        // Only `types` is readable mid-drag; `getData` is blocked until the drop.
        // Ignoring other payloads keeps the highlight honest and leaves the
        // browser to handle files and text itself.
        if (!event.dataTransfer.types.includes(DRAG_MIME)) return
        // Preventing the default is what marks this a valid drop target.
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setIsOver(true)
      },
      onDragLeave: () => setIsOver(false),
      onDrop: (event: React.DragEvent) => {
        event.preventDefault()
        setIsOver(false)
        // Empty for any payload that is not one of our cards.
        const id = event.dataTransfer.getData(DRAG_MIME)
        if (id) dispatch({ type: 'move_task', id, status })
      },
    }),
    [dispatch, status],
  )

  return { isOver, dropProps }
}
