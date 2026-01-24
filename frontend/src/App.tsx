import {AppRouter} from '@/app/providers/RouterProvider';
import {AppThemeProvider} from '@/app/providers/ThemeProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NotificationSnackbar} from '@/shared/ui/NotificationSnackbar';

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
          <NotificationSnackbar/>
        </AppThemeProvider>
      </QueryClientProvider>
  );
}

export default App;
