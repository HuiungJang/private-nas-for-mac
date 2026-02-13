import type {ButtonProps} from '@mui/material';
import {Button, styled} from '@mui/material';

interface IOSButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text' | 'tonal';
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<IOSButtonProps>(({theme, variant}) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 600,
  padding: '8px 14px',
  boxShadow: 'none',
  transition: 'all 0.15s ease-in-out',

  '&:active': {
    transform: 'translateY(1px)',
  },

  ...((variant as string) === 'tonal' && {
    backgroundColor: '#edf2f7',
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: '#e2e8f0',
    },
  }),
}));

export const IOSButton = (props: IOSButtonProps) => {
  const muiVariant = props.variant === 'tonal' ? 'contained' : props.variant;
  return <StyledButton disableElevation {...props} variant={muiVariant as any}/>;
};
