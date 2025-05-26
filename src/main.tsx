// Entry point for the React application.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css'; // Your global CSS styles (including Tailwind directives)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Optional DevTools for React Query

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default options for all useQuery hooks
      staleTime: 1000 * 60 * 5, // Data is considered "fresh" for 5 minutes
      gcTime: 1000 * 60 * 15, // Cached data is garbage collected after 15 minutes of inactivity
      refetchOnWindowFocus: true, // Automatically refetch data when window regains focus
      retry: 1, // Retry queries 1 time on failure
    },
    mutations: {
      // Default options for all useMutation hooks
      retry: 0, // Do not automatically retry mutations
    }
  },
});

// Render the root component of the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  // React.StrictMode helps identify potential problems in the application
  <React.StrictMode>
    {/* Provide the QueryClient to the application */}
    <QueryClientProvider client={queryClient}>
      <App /> {/* Your main application component */}
      {/* Add React Query DevTools (visible only in development mode) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);