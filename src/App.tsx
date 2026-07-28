import { createTheme, ThemeProvider } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { BoardColumn } from './components/BoardColumn'
import { useBoard } from './hooks/useBoard'
import { visibleTasks } from './lib/board'
import { SAMPLE_TASKS } from './lib/samples'

const theme = createTheme({
  palette: { mode: 'light' },
  shape: { borderRadius: 8 },
})

function App() {
  const { board } = useBoard()

  // Placeholder until the create dialog lands in the next slice.
  const tasks = board.tasks.length > 0 ? board.tasks : SAMPLE_TASKS

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
              Task Board
            </Typography>
          </Toolbar>
        </AppBar>

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
              <BoardColumn
                key={column.id}
                column={column}
                tasks={visibleTasks(tasks, column.status)}
              />
            ))}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
