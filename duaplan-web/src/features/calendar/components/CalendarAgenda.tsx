import { useState } from 'react';
import type { CalendarEvent } from '@/types';
import { isSameDay } from '../utils/calendarHelpers';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';
import EventFormModal from './EventFormModal';

interface CalendarAgendaProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function CalendarAgenda({ currentDate, onDateSelect }: CalendarAgendaProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  const end = new Date(currentDate);
  end.setDate(end.getDate() + 30);
  const { data: events = [] } = useEvents(currentDate, end);

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        Tidak ada event mendatang
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
    <>
      <div className="space-y-6 p-4 overflow-y-auto">
        {groups.map((group, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-2">
              <button
                className={`text-sm font-semibold ${isSameDay(group.date, today) ? 'text-primary' : 'text-foreground'}`}
                onClick={() => onDateSelect(group.date)}
              >
                {isSameDay(group.date, today) ? 'Hari Ini' : formatDateLong(group.date)}
              </button>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {group.events.map((ev) => (
                <EventCard
                  key={`${ev.id}-${ev.start_at}`}
                  event={ev}
                  onClick={() => {
                    setSelectedEvent(ev);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <EventFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        instanceDate={selectedEvent ? selectedEvent.start_at.split('T')[0] : undefined}
      />
    </>
  );
}
