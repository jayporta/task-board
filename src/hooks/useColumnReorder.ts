import { useRef, useState } from 'react'
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
 *
 * The grip is the draggable element, not the root. `useTaskDrag` instead arms a
 * draggable root from its handle, which is fine for a card but not here: the
 * root is an ancestor of every card, so an armed root would catch a card's own
 * dragstart as it bubbles and staple a column payload onto it. Dragging from
 * the grip means that event never reaches this hook and there is no latch to
 * leave set.
 */
export function useColumnReorder(column: Column) {
  const { dispatch } = useBoardContext()
  const rootRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [isOver, setIsOver] = useState(false)

  const columnProps = {
    ref: rootRef,
    onDragOver: (event: React.DragEvent) => {
      // Only `types` is readable mid-drag. Anything else — a card, a file — is
      // left alone to bubble down to whichever target does want it.
      if (!event.dataTransfer.types.includes(COLUMN_DRAG_MIME)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setIsOver(true)
    },
    onDragLeave: (event: React.DragEvent) => {
      // dragleave bubbles, so crossing between a column's own children fires it
      // too. Leaving for somewhere still inside this column is not leaving.
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
      setIsOver(false)
    },
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
    draggable: true,
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.setData(COLUMN_DRAG_MIME, column.id)
      event.dataTransfer.effectAllowed = 'move'
      // Drag the column, not the grip icon that started it, held at the point
      // it was grabbed so the ghost stays under the cursor.
      const root = rootRef.current
      if (root) {
        const bounds = root.getBoundingClientRect()
        event.dataTransfer.setDragImage(
          root,
          event.clientX - bounds.left,
          event.clientY - bounds.top,
        )
      }
      setDragging(true)
    },
    onDragEnd: () => setDragging(false),
  }

  // The dragged column sits under the cursor the whole way, and dropping it on
  // itself does nothing — highlighting it would promise a move that never lands.
  return { dragging, isOver: isOver && !dragging, columnProps, handleProps }
}
