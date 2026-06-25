// ============================================================
// duaplan — Shared TypeScript Types
// ============================================================

// ── Database placeholder (generated from Supabase CLI later) ──
export type Database = Record<string, unknown>;

// ── Auth ──────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  couple_id: string | null;
  fcm_token: string | null;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Couple {
  id: string;
  user_a_id: string;
  user_b_id: string | null;
  pair_code: string;
  pair_status: 'pending' | 'active' | 'dissolved';
  paired_at: string | null;
  created_at: string;
}

// ── Events ────────────────────────────────────────────────────
export type EventCategory = 'date' | 'routine' | 'financial' | 'family' | 'health' | 'other';
export type EventVisibility = 'both' | 'private';

export interface CalendarEvent {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  category: EventCategory | null;
  visibility: EventVisibility;
  color: string | null;
  is_recurring: boolean;
  recur_rule: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ── Routine ───────────────────────────────────────────────────
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Routine {
  id: string;
  couple_id: string;
  user_id: string | null;
  title: string;
  icon: string | null;
  category: string | null;
  time_of_day: TimeOfDay | null;
  reminder_time: string | null;
  is_shared: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RoutineLog {
  id: string;
  routine_id: string;
  user_id: string;
  log_date: string;
  completed_at: string | null;
  notes: string | null;
}

// ── Expenses ──────────────────────────────────────────────────
export type ExpenseCategory =
  | 'makan' | 'transportasi' | 'tagihan' | 'belanja' | 'hiburan'
  | 'kesehatan' | 'pendidikan' | 'liburan' | 'fashion' | 'kencan'
  | 'lainnya' | 'kustom';

export type SplitType = 'shared' | 'user_a' | 'user_b';

export interface Expense {
  id: string;
  couple_id: string;
  paid_by: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  note: string | null;
  split_type: SplitType;
  receipt_url: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseBudget {
  id: string;
  couple_id: string;
  category: ExpenseCategory;
  amount: number;
  month: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory_ {
  id: string;
  couple_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_by: string;
  created_at: string;
}

// ── Incomes ───────────────────────────────────────────────────
export type IncomeType = 'recurring' | 'one_time';
export type IncomeFrequency = 'monthly' | 'biweekly' | 'weekly';

export interface Income {
  id: string;
  couple_id: string;
  received_by: string | null;
  amount: number;
  category: string;
  source: string | null;
  note: string | null;
  income_type: IncomeType;
  income_date: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringIncome {
  id: string;
  couple_id: string;
  received_by: string | null;
  amount: number;
  category: string;
  source: string;
  frequency: IncomeFrequency;
  day_of_month: number | null;
  is_active: boolean;
  auto_allocate: boolean;
  allocations: Array<{ goal_id: string; pct: number }> | null;
  created_at: string;
  updated_at: string;
}

// ── Savings ───────────────────────────────────────────────────
export type SavingsType = 'savings' | 'investment';
export type SavingsStatus = 'active' | 'achieved' | 'paused';

export interface SavingsGoal {
  id: string;
  couple_id: string;
  owner_id: string | null;
  title: string;
  emoji: string | null;
  type: SavingsType;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  interest_rate: number | null;
  initial_amount: number;
  frequency: IncomeFrequency;
  status: SavingsStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  notes: string | null;
  contributed_at: string;
}

// ── Issues ────────────────────────────────────────────────────
export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface Issue {
  id: string;
  couple_id: string;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  category: string | null;
  status: IssueStatus;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

// ── API Response helpers ──────────────────────────────────────
export interface ApiError {
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
