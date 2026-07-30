import { useState } from 'react'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useBoardContext } from '../context/boardContext'
import {
  columnLabel,
  displayTitle,
  filterTasksByStatus,
  sortTasks,
  type SortDirection,
  type SortKey,
} from '../lib/board'
import { describeDueDate, formatDate, isOverdue } from '../lib/dates'
import type { Status, Task } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { EmptyState } from './EmptyState'

const SORT_LABELS: Record<SortKey, string> = {
  title: 'Title',
  status: 'Status',
  due_at: 'Due date',
}

/** What the confirm dialog is about to remove: one row, or the whole selection. */
type Pending = { ids: string[]; title: string; description: string }

/** The contents of the all-tasks modal: every task as one flat, filterable list. */
export function AllTasksPanel() {
  const { board, dispatch, closeAllTasks } = useBoardContext()
  const [statuses, setStatuses] = useState<Status[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [direction, setDirection] = useState<SortDirection>('asc')
  const [selected, setSelected] = useState<string[]>([])
  const [pending, setPending] = useState<Pending | null>(null)

  const rows = sortTasks(
    filterTasksByStatus(board.tasks, statuses),
    board.columns,
    sortKey,
    direction,
  )

  const visibleIds = rows.map((task) => task.id)
  const selectedHere = selected.filter((id) => visibleIds.includes(id))
  const allSelected = rows.length > 0 && selectedHere.length === rows.length

  const toggleStatus = (status: Status) =>
    setStatuses((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status],
    )

  const toggleRow = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )

  // Select-all covers what the filter is showing, not the whole board.
  const toggleAll = () => setSelected(allSelected ? [] : visibleIds)

  const confirmOne = (task: Task) =>
    setPending({
      ids: [task.id],
      title: 'Delete this task?',
      description: `"${displayTitle(task)}" will be removed from the board. This cannot be undone.`,
    })

  const confirmSelection = () => {
    const count = `${selectedHere.length} ${selectedHere.length === 1 ? 'task' : 'tasks'}`
    setPending({
      ids: selectedHere,
      title: `Delete ${count}?`,
      description: `${count} will be removed from the board. This cannot be undone.`,
    })
  }

  const remove = (ids: string[]) => {
    dispatch({ type: 'delete_tasks', ids })
    // Dropping the whole selection keeps deleted ids from lingering in it.
    setSelected([])
  }

  return (
    <>
      <DialogTitle>
        All tasks
        <Tooltip title="Close">
          <IconButton aria-label="Close all tasks" onClick={closeAllTasks} sx={{ mr: -1 }}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ maxHeight: '70vh' }}>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          // `pt` clears the top of the scroll box, which would otherwise slice
          // through the sort field's floating label.
          sx={{ alignItems: 'center', flexWrap: 'wrap', pt: 1, mb: 2 }}
        >
          <Chip
            label="All"
            size="small"
            aria-pressed={statuses.length === 0}
            color={statuses.length === 0 ? 'primary' : 'default'}
            variant={statuses.length === 0 ? 'filled' : 'outlined'}
            onClick={() => setStatuses([])}
          />

          {board.columns.map((column) => {
            const active = statuses.includes(column.status)
            return (
              <Chip
                key={column.id}
                label={column.label}
                size="small"
                aria-pressed={active}
                color={active ? 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                onClick={() => toggleStatus(column.status)}
              />
            )
          })}

          <TextField
            select
            size="small"
            label="Sort by"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            sx={{ ml: 'auto', width: 140 }}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
              <MenuItem key={key} value={key}>
                {SORT_LABELS[key]}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title={direction === 'asc' ? 'Sorted ascending' : 'Sorted descending'}>
            <IconButton
              aria-label={
                direction === 'asc' ? 'Sorted ascending, sort descending' : 'Sorted descending, sort ascending'
              }
              onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
            >
              {direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minHeight: 36, mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {rows.length} of {board.tasks.length} {board.tasks.length === 1 ? 'task' : 'tasks'}
          </Typography>

          {selectedHere.length > 0 && (
            <Button
              size="small"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={confirmSelection}
              sx={{ ml: 'auto' }}
            >
              Delete {selectedHere.length} selected
            </Button>
          )}
        </Stack>

        {rows.length === 0 ? (
          <EmptyState
            title={board.tasks.length === 0 ? 'No tasks yet' : 'No tasks match these filters'}
            description={
              board.tasks.length === 0
                ? 'Tasks you add to the board will be listed here.'
                : 'Try selecting another status.'
            }
          />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={selectedHere.length > 0 && !allSelected}
                    onChange={toggleAll}
                    slotProps={{ input: { 'aria-label': 'Select all listed tasks' } }}
                  />
                </TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell padding="checkbox" />
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((task) => {
                const overdue = isOverdue(task.due_at)
                return (
                  <TableRow key={task.id} hover selected={selected.includes(task.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={selected.includes(task.id)}
                        onChange={() => toggleRow(task.id)}
                        slotProps={{ input: { 'aria-label': `Select ${displayTitle(task)}` } }}
                      />
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                      {displayTitle(task)}
                    </TableCell>

                    <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                      {formatDate(task.created_at)}
                    </TableCell>

                    <TableCell
                      sx={{ whiteSpace: 'nowrap', color: overdue ? 'error.main' : 'text.secondary' }}
                    >
                      {describeDueDate(task.due_at) || '—'}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={columnLabel(board.columns, task.status)}
                      />
                    </TableCell>

                    <TableCell padding="checkbox">
                      <Tooltip title="Delete task">
                        <IconButton
                          size="small"
                          aria-label={`Delete ${displayTitle(task)}`}
                          onClick={() => confirmOne(task)}
                          sx={{ '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.title ?? ''}
        description={pending?.description ?? ''}
        onConfirm={() => pending && remove(pending.ids)}
        onClose={() => setPending(null)}
      />
    </>
  )
}
