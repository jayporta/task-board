import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type BoardColumnEmptyStateProps = {
  /** Headline — what is missing from this column. */
  title: string
  /** Optional nudge toward the action that would fill the column. */
  description?: string
}

export function BoardColumnEmptyState({ title, description }: BoardColumnEmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', px: 2, py: 4, color: 'text.secondary' }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  )
}
