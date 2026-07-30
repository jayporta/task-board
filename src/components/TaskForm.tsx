import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useBoardContext } from '../context/boardContext';
import { UNTITLED_LABEL } from '../lib/board';
import type { Task } from '../types';

/**
 * The task details form. Mounted only while its dialog is open, so its fields
 * start from the task each time rather than needing to resync.
 */
export function TaskForm({ task }: { task: Task }) {
  const { dispatch, closeDetails } = useBoardContext();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [dueAt, setDueAt] = useState<Dayjs | null>(
    task.due_at ? dayjs(task.due_at) : null,
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch({
      type: 'edit_task',
      id: task.id,
      title,
      description,
      due_at: dueAt?.toISOString(),
    });
    closeDetails();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>
        Task details
        <Tooltip title="Close">
          {/* Discards the draft, like Cancel — `type` stays "button" so the
              form is not submitted. */}
          <IconButton
            aria-label="Close task details"
            onClick={closeDetails}
            sx={{ mr: -1 }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Title"
            placeholder={UNTITLED_LABEL}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <DatePicker
            label="Due date"
            value={dueAt}
            onChange={setDueAt}
            slotProps={{
              field: { clearable: true },
              textField: { fullWidth: true },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={closeDetails}>Cancel</Button>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Box>
  );
}
