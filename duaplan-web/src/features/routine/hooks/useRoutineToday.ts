import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TodayResponse } from '../types';

export function useRoutineToday() {
  return useQuery<TodayResponse>({
    queryKey: ['routines', 'today'],
    queryFn: () => api.get<TodayResponse>('/v1/routines/today'),
  });
}
