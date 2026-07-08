import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Routine } from '../types';

export function useRoutines() {
  return useQuery<Routine[]>({
    queryKey: ['routines', 'list'],
    queryFn: () => api.get<Routine[]>('/v1/routines'),
  });
}

export function useCreateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Routine>('/v1/routines', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  });
}

export function useUpdateRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown> & { id: string }) =>
      api.put<Routine>(`/v1/routines/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  });
}

export function useDeleteRoutine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/v1/routines/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines'] }),
  });
}

export function useToggleComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      completed
        ? api.delete<void>(`/v1/routines/${id}/complete`)
        : api.post<void>(`/v1/routines/${id}/complete`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['routines', 'today'] }),
  });
}
