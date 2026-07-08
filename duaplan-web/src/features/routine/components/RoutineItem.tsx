import { Check } from 'lucide-react';
import type { RoutineTodayItem } from '../types';

interface RoutineItemProps {
  item: RoutineTodayItem;
  onToggle: () => void;
  isPending?: boolean;
}

export default function RoutineItem({ item, onToggle, isPending }: RoutineItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        item.completed
          ? 'bg-muted/40 border-muted'
          : 'bg-card border-border hover:border-primary/40'
      }`}
    >
      <button
        onClick={onToggle}
        disabled={isPending}
        aria-label={item.completed ? 'Batal selesai' : 'Tandai selesai'}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          item.completed
            ? 'bg-primary border-primary text-primary-foreground scale-110'
            : 'border-border hover:border-primary'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {item.completed && <Check className="w-3 h-3" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium transition-all ${
            item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
          }`}
        >
          {item.icon && <span className="mr-1.5">{item.icon}</span>}
          {item.title}
        </span>
      </div>

      {item.owner && (
        <div
          title={item.owner.display_name}
          className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-semibold flex-shrink-0"
        >
          {item.owner.display_name[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}
