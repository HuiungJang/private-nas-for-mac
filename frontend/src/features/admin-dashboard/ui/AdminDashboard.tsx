import React, {useState} from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Tab,
  Tabs,
  TextField
} from '@mui/material';
import {SystemHealthWidget} from '@/widgets/system-health/ui/SystemHealthWidget';
import {UserTable} from '@/widgets/user-table/ui/UserTable';
import {useSystemHealth} from '@/entities/system/model/useSystemHealth';
import {useUserMutations, useUsers} from '@/entities/user/model/useUsers';

// Simple Create User Modal (Internal to Dashboard for now)
const CreateUserModal = ({open, onClose, onCreate}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = () => {
    onCreate({
      username,
      password,
      roles: isAdmin ? ['USER', 'ADMIN'] : ['USER']
    });
    onClose();
  };

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{mt: 1}}>
            <TextField
                label="Username"
                fullWidth
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <FormControlLabel
                control={<Checkbox checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)}/>}
                label="Administrator Access"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>
  );
};

export const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const {data: healthData, isLoading: isHealthLoading} = useSystemHealth();
  const {data: usersData, isLoading: isUsersLoading} = useUsers();
  const {createUser} = useUserMutations();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleCreateUser = async (data: any) => {
    try {
      await createUser(data);
    } catch (e) {
      console.error(e);
      alert('Failed to create user');
    }
  };

  return (
      <Box>
        <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
          <Tabs value={tab} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="System Health"/>
            <Tab label="User Management"/>
          </Tabs>
        </Box>

        {tab === 0 && (
            <SystemHealthWidget data={healthData} isLoading={isHealthLoading}/>
        )}

        {tab === 1 && (
            isUsersLoading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                  <CircularProgress/>
                </Box>
            ) : usersData && (
                <>
                  <UserTable users={usersData} onAddUser={() => setIsUserModalOpen(true)}/>
                  <CreateUserModal
                      open={isUserModalOpen}
                      onClose={() => setIsUserModalOpen(false)}
                      onCreate={handleCreateUser}
                  />
                </>
            )
        )}
      </Box>
  );
};
