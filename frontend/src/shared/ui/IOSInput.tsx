import type {TextFieldProps} from '@mui/material';
import {styled, TextField} from '@mui/material';

const StyledTextField = styled(TextField)(({theme}) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: '#b6c2d2',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      boxShadow: '0 0 0 3px rgba(31, 111, 235, 0.15)',
    },
    '& input': {
      padding: '10px 12px',
      color: theme.palette.text.primary,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

export const IOSInput = (props: TextFieldProps) => {
  return <StyledTextField variant="outlined" fullWidth {...props} />;
};
