import EventBusyIcon from '@mui/icons-material/EventBusy'
import EventIcon from '@mui/icons-material/Event'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { displayTitle } from '../lib/board'
import { describeDueDate, formatDate, isOverdue } from '../lib/dates'
import type { Task } from '../types'

type TaskCardProps = {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const untitled = !task.title
  const overdue = isOverdue(task.due_at)

  return (
    <Card variant="outlined">
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            wordBreak: 'break-word',
            ...(untitled && { color: 'text.disabled', fontStyle: 'italic' }),
          }}
        >
          {displayTitle(task)}
        </Typography>

        {task.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {task.description}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5 }}>
          {task.due_at && (
            <Chip
              size="small"
              variant="outlined"
              color={overdue ? 'error' : 'default'}
              icon={overdue ? <EventBusyIcon /> : <EventIcon />}
              label={describeDueDate(task.due_at)}
            />
          )}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {formatDate(task.created_at)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
