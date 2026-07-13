import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';
import PairedRoute from '@/routes/PairedRoute';
import PairHeader from '@/components/layout/PairHeader';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import PairPage from '@/pages/PairPage';
import CalendarPage from '@/pages/CalendarPage';
import RoutinePage from '@/pages/RoutinePage';
import FinancePage from '@/pages/FinancePage';
import ExpensesPage from '@/pages/ExpensesPage';
import SavingsPage from '@/pages/SavingsPage';
import IssuesPage from '@/pages/IssuesPage';
import MonitoringPage from '@/pages/MonitoringPage';
import AppShell from '@/components/layout/AppShell';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Auth required, pairing belum selesai */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PairHeader />}>
          <Route path="/pair" element={<PairPage />} />
        </Route>
      </Route>

      {/* Auth + paired required */}
      <Route element={<PairedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/routine" element={<RoutinePage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/monitoring" element={<MonitoringPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
