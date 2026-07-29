import { useState } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SearchIcon from '@mui/icons-material/Search'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useBoardContext } from '../context/boardContext'
import type { ThemeMode } from '../lib/theme'
import { SearchResults } from './SearchResults'

type BoardToolbarProps = {
  mode: ThemeMode
  onToggleMode: () => void
}

export function BoardToolbar({ mode, onToggleMode }: BoardToolbarProps) {
  const { query, setQuery } = useBoardContext()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

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

        <TextField
          size="small"
          placeholder="Search tasks"
          value={query}
          ref={setAnchorEl}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Escape' && setQuery('')}
          sx={{ ml: 'auto', width: { xs: 160, sm: 260 } }}
          slotProps={{
            htmlInput: { 'aria-label': 'Search tasks' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Clear search" onClick={() => setQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <SearchResults anchorEl={anchorEl} />

        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={onToggleMode}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}
