import { useState } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ButtonBase from '@mui/material/ButtonBase'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useBoardContext } from '../context/boardContext'
import { useTaskDrag } from '../hooks/useTaskDrag'
import { deleteTaskPrompt, displayTitle, normalizeTitle, UNTITLED_LABEL } from '../lib/board'
import { formatDate } from '../lib/dates'
import type { Task } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { TaskDueDate } from './TaskDueDate'

export function TaskCard({ task }: { task: Task }) {
  const { dispatch, focusTaskId, clearFocus, openDetails } = useBoardContext()
  const { dragging, dragProps, handleProps } = useTaskDrag(task.id)
  const [title, setTitle] = useState(task.title)
  const [committed, setCommitted] = useState(task.title)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  // The card stays mounted while the task changes, so an edit made in the
  // details dialog has to be pulled into the draft — otherwise the next blur
  // would write the stale title back over it.
  if (committed !== task.title) {
    setCommitted(task.title)
    setTitle(task.title)
  }

  const commitTitle = () => {
    const next = normalizeTitle(title)
    setTitle(next)
    if (next !== task.title) dispatch({ type: 'rename_task', id: task.id, title: next })
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

  return (
    <Card variant="outlined" {...dragProps} sx={{ opacity: dragging ? 0.4 : 1 }}>
      {/* A tab across the top center: the only place a drag can start. */}
      <Stack direction="row" sx={{ justifyContent: 'center' }}>
        <Tooltip title="Drag to another status">
          <IconButton
            size="small"
            aria-label={`Drag ${displayTitle(task)}`}
            {...handleProps}
            sx={(theme) => ({
              cursor: 'grab',
              color: 'text.disabled',
              borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
              px: 2,
              py: 0,
              '&:hover': { bgcolor: 'action.hover', color: 'text.secondary' },
              '&:active': { cursor: 'grabbing' },
            })}
          >
            <DragIndicatorIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <CardContent sx={{ pt: 0.5, '&:last-child': { pb: 2 } }}>
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
          slotProps={{ input: { 'aria-label': `Title of ${displayTitle(task)}` } }}
          onChange={(event) => setTitle(event.target.value)}
          // Consuming the focus here stops it firing again when the card
          // remounts, which happens every time it moves to another column.
          onFocus={() => task.id === focusTaskId && clearFocus()}
          onBlur={commitTitle}
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
          <TaskDueDate task={task} />

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

        <ConfirmDialog
          open={confirmingDelete}
          {...deleteTaskPrompt(task)}
          onConfirm={() => dispatch({ type: 'delete_task', id: task.id })}
          onClose={() => setConfirmingDelete(false)}
        />
      </CardContent>
    </Card>
  )
}
