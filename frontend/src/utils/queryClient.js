import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute default stale time
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
      retry: 1, // Max 1 retry on network failure
      refetchOnWindowFocus: false, // Prevent aggressive refetching on tab focus
      refetchOnReconnect: 'always',
    },
  },
});

export default queryClient;
