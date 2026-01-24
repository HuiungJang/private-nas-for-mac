import React from 'react';
import {Alert, Snackbar} from '@mui/material';
import {useNotificationStore} from '@/shared/model/useNotificationStore';

export const NotificationSnackbar: React.FC = () => {
  const {open, message, severity, hideNotification} = useNotificationStore();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  return (
      <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{width: '100%'}}>
          {message}
        </Alert>
      </Snackbar>
  );
};
