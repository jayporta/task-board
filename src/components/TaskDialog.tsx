import Dialog from '@mui/material/Dialog'
import { useBoardContext } from '../context/boardContext'
import { TaskForm } from './TaskForm'

/**
 * Task details. Titles are also editable inline on the card; this is where the
 * description and due date live.
 */
export function TaskDialog() {
  const { detailsTask, closeDetails } = useBoardContext()

  return (
    <Dialog open={detailsTask !== null} onClose={closeDetails} fullWidth maxWidth="sm">
      {/* Mounting the form only while open gives every visit a clean slate. */}
      {detailsTask && <TaskForm key={detailsTask.id} task={detailsTask} />}
    </Dialog>
  )
}
