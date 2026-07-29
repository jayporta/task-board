/**
 * The drag payload type, shared by the drag and drop hooks so a column can tell
 * one of our cards from a file or some text dragged in from elsewhere. Both
 * sides must use the identical string — a mismatch fails silently, with cards
 * simply never dropping.
 */
export const DRAG_MIME = 'application/x-task-board-task'
