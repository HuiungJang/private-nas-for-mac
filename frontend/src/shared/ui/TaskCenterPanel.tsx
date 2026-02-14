import React from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {useTaskCenterStore} from '@/shared/model/useTaskCenterStore';

const statusColorMap = {
  running: 'default',
  success: 'success',
  failed: 'error',
} as const;

export const TaskCenterPanel: React.FC = () => {
  const tasks = useTaskCenterStore((s) => s.tasks);
  const clearFinished = useTaskCenterStore((s) => s.clearFinished);
  const dismissTask = useTaskCenterStore((s) => s.dismissTask);
  const retryTask = useTaskCenterStore((s) => s.retryTask);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <Box sx={{width: 360, maxWidth: '100vw', p: 2}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
        <Typography variant="subtitle1" sx={{fontWeight: 700}}>Task Center</Typography>
        <Button size="small" onClick={clearFinished}>Clear finished</Button>
      </Box>
      <Divider sx={{mb: 1}}/>

      {tasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No tasks yet.</Typography>
      ) : (
        <List dense>
          {tasks.map((task) => (
            <ListItem key={task.id} disableGutters sx={{display: 'block', py: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                <ListItemText
                  primary={task.label}
                  secondary={task.errorMessage || new Date(task.startedAt).toLocaleTimeString()}
                />
                <Chip size="small" label={task.status} color={statusColorMap[task.status]}/>
              </Box>
              <Stack direction="row" spacing={1} sx={{mt: 0.5}}>
                {task.status === 'failed' && (
                  <Button size="small" onClick={() => retryTask(task.id)}>Retry</Button>
                )}
                <Button size="small" onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}>
                  {expandedId === task.id ? 'Hide details' : 'Details'}
                </Button>
                <Button size="small" color="inherit" onClick={() => dismissTask(task.id)}>
                  Dismiss
                </Button>
              </Stack>
              <Collapse in={expandedId === task.id}>
                <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 0.75}}>
                  {task.details || task.errorMessage || `Started at ${new Date(task.startedAt).toLocaleString()}`}
                </Typography>
              </Collapse>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
