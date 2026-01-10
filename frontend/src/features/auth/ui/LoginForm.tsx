import React, {useState} from 'react';
import {Alert, Box, Button, TextField} from '@mui/material';
import {apiClient} from '@/shared/api/axios';
import {useAuthStore} from '@/entities/user/model/store';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await apiClient.post('/auth/login', {username, password});
      login(response.data.token);
    } catch (err: any) {
      console.log('Login Error:', err);
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
      <Box component="form" onSubmit={handleSubmit} sx={{mt: 1}}>
        {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

        <TextField
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
        <TextField
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
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{mt: 3, mb: 2}}
        >
          Sign In
        </Button>
      </Box>
  );
};
