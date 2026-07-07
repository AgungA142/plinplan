// duaplan-web/src/features/calendar/components/CalendarMonthly.tsx
import { useAuthStore } from '@/features/auth/store/authStore';
import type { CalendarEvent } from '@/types';
import { getMonthGrid, getEventsForDay, isSameDay } from '../utils/calendarHelpers';

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

interface Props {
  year: number;
  month: number;
  events: CalendarEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarMonthly({ year, month, events, selectedDate, onDateSelect, onEventClick }: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const grid = getMonthGrid(year, month);
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
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const dayEvents = getEventsForDay(events, day);
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - 3;

          return (
            <div
              key={i}
              onClick={() => onDateSelect(day)}
              className={`border-b border-r border-border p-1 cursor-pointer transition-colors hover:bg-muted/40 ${
                !isCurrentMonth ? 'opacity-40' : ''
              }`}
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${
                isToday ? 'bg-primary text-primary-foreground' :
                isSelected ? 'bg-muted text-foreground' : 'text-foreground'
              }`}>
                {day.getDate()}
              </div>

              <div className="space-y-0.5">
                {visible.map((ev) => (
                  <button
                    key={`${ev.id}-${ev.start_at}`}
                    onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                    className="w-full text-left text-xs px-1 py-0.5 rounded truncate"
                    style={{ backgroundColor: ev.color ?? (ev.created_by === userId ? '#6366f1' : '#8b5cf6'), color: '#fff' }}
                  >
                    {ev.all_day ? '' : `${new Date(ev.start_at).getHours().toString().padStart(2,'0')}:${new Date(ev.start_at).getMinutes().toString().padStart(2,'0')} `}
                    {ev.title}
                  </button>
                ))}
                {overflow > 0 && (
                  <div className="text-xs text-muted-foreground px-1">+{overflow} lagi</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
