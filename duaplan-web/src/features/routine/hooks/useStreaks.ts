import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StreaksResponse } from '../types';

export function useStreaks() {
  return useQuery<StreaksResponse>({
    queryKey: ['routines', 'streaks'],
    queryFn: () => api.get<StreaksResponse>('/v1/routines/streaks'),
  });
}
