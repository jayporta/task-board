import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

type DialogCloseButtonProps = {
  /** Names the button for screen readers, e.g. "Close task details". */
  label: string
  onClose: () => void
}

/**
 * Overlays the dialog's top-right corner rather than sitting inside
 * `DialogTitle`. MUI points the dialog's `aria-labelledby` at the whole title
 * element, so a button in there gets read out as part of the dialog's name.
 */
export function DialogCloseButton({ label, onClose }: DialogCloseButtonProps) {
  return (
    <Tooltip title="Close">
      <IconButton
        aria-label={label}
        onClick={onClose}
        sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
      >
        <CloseIcon />
      </IconButton>
    </Tooltip>
  )
}
