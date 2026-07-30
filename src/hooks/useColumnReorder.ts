import { useState } from 'react'
import { useBoardContext } from '../context/boardContext'
import { COLUMN_DRAG_MIME } from '../lib/dnd'
import type { Column } from '../types'

/**
 * Reordering by drag makes every column both a source and a target, so one hook
 * owns both halves rather than splitting them the way the task hooks do.
 *
 * Spread `columnProps` on the column root and `handleProps` on its grip. The
 * root sits outside the task drop area: a card dragged over a column is ignored
 * here and handled there, and neither payload can trigger the other's move.
 */
export function useColumnReorder(column: Column) {
  const { dispatch } = useBoardContext()
  const [armed, setArmed] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [isOver, setIsOver] = useState(false)

  const columnProps = {
    // Armed by the grip rather than always on, so a drag cannot start from a
    // card, a button, or a selection inside the column.
    draggable: armed,
    onDragStart: (event: React.DragEvent) => {
      // A card starting its own drag inside this column bubbles through here.
      // Without the guard it would pick up a column payload too, and dropping
      // that card would move its task and reorder the board in one go.
      if (!armed) return
      event.stopPropagation()
      event.dataTransfer.setData(COLUMN_DRAG_MIME, column.id)
      event.dataTransfer.effectAllowed = 'move'
      setDragging(true)
    },
    onDragEnd: () => {
      setDragging(false)
      setArmed(false)
    },
    onDragOver: (event: React.DragEvent) => {
      // Only `types` is readable mid-drag. Anything else — a card, a file — is
      // left alone to bubble down to whichever target does want it.
      if (!event.dataTransfer.types.includes(COLUMN_DRAG_MIME)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setIsOver(true)
    },
    onDragLeave: () => setIsOver(false),
    onDrop: (event: React.DragEvent) => {
      // Empty for a card drop, which the task target has already handled.
      const id = event.dataTransfer.getData(COLUMN_DRAG_MIME)
      if (!id) return
      event.preventDefault()
      setIsOver(false)
      dispatch({ type: 'move_column', id, targetId: column.id })
    },
  }

  const handleProps = {
    onMouseDown: () => setArmed(true),
    onMouseUp: () => setArmed(false),
  }

  // The dragged column sits under the cursor the whole way, and dropping it on
  // itself does nothing — highlighting it would promise a move that never lands.
  return { dragging, isOver: isOver && !dragging, columnProps, handleProps }
}
