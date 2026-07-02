import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/Spinner';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Pages
import LoginPage from '@/pages/Login/LoginPage';
import RegisterPage from '@/pages/Register/RegisterPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import CreateTicketPage from '@/pages/CreateTicket/CreateTicketPage';
import TicketDetailsPage from '@/pages/TicketDetails/TicketDetailsPage';
import MyTicketsPage from '@/pages/MyTickets/MyTicketsPage';
import AnalyticsPage from '@/pages/Analytics/AnalyticsPage';
import AIChatPage from '@/pages/AIChat/AIChatPage';
import ReportsPage from '@/pages/Reports/ReportsPage';
import UsersPage from '@/pages/Users/UsersPage';
import SettingsPage from '@/pages/Settings/SettingsPage';
import ProfilePage from '@/pages/Profile/ProfilePage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && role && !roles.includes(role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tickets" element={<MyTicketsPage />} />
        <Route path="/tickets/create" element={<CreateTicketPage />} />
        <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        <Route path="/analytics" element={<ProtectedRoute roles={['Agent', 'Admin']}><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute roles={['Agent', 'Admin']}><AIChatPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['Admin']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={['Admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute roles={['Admin']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
