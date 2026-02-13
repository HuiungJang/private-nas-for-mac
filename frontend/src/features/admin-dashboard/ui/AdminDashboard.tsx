import React, {Suspense, useState} from 'react';
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
  TextField,
  Typography
} from '@mui/material';

const SystemHealthWidget = React.lazy(() => import('@/widgets/system-health/ui/SystemHealthWidget').then(m => ({default: m.SystemHealthWidget})));
const UserTable = React.lazy(() => import('@/widgets/user-table/ui/UserTable').then(m => ({default: m.UserTable})));
const AuditLogTable = React.lazy(() => import('@/widgets/audit-log-table/ui/AuditLogTable').then(m => ({default: m.AuditLogTable})));
import {useSystemHealth} from '@/entities/system/model/useSystemHealth';
import {useUserMutations, useUsers} from '@/entities/user/model/useUsers';
import {useAuditLogs} from '@/entities/audit/model/useAuditLogs';
import {useNotificationStore} from '@/shared/model/useNotificationStore';

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
  const {data: auditLogs, isLoading: isAuditLoading} = useAuditLogs();
  const {createUser} = useUserMutations();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleCreateUser = async (data: any) => {
    try {
      await createUser(data);
      showNotification('User created successfully', 'success');
    } catch (e) {
      console.error(e);
      // Error is handled globally by axios interceptor, but we catch here to prevent crash
    }
  };

  return (
      <Box>
        <Box sx={{mb: 2}}>
          <Typography variant="h5" sx={{fontWeight: 700, mb: 0.5}}>Admin Center</Typography>
          <Typography variant="body2" color="text.secondary">시스템 상태, 사용자, 감사 로그를 관리합니다.</Typography>
        </Box>
        <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="admin tabs"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {minHeight: 40, fontSize: 13, fontWeight: 600},
              '& .MuiTabs-indicator': {height: 2}
            }}
          >
            <Tab label="System Health"/>
            <Tab label="User Management"/>
            <Tab label="Audit Logs"/>
          </Tabs>
        </Box>

        <Suspense fallback={<Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress/></Box>}>
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

          {tab === 2 && (
              isAuditLoading ? (
                  <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                    <CircularProgress/>
                  </Box>
              ) : auditLogs && (
                  <AuditLogTable logs={auditLogs}/>
              )
          )}
        </Suspense>
      </Box>
  );
};
