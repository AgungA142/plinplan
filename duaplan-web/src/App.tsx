import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import CalendarPage from '@/pages/CalendarPage';
import RoutinePage from '@/pages/RoutinePage';
import FinancePage from '@/pages/FinancePage';
import ExpensesPage from '@/pages/ExpensesPage';
import SavingsPage from '@/pages/SavingsPage';
import IssuesPage from '@/pages/IssuesPage';
import MonitoringPage from '@/pages/MonitoringPage';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/routine" element={<RoutinePage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/monitoring" element={<MonitoringPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
