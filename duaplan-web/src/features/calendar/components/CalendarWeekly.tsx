// duaplan-web/src/features/calendar/components/CalendarWeekly.tsx
import { useState, useRef } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { CalendarEvent } from '@/types';
import {
  getWeekDays,
  getEventsForDay,
  isSameDay,
  formatTime,
  eventTopPx,
  eventHeightPx,
  HOUR_HEIGHT,
} from '../utils/calendarHelpers';
import { useEvents } from '../hooks/useEvents';
import EventFormModal from './EventFormModal';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

interface CalendarWeeklyProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function CalendarWeekly({ currentDate, onDateSelect }: CalendarWeeklyProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const today = new Date();
  const days = getWeekDays(currentDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekStart = days[0];
  const weekEnd = new Date(days[6]);
  weekEnd.setHours(23, 59, 59, 999);
  const { data: events = [] } = useEvents(weekStart, weekEnd);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const allDayEvents = events.filter((e) => e.all_day);
  const timedEvents = events.filter((e) => !e.all_day);

  function handleSlotClick(date: Date) {
    setSelectedEvent(undefined);
    setSelectedDate(date);
    setModalOpen(true);
    onDateSelect(date);
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event);
    setSelectedDate(undefined);
    setModalOpen(true);
  }

  const nowPx = (() => {
    const now = new Date();
    return (now.getHours() * 60 + now.getMinutes()) * (HOUR_HEIGHT / 60);
  })();

  const todayInWeek = days.some((d) => isSameDay(d, today));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header hari */}
      <div className="flex border-b border-border flex-shrink-0">
        <div className="w-14 flex-shrink-0" />
        {days.map((day, i) => (
          <div
            key={i}
            className="flex-1 text-center py-2 border-l border-border first:border-l-0 cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => onDateSelect(day)}
          >
            <div className="text-xs text-muted-foreground">{DAY_LABELS[i]}</div>
            <div
              className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                isSameDay(day, today)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground'
              }`}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-border flex-shrink-0">
          <div className="w-14 flex-shrink-0 flex items-center justify-end pr-2">
            <span className="text-xs text-muted-foreground">Seharian</span>
          </div>
          {days.map((day, i) => {
            const dayAllDay = allDayEvents.filter((e) =>
              isSameDay(new Date(e.start_at), day),
            );
            return (
              <div key={i} className="flex-1 min-h-8 border-l border-border p-1 space-y-0.5">
                {dayAllDay.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => handleEventClick(ev)}
                    className="w-full text-left text-xs px-1 py-0.5 rounded truncate text-white"
                    style={{
                      backgroundColor:
                        ev.color ?? (ev.created_by === userId ? '#6366f1' : '#8b5cf6'),
                    }}
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: `${HOUR_HEIGHT * 24}px` }}>
          {/* Gutter jam */}
          <div className="w-14 flex-shrink-0 relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-2 text-xs text-muted-foreground"
                style={{ top: `${h * HOUR_HEIGHT - 8}px` }}
              >
                {h.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Kolom per hari */}
          {days.map((day, di) => {
            const dayTimed = getEventsForDay(timedEvents, day);
            const isToday = isSameDay(day, today);
            return (
              <div
                key={di}
                className="flex-1 relative border-l border-border"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y =
                    e.clientY - rect.top + (scrollRef.current?.scrollTop ?? 0);
                  const hour = Math.floor(y / HOUR_HEIGHT);
                  const d = new Date(day);
                  d.setHours(hour, 0, 0, 0);
                  handleSlotClick(d);
                }}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/40"
                    style={{ top: `${h * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {todayInWeek && isToday && (
                  <div
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                    style={{ top: `${nowPx}px` }}
                  >
                    <div className="relative">
                      <div className="absolute left-0 w-2 h-2 rounded-full bg-red-500 -translate-y-1/2" />
                      <div className="h-px bg-red-500" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {dayTimed.map((ev) => (
                  <button
                    key={`${ev.id}-${ev.start_at}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(ev);
                    }}
                    className="absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-left overflow-hidden text-white text-xs"
                    style={{
                      top: `${eventTopPx(ev)}px`,
                      height: `${eventHeightPx(ev)}px`,
                      backgroundColor:
                        ev.color ?? (ev.created_by === userId ? '#6366f1' : '#8b5cf6'),
                    }}
                  >
                    <div className="font-medium truncate">{ev.title}</div>
                    <div className="opacity-80">{formatTime(new Date(ev.start_at))}</div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <EventFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        defaultDate={selectedDate}
        instanceDate={selectedEvent ? selectedEvent.start_at.split('T')[0] : undefined}
      />
    </div>
  );
}
