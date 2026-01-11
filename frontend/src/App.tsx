import {AppRouter} from '@/app/providers/RouterProvider';
import {AppThemeProvider} from '@/app/providers/ThemeProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AppRouter/>
        </AppThemeProvider>
      </QueryClientProvider>
  );
}

export default App;
