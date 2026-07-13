import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/features/calendar/hooks/useEvents';
import { getWeekDays, formatMonthYear } from '@/features/calendar/utils/calendarHelpers';
import CalendarMonthly from '@/features/calendar/components/CalendarMonthly';
import CalendarWeekly from '@/features/calendar/components/CalendarWeekly';
import CalendarAgenda from '@/features/calendar/components/CalendarAgenda';
import MiniCalendar from '@/features/calendar/components/MiniCalendar';
import EventFormModal from '@/features/calendar/components/EventFormModal';

type View = 'monthly' | 'weekly' | 'agenda';

export default function CalendarPage() {
  const [view, setView] = useState<View>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [miniYear, setMiniYear] = useState(() => new Date().getFullYear());
  const [miniMonth, setMiniMonth] = useState(() => new Date().getMonth());
  const [formOpen, setFormOpen] = useState(false);
  const [formDefaultDate, setFormDefaultDate] = useState<Date>();

  // Events for the mini calendar's visible month
  const miniStart = new Date(miniYear, miniMonth, 1);
  const miniEnd = new Date(miniYear, miniMonth + 1, 0, 23, 59, 59);
  const { data: miniEvents = [] } = useEvents(miniStart, miniEnd);

  function navigate(direction: 1 | -1) {
    const d = new Date(currentDate);
    if (view === 'monthly') d.setMonth(d.getMonth() + direction);
    else if (view === 'weekly') d.setDate(d.getDate() + 7 * direction);
    else d.setMonth(d.getMonth() + 3 * direction);
    setCurrentDate(d);
    setMiniYear(d.getFullYear());
    setMiniMonth(d.getMonth());
  }

  function handleDateSelect(date: Date) {
    setCurrentDate(date);
    setMiniYear(date.getFullYear());
    setMiniMonth(date.getMonth());
  }

  function goToToday() {
    const today = new Date();
    setCurrentDate(today);
    setMiniYear(today.getFullYear());
    setMiniMonth(today.getMonth());
  }

  const viewLabel: Record<View, string> = { monthly: 'Bulan', weekly: 'Minggu', agenda: 'Agenda' };

  const headerLabel =
    view === 'weekly'
      ? (() => {
          const days = getWeekDays(currentDate);
          return `${days[0].getDate()} – ${days[6].getDate()} ${formatMonthYear(days[0])}`;
        })()
      : formatMonthYear(
          view === 'monthly'
            ? new Date(currentDate.getFullYear(), currentDate.getMonth())
            : currentDate,
        );

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-shrink-0 border-r border-border flex-col">
        <div className="p-3 border-b border-border">
          <Button
            className="w-full gap-2"
            size="sm"
            onClick={() => {
              setFormDefaultDate(new Date());
              setFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Event baru
          </Button>
        </div>
        <MiniCalendar
          year={miniYear}
          month={miniMonth}
          selectedDate={currentDate}
          events={miniEvents}
          onDateSelect={handleDateSelect}
          onMonthChange={(y, m) => {
            setMiniYear(y);
            setMiniMonth(m);
          }}
        />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-muted rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 hover:bg-muted rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="font-semibold text-foreground text-lg">{headerLabel}</h2>
          <button
            onClick={goToToday}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-0.5"
          >
            Hari ini
          </button>
          <div className="ml-auto flex gap-1 bg-muted rounded-lg p-1">
            {(['monthly', 'weekly', 'agenda'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  view === v
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {viewLabel[v]}
              </button>
            ))}
          </div>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-hidden pb-16 md:pb-0">
          {view === 'monthly' && (
            <CalendarMonthly currentDate={currentDate} onDateSelect={handleDateSelect} />
          )}
          {view === 'weekly' && (
            <CalendarWeekly currentDate={currentDate} onDateSelect={handleDateSelect} />
          )}
          {view === 'agenda' && (
            <CalendarAgenda currentDate={currentDate} onDateSelect={handleDateSelect} />
          )}
        </div>
      </main>

      {/* Form Modal for "Event baru" button */}
      <EventFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultDate={formDefaultDate}
      />
    </div>
  );
}
