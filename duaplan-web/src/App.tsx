import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import CalendarPage from '@/pages/CalendarPage';
import RoutinePage from '@/pages/RoutinePage';
import FinancePage from '@/pages/FinancePage';
import ExpensesPage from '@/pages/ExpensesPage';
import SavingsPage from '@/pages/SavingsPage';
import IssuesPage from '@/pages/IssuesPage';
import MonitoringPage from '@/pages/MonitoringPage';
import LoginPage from '@/pages/LoginPage';

function App() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/calendar" replace />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/routine" element={<RoutinePage />} />
      <Route path="/finance" element={<FinancePage />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/savings" element={<SavingsPage />} />
      <Route path="/issues" element={<IssuesPage />} />
      <Route path="/monitoring" element={<MonitoringPage />} />
    </Routes>
  );
}

export default App;
