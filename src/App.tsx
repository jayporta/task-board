import { createTheme, ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AddColumnButton } from './components/AddColumnButton'
import { BoardColumn } from './components/BoardColumn'
import { BoardToolbar } from './components/BoardToolbar'
import { TaskDialog } from './components/TaskDialog'
import { BoardProvider } from './context/BoardProvider'
import { useBoardContext } from './context/boardContext'

const theme = createTheme({
  palette: { mode: 'light' },
  shape: { borderRadius: 8 },
})

function Board() {
  const { board } = useBoardContext()

  return (
    // The scroller fills the space under the header, so its horizontal bar sits
    // at the bottom of the window rather than under the tallest column.
    // px matches the Toolbar gutters, lining the columns up with the heading.
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      {/* One horizontal row rather than a wrapping grid, so the add button
          always sits directly beside the last column. */}
      <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 2, alignItems: 'flex-start' }}>
        {board.columns.map((column) => (
          <BoardColumn key={column.id} column={column} />
        ))}

        <AddColumnButton />
      </Box>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
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
