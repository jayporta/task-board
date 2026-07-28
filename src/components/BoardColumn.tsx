import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useBoardContext } from '../context/boardContext'
import { CREATE_STATUS, visibleTasks } from '../lib/board'
import { EmptyState } from './EmptyState'
import { TaskCard } from './TaskCard'
import type { Column } from '../types'

export function BoardColumn({ column }: { column: Column }) {
  const { board, createTask } = useBoardContext()
  const tasks = visibleTasks(board.tasks, column.status)

  // New tasks always start in one column, so only that one gets an add control.
  const canAdd = column.status === CREATE_STATUS
  const addButton = canAdd && (
    <Button size="small" startIcon={<AddIcon />} onClick={() => createTask(column.status)}>
      Add task
    </Button>
  )

  return (
    <Paper
      variant="outlined"
      sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'action.hover', p: 1.5 }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 0.5, pb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
          {column.label}
        </Typography>
        <Chip size="small" label={tasks.length} />
      </Stack>

      {tasks.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description={
            canAdd ? 'Add a task to get started.' : 'Tasks in this status will appear here.'
          }
          action={addButton}
        />
      ) : (
        <>
          <Stack spacing={1.5}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </Stack>
          {addButton && <Stack sx={{ alignItems: 'flex-start', pt: 1.5 }}>{addButton}</Stack>}
        </>
      )}
    </Paper>
  )
}
