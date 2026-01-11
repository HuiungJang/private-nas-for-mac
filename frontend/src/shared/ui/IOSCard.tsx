import type {PaperProps} from '@mui/material';
import {Paper, styled} from '@mui/material';

// iOS Card
// - Flat, no shadow
// - Background: #1C1C1E (Secondary System Background)
// - Border Radius: 16px

const StyledPaper = styled(Paper)(({theme}) => ({
  backgroundColor: theme.palette.background.paper, // Uses theme value

  borderRadius: 16,

  padding: theme.spacing(2),

  backgroundImage: 'none', // Remove MUI elevation overlay

  border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'}`, // Subtle separator
}));

export const IOSCard = (props: PaperProps) => {
  return <StyledPaper elevation={0} {...props} />;
};
