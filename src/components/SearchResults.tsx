import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Typography from '@mui/material/Typography'
import { useBoardContext } from '../context/boardContext'
import { columnLabel, displayTitle, searchTasks } from '../lib/board'

/** Results for the toolbar search, listed beneath the field it is anchored to. */
export function SearchResults({ anchorEl }: { anchorEl: HTMLElement | null }) {
  const { board, query, setQuery, openDetails } = useBoardContext()
  const results = searchTasks(board.tasks, query)
  const open = query.trim().length > 0 && anchorEl !== null

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 1 }}
    >
      <Paper
        elevation={6}
        sx={{ mt: 1, width: anchorEl?.offsetWidth, maxHeight: 320, overflowY: 'auto' }}
      >
        {results.length === 0 ? (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              No tasks match “{query.trim()}”
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {results.map((task) => (
              <ListItemButton
                key={task.id}
                onClick={() => {
                  openDetails(task)
                  setQuery('')
                }}
              >
                <ListItemText
                  primary={displayTitle(task)}
                  secondary={columnLabel(board.columns, task.status)}
                  slotProps={{
                    primary: { noWrap: true, sx: { fontWeight: 600 } },
                    secondary: { variant: 'caption' },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>
    </Popper>
  )
}
