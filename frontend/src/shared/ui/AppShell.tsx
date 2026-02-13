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
  Popover,
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
  const [taskAnchor, setTaskAnchor] = React.useState<HTMLElement | null>(null);

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
            <IconButton onClick={(e) => setTaskAnchor(e.currentTarget)} sx={{mr: 1}}>
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

      <Popover
        open={Boolean(taskAnchor)}
        anchorEl={taskAnchor}
        onClose={() => setTaskAnchor(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        <TaskCenterPanel/>
      </Popover>
    </Box>
  );
};
