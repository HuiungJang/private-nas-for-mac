import React from 'react';
import {Avatar, Box, Container, CssBaseline, Typography} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {LoginForm} from '@/features/auth/ui/LoginForm';

export const LoginPage: React.FC = () => {
  return (
      <Container component="main" maxWidth="xs">
        <CssBaseline/>
        <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
        >
          <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
            <LockOutlinedIcon/>
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <LoginForm/>
        </Box>
      </Container>
  );
};
