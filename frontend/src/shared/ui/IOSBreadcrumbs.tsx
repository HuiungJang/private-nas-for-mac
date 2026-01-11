import React from 'react';
import {Box, Breadcrumbs, Link, styled, Typography} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import type {PathNode} from '@/entities/file/model/types';

const StyledBreadcrumbs = styled(Breadcrumbs)(({theme}) => ({
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.text.secondary,
    marginLeft: 8,
    marginRight: 8,
  },
  '& .MuiBreadcrumbs-ol': {
    alignItems: 'center',
    flexWrap: 'nowrap', // Prevent wrapping
  },
}));

const ScrollContainer = styled(Box)({
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  paddingBottom: '4px', // Space for scrollbar if visible, or touch area
  // Hide scrollbar
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
});

const StyledLink = styled(Link)(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.primary.main, // iOS Blue
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  '&:hover': {
    opacity: 0.7,
    textDecoration: 'none',
  },
  '&:active': {
    opacity: 0.5,
  },
}));

const CurrentPathText = styled(Typography)(({theme}) => ({
  color: theme.palette.text.primary,
  fontSize: '17px',
  fontWeight: 600,
}));

interface IOSBreadcrumbsProps {
  breadcrumbs: PathNode[];
  onNavigate: (path: string) => void;
}

export const IOSBreadcrumbs: React.FC<IOSBreadcrumbsProps> = ({breadcrumbs, onNavigate}) => {
  return (
      <ScrollContainer>
      <StyledBreadcrumbs
          separator={
            <NavigateNextIcon fontSize="small" sx={{color: 'text.secondary', opacity: 0.5}}/>
          }
          aria-label="breadcrumb"
      >
        {breadcrumbs.map((node, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
                <CurrentPathText key={node.path} aria-current="page">
                  {node.name}
                </CurrentPathText>
            );
          }

          return (
              <StyledLink
                  key={node.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(node.path);
                  }}
              >
                {node.name}
              </StyledLink>
          );
        })}
      </StyledBreadcrumbs>
      </ScrollContainer>
  );
};
