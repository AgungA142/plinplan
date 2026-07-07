import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function PairedRoute() {
  const { isAuthenticated, couple } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (couple?.pair_status !== 'active') return <Navigate to="/pair" replace />;
  return <Outlet />;
}
