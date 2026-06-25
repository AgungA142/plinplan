import type { QueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

/**
 * Subscribe ke semua Supabase Realtime channels untuk couple.
 * Setiap perubahan data akan menginvalidate TanStack Query cache
 * sehingga UI kedua pasangan terupdate otomatis.
 *
 * @returns cleanup function — panggil saat logout atau unmount
 */
export function subscribeCouple(
  coupleId: string,
  queryClient: QueryClient
): () => void {
  const invalidate = (...keys: string[]) => () => {
    keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
  };

  const channel = supabase
    .channel(`couple:${coupleId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events', filter: `couple_id=eq.${coupleId}` },
      invalidate('events')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'routine_logs', filter: `couple_id=eq.${coupleId}` },
      invalidate('routines', 'today')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'expenses', filter: `couple_id=eq.${coupleId}` },
      invalidate('expenses', 'budgets', 'monitoring')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'incomes', filter: `couple_id=eq.${coupleId}` },
      invalidate('incomes', 'cashflow', 'monitoring')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'expense_budgets', filter: `couple_id=eq.${coupleId}` },
      invalidate('budgets')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'savings_contributions' },
      invalidate('savings')
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
