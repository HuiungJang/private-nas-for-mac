import React from 'react';
import {AppRouter} from '@/app/providers/RouterProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const queryClient = new QueryClient();
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline/>
          <AppRouter/>
        </ThemeProvider>
      </QueryClientProvider>
  );
}

export default App;
