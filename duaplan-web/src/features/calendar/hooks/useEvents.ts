import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CalendarEvent } from '@/types';

export function useEvents(start: Date, end: Date) {
  return useQuery<CalendarEvent[]>({
    queryKey: ['events', start.toISOString(), end.toISOString()],
    queryFn: () =>
      api.get<CalendarEvent[]>(
        `/v1/events?start=${start.toISOString()}&end=${end.toISOString()}`,
      ),
  });
}

export function useUpcomingEvents(limit = 5) {
  return useQuery<CalendarEvent[]>({
    queryKey: ['events', 'upcoming', limit],
    queryFn: () => api.get<CalendarEvent[]>(`/v1/events/upcoming?limit=${limit}`),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CalendarEvent>) => api.post<CalendarEvent>('/v1/events', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      scope,
      instanceDate,
    }: {
      id: string;
      data: Partial<CalendarEvent>;
      scope?: 'this' | 'all';
      instanceDate?: string;
    }) => {
      const params = new URLSearchParams();
      if (scope) params.set('scope', scope);
      if (instanceDate) params.set('instance_date', instanceDate);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return api.put<CalendarEvent>(`/v1/events/${id}${qs}`, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      scope,
      instanceDate,
    }: {
      id: string;
      scope?: 'this' | 'all';
      instanceDate?: string;
    }) => {
      const params = new URLSearchParams();
      if (scope) params.set('scope', scope);
      if (instanceDate) params.set('instance_date', instanceDate);
      const qs = params.toString() ? `?${params.toString()}` : '';
      return api.delete<void>(`/v1/events/${id}${qs}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  });
}
