import { createTheme, ThemeProvider } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

const theme = createTheme({
  palette: { mode: 'light' },
  shape: { borderRadius: 8 },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
        <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          />
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
