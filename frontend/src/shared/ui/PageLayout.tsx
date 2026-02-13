import React from 'react';
import {AppBar, Box, IconButton, styled, Toolbar, Typography} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {useNavigate} from 'react-router-dom';

const DesktopAppBar = styled(AppBar)(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  zIndex: 1100,
}));

const ContentContainer = styled(Box)(({theme}) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
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
      <DesktopAppBar elevation={0}>
        <Toolbar>
          {showBack && (
            <IconButton
              edge="start"
              color="primary"
              aria-label="back"
              onClick={() => navigate(-1)}
              sx={{mr: 1}}
            >
              <ArrowBackIosNewIcon sx={{fontSize: 18}}/>
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{flexGrow: 1, fontWeight: 700}}>
            {title}
          </Typography>
          {actions}
        </Toolbar>
      </DesktopAppBar>
      <ContentContainer>{children}</ContentContainer>
    </Box>
  );
};
