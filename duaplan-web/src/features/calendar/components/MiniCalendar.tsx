import type { CalendarEvent } from '@/types';
import { getMonthGrid, isSameDay } from '../utils/calendarHelpers';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_LABELS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

interface Props {
  year: number;
  month: number;
  selectedDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (year: number, month: number) => void;
}

export default function MiniCalendar({ year, month, selectedDate, events, onDateSelect, onMonthChange }: Props) {
  const grid = getMonthGrid(year, month);
  const today = new Date();

  function prev() {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  }

  function next() {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  }

  const monthLabel = new Date(year, month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="p-3 select-none">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prev} className="p-1 hover:bg-muted rounded"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-xs font-semibold text-foreground">{monthLabel}</span>
        <button onClick={next} className="p-1 hover:bg-muted rounded"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground py-0.5">{d}</div>
        ))}
        {grid.map((day, i) => {
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const hasEvents = events.some((e) => isSameDay(new Date(e.start_at), day));
          return (
            <button
              key={i}
              onClick={() => onDateSelect(day)}
              className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isToday ? 'bg-primary text-primary-foreground' : ''}
                ${isSelected && !isToday ? 'bg-muted text-foreground' : ''}
                ${!isToday && !isSelected ? 'hover:bg-muted/50 text-foreground' : ''}
              `}
            >
              {day.getDate()}
              {hasEvents && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
