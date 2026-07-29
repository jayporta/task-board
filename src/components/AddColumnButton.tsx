import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { AddColumnDialog } from './AddColumnDialog'

/** Sits to the right of the last column, as the board's only column control. */
export function AddColumnButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Tooltip title="Create column">
        <IconButton
          aria-label="Create column"
          onClick={() => setOpen(true)}
          sx={{
            flexShrink: 0,
            bgcolor: 'action.hover',
            borderRadius: 2,
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      <AddColumnDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
