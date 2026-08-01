import { useState } from 'react'
import { DRAG_MIME } from '../lib/dnd'

export type TaskDragValue = {
  /** True while this card is being dragged; drives its dragging styling. */
  dragging: boolean
  /** Handlers for the card root. `draggable` stays false until the grip arms it. */
  dragProps: {
    draggable: boolean
    onDragStart: (event: React.DragEvent) => void
    onDragEnd: () => void
  }
  /** Handlers for the drag grip. Arming on mouse down is what makes the card draggable. */
  handleProps: {
    onMouseDown: () => void
    onMouseUp: () => void
  }
}

/**
 * Makes a task card draggable. Dragging is armed by the handle rather than the
 * card, so text in the inline title stays selectable.
 *
 * `dragProps` belongs on the card, `handleProps` on the grip.
 */
export function useTaskDrag(taskId: string): TaskDragValue {
  const [armed, setArmed] = useState(false)
  const [dragging, setDragging] = useState(false)

  const dragProps = {
    draggable: armed,
    onDragStart: (event: React.DragEvent) => {
      event.dataTransfer.setData(DRAG_MIME, taskId)
      event.dataTransfer.effectAllowed = 'move'
      setDragging(true)
    },
    onDragEnd: () => {
      setDragging(false)
      setArmed(false)
    },
  }

  const handleProps = {
    onMouseDown: () => setArmed(true),
    onMouseUp: () => setArmed(false),
  }

  return { dragging, dragProps, handleProps }
}
