import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

export function BoardToolbar() {
  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
          Task Board
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
