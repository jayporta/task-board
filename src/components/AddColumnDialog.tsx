import Dialog from '@mui/material/Dialog'
import { AddColumnForm } from './AddColumnForm'

type AddColumnDialogProps = {
  open: boolean
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
