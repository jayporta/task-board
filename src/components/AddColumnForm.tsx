import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import { useBoardContext } from '../context/boardContext'
import { validateColumnLabel, type ColumnLabelError } from '../lib/board'

const ERROR_MESSAGES: Record<ColumnLabelError, string> = {
  blank: 'Use at least one letter or number.',
  duplicate: 'A column with that name already exists.',
}

/**
 * Mounted only while its dialog is open, so the field starts empty every time
 * without needing a reset.
 */
export function AddColumnForm({ onClose }: { onClose: () => void }) {
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
        <TextField
          autoFocus
          fullWidth
          required
          size="small"
          id="column-name"
          label="Name"
          placeholder="In Review"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          // Reported in the neutral helper line rather than as red text; the
          // disabled Submit is the real signal, as in the reference design.
          helperText={label.length > 0 && error ? ERROR_MESSAGES[error] : ' '}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={error !== null}>
          Submit
        </Button>
      </DialogActions>
    </Box>
  )
}
