import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useBoardContext } from '../context/boardContext'
import { useTaskDropTarget } from '../hooks/useTaskDropTarget'
import { CREATE_STATUS, FALLBACK_STATUS, isCoreColumn, visibleTasks } from '../lib/board'
import { ConfirmDialog } from './ConfirmDialog'
import { BoardColumnEmptyState } from './BoardColumnEmptyState'
import { TaskCard } from './TaskCard'
import type { Column } from '../types'

export function BoardColumn({ column }: { column: Column }) {
  const { board, createTask, dispatch } = useBoardContext()
  const { isOver, dropProps } = useTaskDropTarget(column.status)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const tasks = visibleTasks(board.tasks, column.status)

  // Named rather than hardcoded, so the confirmation cannot promise the wrong
  // destination if FALLBACK_STATUS ever changes.
  const fallbackLabel =
    board.columns.find((candidate) => candidate.status === FALLBACK_STATUS)?.label ?? 'Todo'

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
      {...dropProps}
      sx={{
        flex: '1 0 280px',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isOver ? 'action.selected' : 'action.hover',
        borderColor: isOver ? 'primary.main' : 'divider',
        borderStyle: isOver ? 'dashed' : 'solid',
        p: 1.5,
        transition: 'background-color 120ms, border-color 120ms',
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', px: 0.5, pb: 1.5 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
            {column.label}
          </Typography>
          <Chip size="small" label={tasks.length} />
        </Stack>

        {addButton}

        {/* Only user-added columns can be deleted; the three core statuses are fixed. */}
        {!isCoreColumn(column) && (
          <Tooltip title="Delete column">
            <IconButton
              size="small"
              aria-label={`Delete ${column.label} column`}
              onClick={() => setConfirmingDelete(true)}
              sx={{ '&:hover': { color: 'error.main' } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {tasks.length === 0 ? (
        <BoardColumnEmptyState
          title={isOver ? 'Drop to move here' : 'Nothing here'}
          description={
            canAdd ? 'Add a task, or drag one here.' : 'Drag a task here to change its status.'
          }
        />
      ) : (
        <Stack spacing={1.5}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Stack>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this column?"
        description={
          tasks.length === 0
            ? `"${column.label}" will be removed from the board.`
            : `"${column.label}" will be removed, and its ${tasks.length} ${
                tasks.length === 1 ? 'task moves' : 'tasks move'
              } back to ${fallbackLabel}.`
        }
        onConfirm={() => dispatch({ type: 'delete_column', id: column.id })}
        onClose={() => setConfirmingDelete(false)}
      />
    </Paper>
  )
}
