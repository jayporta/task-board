import { createTheme, ThemeProvider } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          alignItems: 'start',
          // min() lets a track shrink below 280px on very narrow screens.
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
        }}
      >
        {board.columns.map((column) => (
          <BoardColumn key={column.id} column={column} />
        ))}
      </Box>
    </Container>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <BoardProvider>
          <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
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
