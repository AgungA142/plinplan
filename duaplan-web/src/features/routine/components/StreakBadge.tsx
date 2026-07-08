interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
      <span>🔥</span>
      <span className="text-sm font-semibold">{streak} hari berturut-turut</span>
    </div>
  );
}
