import Dialog from '@mui/material/Dialog'
import { useBoardContext } from '../context/boardContext'
import { AllTasksPanel } from './AllTasksPanel'

export function AllTasksDialog() {
  const { allTasksOpen, closeAllTasks } = useBoardContext()

  return (
    <Dialog open={allTasksOpen} onClose={closeAllTasks} fullWidth maxWidth="md">
      {/* Mounting the panel only while open resets its filters, sort, and selection. */}
      {allTasksOpen && <AllTasksPanel />}
    </Dialog>
  )
}
