import React from 'react';
import {Box, Typography} from '@mui/material';
import {LoginForm} from '@/features/auth/ui/LoginForm';
import {IOSCard} from '@/shared/ui';

export const LoginPage: React.FC = () => {
  return (
      <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1c1c1e 0%, #000000 100%)', // Subtle gradient
            p: 2,
          }}
      >
        <IOSCard
            sx={{
              width: '100%',
              maxWidth: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4,
              backdropFilter: 'blur(10px)', // Glass effect on top of gradient
              backgroundColor: 'rgba(28, 28, 30, 0.6)', // More translucent
            }}
        >
          <Typography component="h1" variant="h4" sx={{mb: 1, fontWeight: 700}}>
            Private NAS
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mb: 4}}>
            Secure Cloud Storage
          </Typography>
          <LoginForm/>
        </IOSCard>
      </Box>
  );
};
