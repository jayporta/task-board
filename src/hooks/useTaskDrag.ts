import { useMemo, useState } from 'react'
import { DRAG_MIME } from '../lib/dnd'

/**
 * Makes a task card draggable. Dragging is armed by the handle rather than the
 * card, so text in the inline title stays selectable.
 *
 * Spread `dragProps` on the card and `handleProps` on the grip.
 */
export function useTaskDrag(taskId: string) {
  const [armed, setArmed] = useState(false)
  const [dragging, setDragging] = useState(false)

  const dragProps = useMemo(
    () => ({
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
    }),
    [armed, taskId],
  )

  const handleProps = useMemo(
    () => ({
      onMouseDown: () => setArmed(true),
      onMouseUp: () => setArmed(false),
    }),
    [],
  )

  return { dragging, dragProps, handleProps }
}
