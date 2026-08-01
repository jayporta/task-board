import { ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { Board } from './components/Board'
import { BoardToolbar } from './components/BoardToolbar'
import { TaskDialog } from './components/TaskDialog'
import { BoardProvider } from './context/BoardProvider'
import { MODE_STORAGE_KEY, theme } from './lib/theme'

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
