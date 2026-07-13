import { NavLink, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Wallet,
  PiggyBank,
  AlertTriangle,
  BarChart2,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';

const NAV_ITEMS = [
  { to: '/calendar', icon: Calendar, label: 'Kalender' },
  { to: '/routine', icon: CheckSquare, label: 'Rutinitas' },
  { to: '/finance', icon: Wallet, label: 'Keuangan' },
  { to: '/savings', icon: PiggyBank, label: 'Tabungan' },
  { to: '/issues', icon: AlertTriangle, label: 'Masalah' },
  { to: '/monitoring', icon: BarChart2, label: 'Monitoring' },
] as const;

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // store clears local state regardless; proceed with redirect
    }
    navigate('/', { replace: true });
  }

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-background flex-shrink-0 h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border flex-shrink-0">
        <span className="text-lg font-bold tracking-tight">duaplan</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-border px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <p className="flex-1 min-w-0 text-sm font-medium text-foreground truncate">
          {user?.display_name ?? '—'}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Keluar"
          aria-label="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
