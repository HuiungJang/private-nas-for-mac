import type {PaperProps} from '@mui/material';
import {Paper, styled} from '@mui/material';

const StyledPaper = styled(Paper)(({theme}) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  padding: theme.spacing(2),
  backgroundImage: 'none',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
}));

export const IOSCard = (props: PaperProps) => {
  return <StyledPaper elevation={0} {...props} />;
};
