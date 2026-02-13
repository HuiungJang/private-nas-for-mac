import React from 'react';
import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Synology DSM-inspired desktop theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f6feb',
      dark: '#1a5cc1',
      light: '#4f8cf0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b',
    },
    error: {
      main: '#d92d20',
    },
    success: {
      main: '#1f9d55',
    },
    warning: {
      main: '#b7791f',
    },
    background: {
      default: '#f3f6fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#dbe2ea',
  },
  typography: {
    fontFamily: ['"Noto Sans KR"', 'Inter', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h1: {fontWeight: 700},
    h2: {fontWeight: 700},
    h3: {fontWeight: 700},
    h4: {fontWeight: 700},
    h5: {fontWeight: 600},
    h6: {fontWeight: 600},
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 14px',
          boxShadow: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #dbe2ea',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #e3e8ef',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e3e8ef',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f3f6fa',
          color: '#0f172a',
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
