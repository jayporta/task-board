import Dialog from '@mui/material/Dialog'
import { AddColumnForm } from './AddColumnForm'

type AddColumnDialogProps = {
  /** Whether the dialog is showing. Also gates whether the form is mounted. */
  open: boolean
  /** Dismisses the dialog, on cancel and once a column has been added. */
  onClose: () => void
}

export function AddColumnDialog({ open, onClose }: AddColumnDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      {/* Mounting the form only while open gives every visit a clean slate. */}
      {open && <AddColumnForm onClose={onClose} />}
    </Dialog>
  )
}
