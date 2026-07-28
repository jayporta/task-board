import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EmptyState } from './EmptyState'
import { TaskCard } from './TaskCard'
import type { Column, Task } from '../types'

type BoardColumnProps = {
  column: Column
  tasks: Task[]
}

export function BoardColumn({ column, tasks }: BoardColumnProps) {
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
        <EmptyState title="Nothing here" description="Tasks in this status will appear here." />
      ) : (
        <Stack spacing={1.5}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Stack>
      )}
    </Paper>
  )
}
