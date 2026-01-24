import React from 'react';
import {Box, Typography, useMediaQuery, useTheme} from '@mui/material';
import {LoginForm} from '@/features/auth/ui/LoginForm';
import {IOSCard} from '@/shared/ui';

export const LoginPage: React.FC = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isLight = theme.palette.mode === 'light';

  return (
      <Box
          sx={{
            minHeight: '100vh',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            background: isLight
                ? 'radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F2F2F7 100%)'
                : 'radial-gradient(circle at 50% 50%, #1c1c1e 0%, #000000 100%)',

            p: isMobile ? 0 : 2,
          }}
      >
        <IOSCard
            sx={{
              width: '100%',

              maxWidth: isMobile ? '100%' : 400,

              minHeight: isMobile ? '100vh' : 'auto',

              display: 'flex',

              flexDirection: 'column',

              alignItems: 'center',

              justifyContent: 'center',

              p: isMobile ? 3 : 4,

              backdropFilter: 'blur(10px)',

              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(28, 28, 30, 0.6)',

              borderRadius: isMobile ? 0 : 4,

              border: isMobile ? 'none' : undefined,
            }}
        >
          <Typography component="h1" variant={isMobile ? 'h4' : 'h4'} sx={{mb: 1, fontWeight: 700}}>
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
