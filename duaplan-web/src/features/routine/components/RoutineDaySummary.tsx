interface RoutineDaySummaryProps {
  completed: number;
  total: number;
}

export default function RoutineDaySummary({ completed, total }: RoutineDaySummaryProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completed}/{total} selesai
        </span>
        <span className="font-medium text-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
