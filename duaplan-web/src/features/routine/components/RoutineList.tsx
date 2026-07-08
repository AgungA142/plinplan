import type { RoutineTodayItem } from '../types';
import RoutineItem from './RoutineItem';

const TIME_LABELS: Record<string, string> = {
  morning:   'Pagi ☀️',
  afternoon: 'Siang 🌤️',
  evening:   'Malam 🌙',
  anytime:   'Kapan saja',
};

const TIME_ORDER = ['morning', 'afternoon', 'evening', 'anytime'];

interface RoutineListProps {
  items: RoutineTodayItem[];
  pendingId: string | null;
  onToggle: (item: RoutineTodayItem) => void;
}

export default function RoutineList({ items, pendingId, onToggle }: RoutineListProps) {
  const grouped = TIME_ORDER.reduce<Record<string, RoutineTodayItem[]>>((acc, key) => {
    acc[key] = items.filter((r) => (r.time_of_day ?? 'anytime') === key);
    return acc;
  }, {} as Record<string, RoutineTodayItem[]>);

  return (
    <div className="space-y-5">
      {TIME_ORDER.map((tod) => {
        const group = grouped[tod];
        if (!group || group.length === 0) return null;
        return (
          <div key={tod}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {TIME_LABELS[tod]}
            </h3>
            <div className="space-y-2">
              {group.map((item) => (
                <RoutineItem
                  key={item.id}
                  item={item}
                  onToggle={() => onToggle(item)}
                  isPending={pendingId === item.id}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
