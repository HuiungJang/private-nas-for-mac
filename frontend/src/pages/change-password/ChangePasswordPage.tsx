import React, {useState} from 'react';
import {Alert, Box, Card, CardContent, Typography} from '@mui/material';
import {AxiosError} from 'axios';
import {apiClient} from '@/shared/api/axios';
import {IOSButton, IOSInput} from '@/shared/ui';
import {useAuthStore} from '@/entities/user/model/store';
import {useNavigate} from 'react-router-dom';

export const ChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const setMustChangePassword = useAuthStore((state) => state.setMustChangePassword);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', {replace: true});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      await apiClient.post('/auth/change-password', {currentPassword, newPassword});
      setMustChangePassword(false);
      setSuccess('Password changed successfully.');
      navigate('/', {replace: true});
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to change password.');
      }
    }
  };

  return (
    <Box sx={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2}}>
      <Card sx={{width: '100%', maxWidth: 480}}>
        <CardContent>
          <Typography variant="h5" sx={{fontWeight: 700, mb: 1}}>Change Initial Password</Typography>
          <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            For security, you must change the bootstrap admin password before using the system.
          </Typography>

          {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
          {success && <Alert severity="success" sx={{mb: 2}}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <IOSInput
              fullWidth
              margin="normal"
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <IOSInput
              fullWidth
              margin="normal"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <IOSInput
              fullWidth
              margin="normal"
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <IOSButton fullWidth type="submit" variant="contained" sx={{mt: 2}}>Update Password</IOSButton>
            <IOSButton fullWidth type="button" variant="text" sx={{mt: 1}} onClick={handleLogout}>
              Logout
            </IOSButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
