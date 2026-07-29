import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useBoardContext } from '../context/boardContext'
import { validateColumnLabel, type ColumnLabelError } from '../lib/board'

const MESSAGES: Record<ColumnLabelError, string> = {
  blank: 'Use at least one letter or number.',
  duplicate: 'A column with that name already exists.',
}

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

function AddColumnForm({ onClose }: { onClose: () => void }) {
  const { board, dispatch } = useBoardContext()
  const [label, setLabel] = useState('')

  // Columns have no rename path, so the label has to be right before it is made.
  const error = validateColumnLabel(label, board.columns)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (error) return
    dispatch({ type: 'add_column', label })
    onClose()
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>Create column</DialogTitle>

      <DialogContent>
        <Typography component="label" htmlFor="column-name" variant="body2" sx={{ fontWeight: 600 }}>
          Name{' '}
          <Box component="span" aria-hidden sx={{ color: 'error.main' }}>
            *
          </Box>
        </Typography>

        <TextField
          autoFocus
          fullWidth
          required
          size="small"
          id="column-name"
          placeholder="In Review"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          // Reported in the neutral helper line rather than as red text; the
          // disabled Submit is the real signal, as in the reference design.
          helperText={label.length > 0 && error ? MESSAGES[error] : ' '}
          sx={{ mt: 0.5 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={error !== null}>
          Submit
        </Button>
      </DialogActions>
    </Box>
  )
}
