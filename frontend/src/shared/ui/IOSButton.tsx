import {Button, ButtonProps, styled} from '@mui/material';

// iOS Button Variants
// 1. Primary: Filled Blue (Standard MUI Contained)
// 2. Tonal: Gray background, Blue text (Common in iOS)
// 3. Text: Plain Blue text

interface IOSButtonProps extends ButtonProps {
  variant?: 'contained' | 'outlined' | 'text' | 'tonal';
}

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<IOSButtonProps>(({theme, variant}) => ({
  borderRadius: 50, // Pill shape
  textTransform: 'none', // No uppercase
  fontSize: '17px', // Standard iOS body size
  fontWeight: 600,
  padding: '10px 24px',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',

  '&:active': {
    transform: 'scale(0.96)', // Subtle press effect
  },

  ...(variant === 'tonal' && {
    backgroundColor: '#2C2C2E', // Tertiary System Fill
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: '#3A3A3C',
    },
  }),
}));

export const IOSButton = (props: IOSButtonProps) => {
  // Map 'tonal' to no variant prop for underlying MUI Button if needed,
  // but we handle styles manually.
  // We'll pass 'contained' to MUI if it's tonal to get the ripple,
  // but override background.

  const muiVariant = props.variant === 'tonal' ? 'contained' : props.variant;

  return <StyledButton disableElevation {...props} variant={muiVariant as any}/>;
};
