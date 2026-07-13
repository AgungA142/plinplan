import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function PairHeader() {
  const { logout } = useAuthStore();
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
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <span className="text-xl font-bold tracking-tight">duaplan</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Keluar
        </Button>
      </header>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
