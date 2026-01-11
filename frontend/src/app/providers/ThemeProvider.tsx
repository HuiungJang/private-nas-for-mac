import React from 'react';
import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// iOS 17 Design Guidelines (Dark Mode)
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A84FF', // iOS System Blue (Dark)
    },
    secondary: {
      main: '#5E5CE6', // iOS System Indigo (Dark)
    },
    error: {
      main: '#FF453A', // iOS System Red (Dark)
    },
    background: {
      default: '#000000', // iOS System Background (Dark)
      paper: '#1C1C1E', // iOS Secondary System Background (Dark)
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#EBEBF599', // Label Color (Secondary) ~60%
    },
    divider: '#38383A', // Separator Color
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"San Francisco"',
      '"Helvetica Neue"',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {fontWeight: 700},
    h2: {fontWeight: 700},
    h3: {fontWeight: 600},
    h4: {fontWeight: 600},
    h5: {fontWeight: 600},
    h6: {fontWeight: 600},
    button: {
      textTransform: 'none', // No uppercase for buttons
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // More rounded corners (iOS style)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50, // Pill shape
          padding: '8px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove Material elevation overlays
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(28, 28, 30, 0.8)', // Translucent
          backdropFilter: 'blur(20px)', // Glassmorphism
          boxShadow: 'none',
          borderBottom: '1px solid #38383A',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1C1C1E',
          backgroundImage: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#6b6b6b',
            minHeight: 24,
          },
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline/>
        {children}
      </MuiThemeProvider>
  );
};
