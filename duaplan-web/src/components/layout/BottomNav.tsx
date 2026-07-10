import { NavLink } from 'react-router-dom';
import { Calendar, CheckSquare, Wallet, PiggyBank, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/calendar', icon: Calendar, label: 'Kalender' },
  { to: '/routine', icon: CheckSquare, label: 'Rutinitas' },
  { to: '/finance', icon: Wallet, label: 'Keuangan' },
  { to: '/savings', icon: PiggyBank, label: 'Tabungan' },
  { to: '/issues', icon: AlertTriangle, label: 'Masalah' },
] as const;

export default function BottomNav() {
  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
