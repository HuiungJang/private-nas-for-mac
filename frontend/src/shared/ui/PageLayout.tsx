import React from 'react';
import {AppBar, Box, IconButton, styled, Toolbar, Typography} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {useNavigate} from 'react-router-dom';

// Glassmorphic Header

const GlassAppBar = styled(AppBar)(({theme}) => ({
  backgroundColor:
      theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',

  backdropFilter: 'blur(20px) saturate(180%)', // iOS Blur

  borderBottom: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`,

  color: theme.palette.text.primary,

  position: 'sticky',

  top: 0,

  zIndex: 1100,

  // Handle iOS Status Bar
  paddingTop: 'env(safe-area-inset-top)',
}));

const ContentContainer = styled(Box)(({theme}) => ({
  flexGrow: 1,

  // Responsive Padding
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },

  // iOS Safe Area Support
  paddingTop: `calc(${theme.spacing(2)} + env(safe-area-inset-top))`,
  paddingBottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`,
  paddingLeft: `calc(${theme.spacing(2)} + env(safe-area-inset-left))`,
  paddingRight: `calc(${theme.spacing(2)} + env(safe-area-inset-right))`,

  [theme.breakpoints.up('sm')]: {
    paddingTop: `calc(${theme.spacing(3)} + env(safe-area-inset-top))`,
    paddingBottom: `calc(${theme.spacing(3)} + env(safe-area-inset-bottom))`,
    paddingLeft: `calc(${theme.spacing(3)} + env(safe-area-inset-left))`,
    paddingRight: `calc(${theme.spacing(3)} + env(safe-area-inset-right))`,
  },

  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({title, children, showBack, actions}) => {
  const navigate = useNavigate();

  return (
      <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <GlassAppBar elevation={0}>
          <Toolbar>
            {showBack && (
                <IconButton
                    edge="start"
                    color="primary" // iOS Back buttons are typically blue
                    aria-label="back"
                    onClick={() => navigate(-1)}
                    sx={{mr: 1}}
                >
                  <ArrowBackIosNewIcon sx={{fontSize: 20}}/>
                </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{flexGrow: 1, fontWeight: 700}}>
              {title}
            </Typography>
            {actions}
          </Toolbar>
        </GlassAppBar>
        <ContentContainer>{children}</ContentContainer>
      </Box>
  );
};
