import React, {useState} from 'react';
import {Alert, Box} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {AxiosError} from 'axios';
import {apiClient} from '@/shared/api/axios';
import {useAuthStore} from '@/entities/user/model/store';
import {IOSButton, IOSInput} from '@/shared/ui';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password,
      });
      const mustChangePassword = Boolean(response.data.mustChangePassword);
      login(response.data.token, mustChangePassword);
      navigate(mustChangePassword ? '/change-password' : '/', {replace: true});
    } catch (err: unknown) {
      console.log('Login Error:', err);
      if (err instanceof AxiosError && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed');
      }
    }
  };

  return (
      <Box component="form" onSubmit={handleSubmit} sx={{mt: 1, width: '100%'}}>
        {error && (
            <Alert severity="error" sx={{mb: 2, borderRadius: 3}}>
              {error}
            </Alert>
        )}

        <IOSInput
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <IOSInput
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <IOSButton type="submit" fullWidth variant="contained" sx={{mt: 4, mb: 2}} size="large">
          Sign In
        </IOSButton>
      </Box>
  );
};
