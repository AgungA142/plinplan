import type { CalendarEvent } from '@/types';
import { isSameDay, formatDateShort } from '../utils/calendarHelpers';
import EventCard from './EventCard';

interface Props {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function CalendarAgenda({ events, onEventClick }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        Tidak ada event dalam periode ini
      </div>
    );
  }

  // Kelompokkan per hari
  const groups: { date: Date; events: CalendarEvent[] }[] = [];
  for (const ev of events) {
    const evDate = new Date(ev.start_at);
    const existing = groups.find((g) => isSameDay(g.date, evDate));
    if (existing) existing.events.push(ev);
    else groups.push({ date: evDate, events: [ev] });
  }
  groups.sort((a, b) => a.date.getTime() - b.date.getTime());

  const today = new Date();

  return (
    <div className="space-y-6 p-4 overflow-y-auto">
      {groups.map((group, i) => (
        <div key={i}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`text-sm font-semibold ${isSameDay(group.date, today) ? 'text-primary' : 'text-foreground'}`}>
              {isSameDay(group.date, today) ? 'Hari Ini' : formatDateShort(group.date)}
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2">
            {group.events.map((ev) => (
              <EventCard key={`${ev.id}-${ev.start_at}`} event={ev} onClick={() => onEventClick(ev)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
