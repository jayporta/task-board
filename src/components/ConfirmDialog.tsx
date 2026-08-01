import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

type ConfirmDialogProps = {
  /** Whether the dialog is showing; the caller owns this state. */
  open: boolean
  /** Headline naming what is about to happen. */
  title: string
  /** Spells out the consequence — what is deleted, and what happens to it. */
  description: string
  /** Text on the confirm button. Defaults to "Delete". */
  confirmLabel?: string
  /** Runs the destructive action. The dialog closes itself afterwards. */
  onConfirm: () => void
  /** Dismisses the dialog, on cancel and after confirming. */
  onClose: () => void
}

/** Shared confirmation for the destructive actions — deleting a task or a column. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} color="error" variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
