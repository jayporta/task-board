import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useBoardContext } from '../context/boardContext'
import { AddColumnButton } from './AddColumnButton'
import { BoardColumn } from './BoardColumn'

export function Board() {
  const { board } = useBoardContext()

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        {board.columns.map((column) => (
          <BoardColumn key={column.id} column={column} />
        ))}

        <AddColumnButton />
      </Stack>
    </Box>
  )
}
