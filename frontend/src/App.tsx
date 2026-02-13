import {AppRouter} from '@/app/providers/RouterProvider';
import {AppThemeProvider} from '@/app/providers/ThemeProvider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NotificationSnackbar} from '@/shared/ui/NotificationSnackbar';
import {shouldRetryRequest} from '@/shared/api/axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (failureCount >= 2) return false;
        const status = error?.response?.status as number | undefined;
        const method = error?.config?.method as string | undefined;
        return shouldRetryRequest(status, method);
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
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
