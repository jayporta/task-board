import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
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
