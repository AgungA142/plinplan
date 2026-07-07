import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';
import { useAuthStore } from './features/auth/store/authStore';
import { subscribeCouple } from './lib/realtimeManager';

function RealtimeProvider() {
  const queryClient = useQueryClient();
  const couple = useAuthStore((s) => s.couple);

  useEffect(() => {
    if (couple?.pair_status !== 'active') return;
    const unsubscribe = subscribeCouple(couple.id, queryClient);
    return unsubscribe;
  }, [couple?.id, couple?.pair_status, queryClient]);

  return null;
}

// duaplan uses dark mode by default
document.documentElement.classList.add('dark');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <RealtimeProvider />
        <Toaster position="top-right" richColors closeButton />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
