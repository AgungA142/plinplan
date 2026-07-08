// duaplan-web/src/features/calendar/components/CalendarMonthly.tsx
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { CalendarEvent } from '@/types';
import { getMonthGrid, getEventsForDay, isSameDay } from '../utils/calendarHelpers';
import { useEvents } from '../hooks/useEvents';
import EventFormModal from './EventFormModal';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

interface CalendarMonthlyProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function CalendarMonthly({ currentDate, onDateSelect }: CalendarMonthlyProps) {
  const userId = useAuthStore((s) => s.user?.id);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
  const { data: events = [] } = useEvents(startOfMonth, endOfMonth);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const grid = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
  const today = new Date();

  return (
    <div className="flex flex-col h-full">
      {/* Header hari */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Grid hari */}
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
        {grid.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, today);
          const dayEvents = getEventsForDay(events, day);
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - 3;

          return (
            <div
              key={i}
              onClick={() => { setSelectedDate(day); setSelectedEvent(undefined); setModalOpen(true); onDateSelect(day); }}
              className={`border-b border-r border-border p-1 cursor-pointer transition-colors hover:bg-muted/40 ${
                !isCurrentMonth ? 'opacity-40' : ''
              }`}
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${
                isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
              }`}>
                {day.getDate()}
              </div>

              <div className="space-y-0.5">
                {visible.map((ev) => (
                  <button
                    key={`${ev.id}-${ev.start_at}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); setSelectedDate(undefined); setModalOpen(true); }}
                    className="w-full text-left text-xs px-1 py-0.5 rounded truncate"
                    style={{ backgroundColor: ev.color ?? (ev.created_by === userId ? '#6366f1' : '#8b5cf6'), color: '#fff' }}
                  >
                    {ev.all_day ? '' : `${new Date(ev.start_at).getHours().toString().padStart(2,'0')}:${new Date(ev.start_at).getMinutes().toString().padStart(2,'0')} `}
                    {ev.title}
                  </button>
                ))}
                {overflow > 0 && (
                  <div className="text-xs text-muted-foreground px-1">+{overflow} lainnya</div>
                )}
              </div>
            </div>
          );
        })}
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
