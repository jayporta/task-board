import { ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Stack from '@mui/material/Stack'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AddColumnButton } from './components/AddColumnButton'
import { BoardColumn } from './components/BoardColumn'
import { BoardToolbar } from './components/BoardToolbar'
import { TaskDialog } from './components/TaskDialog'
import { BoardProvider } from './context/BoardProvider'
import { useBoardContext } from './context/boardContext'
import { MODE_STORAGE_KEY, theme } from './lib/theme'

function Board() {
  const { board } = useBoardContext()

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        {board.columns.map((column) => (
          <BoardColumn key={column.id} column={column} />
        ))}

        <AddColumnButton />
      </Stack>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="system" modeStorageKey={MODE_STORAGE_KEY}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <BoardProvider>
          <Box
            sx={{
              height: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
            }}
          >
            <BoardToolbar />
            <Board />
          </Box>
          <TaskDialog />
        </BoardProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
