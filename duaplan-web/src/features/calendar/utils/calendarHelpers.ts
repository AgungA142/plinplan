import type { CalendarEvent } from '@/types';

export const HOUR_HEIGHT = 60; // px per jam di time grid

export function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start

  const days: Date[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - i - 1);
    days.push(d);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  while (days.length < 42) {
    const d = new Date(days[days.length - 1]);
    d.setDate(d.getDate() + 1);
    days.push(d);
  }
  return days;
}

export function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((e) => isSameDay(new Date(e.start_at), day));
}

export function eventTopPx(event: CalendarEvent): number {
  const d = new Date(event.start_at);
  return (d.getHours() * 60 + d.getMinutes()) * (HOUR_HEIGHT / 60);
}

export function eventHeightPx(event: CalendarEvent): number {
  if (!event.end_at) return HOUR_HEIGHT; // default 1 jam
  const start = new Date(event.start_at).getTime();
  const end = new Date(event.end_at).getTime();
  const minutes = (end - start) / 60000;
  return Math.max(minutes * (HOUR_HEIGHT / 60), 24); // min 24px
}
