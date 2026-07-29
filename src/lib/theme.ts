import { createTheme, type Theme } from '@mui/material/styles'

export type ThemeMode = 'light' | 'dark'

export const MODE_STORAGE_KEY = 'task-board:mode'

export function buildTheme(mode: ThemeMode): Theme {
  return createTheme({
    palette: { mode },
    shape: { borderRadius: 8 },
  })
}

/** The saved preference, falling back to whatever the system asks for. */
export function loadMode(): ThemeMode {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // ignore — fall through to the system preference
  }

  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** Best-effort, like the board itself: a blocked quota must not break the UI. */
export function saveMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode)
  } catch {
    // ignore
  }
}
