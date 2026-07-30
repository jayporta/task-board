/**
 * The drag payload type, shared by the drag and drop hooks so a column can tell
 * one of our cards from a file or some text dragged in from elsewhere. Both
 * sides must use the identical string — a mismatch fails silently, with cards
 * simply never dropping.
 */
export const DRAG_MIME = 'application/x-task-board-task'

/**
 * The payload type for a column being reordered. Distinct from `DRAG_MIME` so a
 * column and a card can share a drop area: each side ignores the other's type,
 * and a card dragged over a column still lands in the column's task drop target
 * rather than reordering the board.
 */
export const COLUMN_DRAG_MIME = 'application/x-task-board-column'
