import { useState } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import EventBusyIcon from '@mui/icons-material/EventBusy'
import EventIcon from '@mui/icons-material/Event'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker'
import dayjs, { type Dayjs } from 'dayjs'
import { useBoardContext } from '../context/boardContext'
import { useTaskDrag } from '../hooks/useTaskDrag'
import { displayTitle, UNTITLED_LABEL } from '../lib/board'
import { describeDueDate, formatDate, isOverdue } from '../lib/dates'
import type { Task } from '../types'
import { ConfirmDialog } from './ConfirmDialog'

export function TaskCard({ task }: { task: Task }) {
  const { dispatch, focusTaskId, openDetails } = useBoardContext()
  const { dragging, dragProps, handleProps } = useTaskDrag(task.id)
  const [title, setTitle] = useState(task.title)
  const [pickerOpen, setPickerOpen] = useState(false)
  // The picker is controlled, so it needs its own draft while the user browses.
  const [dueDraft, setDueDraft] = useState<Dayjs | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
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
    <Card variant="outlined" {...dragProps} sx={{ opacity: dragging ? 0.4 : 1 }}>
      {/* A tab across the top centre: the only place a drag can start. */}
      <Stack direction="row" sx={{ justifyContent: 'center' }}>
        <Tooltip title="Drag to another status">
          <IconButton
            size="small"
            aria-label={`Drag ${displayTitle(task)}`}
            {...handleProps}
            sx={{
              cursor: 'grab',
              color: 'text.disabled',
              borderRadius: '0 0 8px 8px',
              px: 2,
              py: 0,
              '&:hover': { bgcolor: 'action.hover', color: 'text.secondary' },
              '&:active': { cursor: 'grabbing' },
            }}
          >
            <DragIndicatorIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <CardContent sx={{ pt: 0.5, '&:last-child': { pb: 2 } }}>
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

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}
        >
          <Chip
            size="small"
            variant="outlined"
            clickable
            color={overdue ? 'error' : 'default'}
            icon={overdue ? <EventBusyIcon /> : <EventIcon />}
            label={`Due date: ${describeDueDate(task.due_at) || 'none'}`}
            onClick={openPicker}
          />

          <Tooltip title="Delete task">
            <IconButton
              size="small"
              aria-label={`Delete ${displayTitle(task)}`}
              onClick={() => setConfirmingDelete(true)}
              sx={{ mr: -0.5, '&:hover': { color: 'error.main' } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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

        <ConfirmDialog
          open={confirmingDelete}
          title="Delete this task?"
          description={`"${displayTitle(task)}" will be removed from the board. This cannot be undone.`}
          onConfirm={() => dispatch({ type: 'delete_task', id: task.id })}
          onClose={() => setConfirmingDelete(false)}
        />
      </CardContent>
    </Card>
  )
}
