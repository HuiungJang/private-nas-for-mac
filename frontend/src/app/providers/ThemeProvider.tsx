import React from 'react';
import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// iOS 17 Design Guidelines (Light Mode)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // iOS System Blue (Light)
    },
    secondary: {
      main: '#5856D6', // iOS System Indigo (Light)
    },
    error: {
      main: '#FF3B30', // iOS System Red (Light)
    },
    background: {
      default: '#F2F2F7', // iOS System Grouped Background (Light)
      paper: '#FFFFFF', // iOS System Background (Light)
    },
    text: {
      primary: '#000000',
      secondary: '#3C3C4399', // Label Color (Secondary) ~60%
    },
    divider: '#3C3C4329', // Separator Color (Opaque)
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
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Translucent White
          backdropFilter: 'blur(20px)', // Glassmorphism
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#C1C1C1 transparent',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#C1C1C1',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#A8A8A8',
          },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
            backgroundColor: '#A8A8A8',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#A8A8A8',
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
