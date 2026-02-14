import React from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuthStore} from '@/entities/user/model/store';
import {useTaskCenterStore} from '@/shared/model/useTaskCenterStore';
import {TaskCenterPanel} from '@/shared/ui/TaskCenterPanel';

const drawerWidth = 220;

const navItems = [
  {label: 'Files', path: '/'},
  {label: 'Administration', path: '/admin'},
];

const getTitle = (pathname: string) => {
  if (pathname === '/admin') return 'Administration';
  return 'Files';
};

export const AppShell: React.FC<{children: React.ReactNode}> = ({children}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const tasks = useTaskCenterStore((s) => s.tasks);
  const runningCount = tasks.filter((t) => t.status === 'running').length;
  const successCount = tasks.filter((t) => t.status === 'success').length;
  const failedCount = tasks.filter((t) => t.status === 'failed').length;
  const [taskDockOpen, setTaskDockOpen] = React.useState(false);

  const drawer = (
    <Box sx={{height: '100%', bgcolor: 'background.paper'}}>
      <Toolbar>
        <Typography variant="subtitle1" sx={{fontWeight: 700}}>Private NAS</Typography>
      </Toolbar>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setOpen(false);
            }}
          >
            <ListItemText primary={item.label}/>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{display: 'flex', minHeight: '100vh', bgcolor: 'background.default'}}>
      {isMobile ? (
        <Drawer open={open} onClose={() => setOpen(false)}>
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {width: drawerWidth, boxSizing: 'border-box'},
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box sx={{flex: 1, minWidth: 0}}>
        <AppBar position="sticky" color="default" elevation={0}>
          <Toolbar>
            {isMobile && (
              <IconButton edge="start" sx={{mr: 1}} onClick={() => setOpen(true)}>
                <MenuIcon/>
              </IconButton>
            )}
            <Typography variant="h6" sx={{flexGrow: 1, fontWeight: 700}}>
              {getTitle(location.pathname)}
            </Typography>
            <IconButton onClick={() => setTaskDockOpen((v) => !v)} sx={{mr: 1}}>
              <Badge color="primary" badgeContent={runningCount}>
                <TaskAltIcon/>
              </Badge>
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                logout();
                navigate('/login', {replace: true});
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{p: {xs: 2, md: 3}}}>{children}</Box>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: (t) => t.zIndex.drawer + 2,
          width: {xs: 'calc(100vw - 32px)', sm: 380},
          maxWidth: '100vw',
        }}
      >
        <Paper elevation={6} sx={{borderRadius: 2, overflow: 'hidden'}}>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
              cursor: 'pointer',
            }}
            onClick={() => setTaskDockOpen((v) => !v)}
          >
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <TaskAltIcon fontSize="small"/>
              <Typography variant="body2" sx={{fontWeight: 700}}>Task Center</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              running {runningCount} · ok {successCount} · failed {failedCount}
            </Typography>
          </Box>
          {taskDockOpen && <TaskCenterPanel/>}
        </Paper>
      </Box>
    </Box>
  );
};
