export interface RoutineOwner {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export interface RoutineTodayItem {
  id: string;
  title: string;
  icon: string | null;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'anytime';
  is_shared: boolean | null;
  sort_order: number | null;
  owner: RoutineOwner | null;
  completed: boolean;
  completed_at: string | null;
}

export interface TodayResponse {
  date: string;
  routines: RoutineTodayItem[];
  summary: { total: number; completed: number; all_done: boolean };
}

export interface Routine {
  id: string;
  title: string;
  icon: string | null;
  category: string | null;
  time_of_day: string | null;
  is_shared: boolean | null;
  sort_order: number | null;
  users: RoutineOwner | null;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
}

export interface StreaksResponse {
  user: StreakData;
  partner: StreakData;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
