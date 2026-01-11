import type {TextFieldProps} from '@mui/material';
import {styled, TextField} from '@mui/material';

// iOS Input Style
// - Gray background (#1C1C1E or #2C2C2E)
// - No border (unless focused, maybe subtle blue ring)
// - Rounded corners (10px-12px)
// - Large padding

const StyledTextField = styled(TextField)(({theme}) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#1C1C1E', // Secondary System Background
    borderRadius: 12,
    transition: 'background-color 0.2s',
    '& fieldset': {
      border: 'none', // Remove default border
    },
    '&:hover': {
      backgroundColor: '#2C2C2E',
    },
    '&.Mui-focused': {
      backgroundColor: '#2C2C2E',
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}`, // Focus ring
    },
    '& input': {
      padding: '12px 16px',
      color: theme.palette.text.primary,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    transform: 'translate(14px, 14px) scale(1)',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
      transform: 'translate(14px, -9px) scale(0.75)',
    },
    '&.MuiFormLabel-filled': {
      transform: 'translate(14px, -9px) scale(0.75)',
    }
  },
}));

export const IOSInput = (props: TextFieldProps) => {
  return <StyledTextField variant="outlined" fullWidth {...props} />;
};

