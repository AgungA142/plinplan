import { useAuthStore } from '@/features/auth/store/authStore';
import type { CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';
import { formatTime } from '../utils/calendarHelpers';

interface Props {
  event: CalendarEvent;
  onClick?: () => void;
  className?: string;
}

export default function EventCard({ event, onClick, className }: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const isOwn = event.created_by === userId;
  const bgColor = event.color ?? (isOwn ? '#6366f1' : '#8b5cf6');

  return (
    <button
      onClick={onClick}
      className={cn('w-full text-left flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors', className)}
    >
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: bgColor }} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {event.all_day
            ? 'Seharian'
            : `${formatTime(new Date(event.start_at))}${event.end_at ? ` – ${formatTime(new Date(event.end_at))}` : ''}`}
        </p>
        {event.description && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{event.description}</p>
        )}
      </div>
      {!isOwn && event.creator && (
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
          {event.creator.display_name.charAt(0).toUpperCase()}
        </div>
      )}
    </button>
  );
}
