import { useState } from 'react'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import EventIcon from '@mui/icons-material/Event'
import Chip from '@mui/material/Chip'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useBoardContext } from '../context/boardContext'
import { describeDueDate, isOverdue } from '../lib/dates'
import type { Task } from '../types'

/** The due-date chip on a card, and the picker it opens. */
export function TaskDueDate({ task }: { task: Task }) {
  const { dispatch } = useBoardContext()
  const [open, setOpen] = useState(false)
  // The picker is controlled, so it needs its own draft while the user browses.
  const [draft, setDraft] = useState<Dayjs | null>(null)
  const overdue = isOverdue(task.due_at)

  const openPicker = () => {
    setDraft(task.due_at ? dayjs(task.due_at) : null)
    setOpen(true)
  }

  return (
    <>
      <Chip
        size="small"
        variant="outlined"
        clickable
        color={overdue ? 'error' : 'default'}
        icon={overdue ? <EventBusyIcon /> : <EventIcon />}
        label={`Due date: ${describeDueDate(task.due_at) || 'none'}`}
        onClick={openPicker}
      />

      {/* Field hidden: the chip above is the trigger, and the picker is a modal. */}
      <MobileDatePicker
        open={open}
        onClose={() => setOpen(false)}
        value={draft}
        onChange={setDraft}
        onAccept={(value) =>
          dispatch({ type: 'set_due_date', id: task.id, due_at: value?.toISOString() })
        }
        slotProps={{
          textField: { sx: { display: 'none' } },
          actionBar: { actions: ['clear', 'cancel', 'accept'] },
        }}
      />
    </>
  )
}
