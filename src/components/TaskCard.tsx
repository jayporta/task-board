import { useState } from 'react'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import EventIcon from '@mui/icons-material/Event'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import InputBase from '@mui/material/InputBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useBoardContext } from '../context/boardContext'
import { displayTitle, UNTITLED_LABEL } from '../lib/board'
import { describeDueDate, formatDate, isOverdue } from '../lib/dates'
import type { Task } from '../types'

export function TaskCard({ task }: { task: Task }) {
  const { dispatch, focusTaskId, openDetails } = useBoardContext()
  const [title, setTitle] = useState(task.title)
  const [pickerOpen, setPickerOpen] = useState(false)
  // The picker is controlled, so it needs its own draft while the user browses.
  const [dueDraft, setDueDraft] = useState<Dayjs | null>(null)
  const overdue = isOverdue(task.due_at)

  const commit = () => {
    if (title.trim() !== task.title) dispatch({ type: 'rename_task', id: task.id, title })
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      ;(event.target as HTMLInputElement).blur()
    }
    if (event.key === 'Escape') {
      setTitle(task.title)
      ;(event.target as HTMLInputElement).blur()
    }
  }

  const openPicker = () => {
    setDueDraft(task.due_at ? dayjs(task.due_at) : null)
    setPickerOpen(true)
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        {/* Its own row above the title, which needs the full card width. */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'right', mb: 0.5 }}
        >
          Created date: {formatDate(task.created_at)}
        </Typography>

        <InputBase
          multiline
          fullWidth
          autoFocus={task.id === focusTaskId}
          value={title}
          placeholder={UNTITLED_LABEL}
          inputProps={{ 'aria-label': `Title of ${displayTitle(task)}` }}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          sx={{
            typography: 'subtitle2',
            fontWeight: 600,
            p: 0,
            '& .MuiInputBase-input': { p: 0 },
            '& .MuiInputBase-input::placeholder': { fontStyle: 'italic', opacity: 0.6 },
          }}
        />

        <ButtonBase
          onClick={() => openDetails(task)}
          aria-label={`Details of ${displayTitle(task)}`}
          sx={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            borderRadius: 1,
            mt: 0.5,
            px: 0.5,
            mx: -0.5,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          {task.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
              }}
            >
              {task.description}
            </Typography>
          ) : (
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ fontStyle: 'italic', opacity: 0.75 }}
            >
              Add details…
            </Typography>
          )}
        </ButtonBase>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5 }}>
          <Chip
            size="small"
            variant="outlined"
            clickable
            color={overdue ? 'error' : 'default'}
            icon={overdue ? <EventBusyIcon /> : <EventIcon />}
            label={`Due date: ${describeDueDate(task.due_at) || 'none'}`}
            onClick={openPicker}
          />
        </Stack>

        {/* Field hidden: the chip above is the trigger, and the picker is a modal. */}
        <MobileDatePicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          value={dueDraft}
          onChange={setDueDraft}
          onAccept={(value) =>
            dispatch({ type: 'set_due_date', id: task.id, due_at: value?.toISOString() })
          }
          slotProps={{
            textField: { sx: { display: 'none' } },
            actionBar: { actions: ['clear', 'cancel', 'accept'] },
          }}
        />
      </CardContent>
    </Card>
  )
}
