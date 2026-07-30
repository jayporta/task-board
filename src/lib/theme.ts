import { createTheme } from '@mui/material/styles'

/** Where the light/dark choice is remembered. */
export const MODE_STORAGE_KEY = 'task-board:mode'

/**
 * Declaring both colour schemes lets MUI own the light/dark plumbing — it
 * persists the choice, follows the system when nothing is chosen, and exposes
 * the toggle through `useColorScheme`.
 */
export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  shape: { borderRadius: 8 },
  components: {
    // MUI's required asterisk only reddens on error; make it red throughout so
    // a required field reads as required before anything goes wrong.
    MuiFormLabel: {
      styleOverrides: {
        asterisk: ({ theme }) => ({ color: theme.palette.error.main }),
      },
    },
    // Every dialog in the app wants the same roomier action row.
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingInline: theme.spacing(3),
          paddingBottom: theme.spacing(2),
        }),
      },
    },
  },
})
