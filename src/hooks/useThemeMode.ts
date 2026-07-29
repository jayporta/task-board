import { useEffect, useMemo, useState } from 'react'
import { buildTheme, loadMode, saveMode, type ThemeMode } from '../lib/theme'

/** Light/dark preference, persisted, with the matching MUI theme. */
export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>(loadMode)

  useEffect(() => {
    saveMode(mode)
  }, [mode])

  const theme = useMemo(() => buildTheme(mode), [mode])
  const toggleMode = () => setMode((current) => (current === 'dark' ? 'light' : 'dark'))

  return { mode, toggleMode, theme }
}
