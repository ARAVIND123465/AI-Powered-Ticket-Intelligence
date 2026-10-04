import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/Public/HomePage';
import { useAuth, normalizeRole, roleHome } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/Spinner';

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import PublicLayout from '@/layouts/PublicLayout';

// Public Pages
import PublicAssistantPage from '@/pages/Public/PublicAssistantPage';
import PublicCreateTicketPage from '@/pages/Public/PublicCreateTicketPage';
import TrackTicketPage from '@/pages/Public/TrackTicketPage';
import AboutPage from '@/pages/Public/AboutPage';
import ContactPage from '@/pages/Public/ContactPage';

// Auth & Admin Pages
import LoginPage from '@/pages/Login/LoginPage';
import RegisterPage from '@/pages/Register/RegisterPage';
import AdminLoginPage from '@/pages/AdminLogin/AdminLoginPage';
import CompanyRegisterPage from '@/pages/CompanyRegister/CompanyRegisterPage';

// Protected Workspace Pages
import CustomerDashboardPage from '@/pages/CustomerDashboard/CustomerDashboardPage';
import AgentDashboardPage from '@/pages/AgentDashboard/AgentDashboardPage';
import NotificationsPage from '@/pages/Notifications/NotificationsPage';
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
import SuperAdminPage from '@/pages/SuperAdmin/SuperAdminPage';
import CompanyAdminPage from '@/pages/CompanyAdmin/CompanyAdminPage';

// Re-export roleHome for backwards compatibility
export { roleHome };

/** Guard: redirects unauthenticated users to login */
function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && role) {
    const canonicalUserRole = normalizeRole(role);
    const canonicalAllowed = roles.map((r) => normalizeRole(r));
    const isAuthorized = canonicalAllowed.includes(canonicalUserRole);

    if (!isAuthorized) {
      console.warn(`Access denied. Role '${role}' (canonical: '${canonicalUserRole}') is not authorized. Allowed: ${canonicalAllowed.join(', ')}. Redirecting to home.`);
      return <Navigate to={roleHome(canonicalUserRole)} replace />;
    }
  }

  return <>{children}</>;
}

/** Guard: redirects already-authenticated users to their home */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={roleHome(role)} replace />;

  return <>{children}</>;
}

/** Root redirect — sends to role-specific home when hitting "/" while logged in.
 *  When NOT authenticated, renders the public HomePage directly to avoid
 *  an infinite redirect loop (Navigate to="/" would re-render this component). */
function RootRedirect() {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={roleHome(role)} replace />;
  return <HomePage />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================================================================ */}
      {/* PUBLIC WEBSITE ROUTES (NO LOGIN REQUIRED)                        */}
      {/* ================================================================ */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/public-assistant" element={<PublicAssistantPage />} />
        <Route path="/public-create-ticket" element={<PublicCreateTicketPage />} />
        <Route path="/track-ticket" element={<TrackTicketPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* ================================================================ */}
      {/* AUTHENTICATION ROUTES (redirects away if already logged in)      */}
      {/* ================================================================ */}
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/register-company" element={<CompanyRegisterPage />} />
      </Route>

      {/* ================================================================ */}
      {/* PROTECTED WORKSPACE — All authenticated roles share this layout  */}
      {/* ================================================================ */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

        {/* ─── 🌐 CUSTOMER PORTAL ──────────────────────────────────────── */}
        <Route
          path="/customer/dashboard"
          element={<ProtectedRoute roles={['Customer']}><CustomerDashboardPage /></ProtectedRoute>}
        />
        <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />

        {/* ─── 👨‍💻 SUPPORT AGENT PANEL ─────────────────────────────────── */}
        <Route
          path="/agent/dashboard"
          element={<ProtectedRoute roles={['Agent']}><AgentDashboardPage /></ProtectedRoute>}
        />
        <Route path="/agent" element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="/support" element={<Navigate to="/agent/dashboard" replace />} />

        {/* Agent filtered ticket views — all routed to the agent dashboard with filter context */}
        <Route
          path="/agent/assigned"
          element={<ProtectedRoute roles={['Agent']}><AgentDashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/agent/open"
          element={<ProtectedRoute roles={['Agent']}><AgentDashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/agent/in-progress"
          element={<ProtectedRoute roles={['Agent']}><AgentDashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/agent/resolved"
          element={<ProtectedRoute roles={['Agent']}><AgentDashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/agent/messages"
          element={<ProtectedRoute roles={['Agent']}><AgentDashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/agent/performance"
          element={<ProtectedRoute roles={['Agent']}><AgentDashboardPage /></ProtectedRoute>}
        />

        {/* ─── 🏢 COMPANY ADMIN DASHBOARD ──────────────────────────────── */}
        <Route
          path="/company-admin/dashboard"
          element={<ProtectedRoute roles={['Admin']}><CompanyAdminPage /></ProtectedRoute>}
        />
        <Route path="/company-admin" element={<Navigate to="/company-admin/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/company-admin/dashboard" replace />} />

        {/* ─── 🛡️ PLATFORM SUPER ADMIN ─────────────────────────────────── */}
        <Route
          path="/platform/dashboard"
          element={<ProtectedRoute roles={['SuperAdmin']}><SuperAdminPage /></ProtectedRoute>}
        />
        <Route path="/super-admin" element={<Navigate to="/platform/dashboard" replace />} />
        <Route path="/superadmin" element={<Navigate to="/platform/dashboard" replace />} />

        {/* ─── SHARED PAGES (accessible to all authenticated roles) ───── */}
        {/* Tickets: Customer sees their own, Agent/Admin/SuperAdmin see all — gated by the page component */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute roles={['Customer', 'Agent', 'Admin', 'SuperAdmin', 'SUPPORT_AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/create"
          element={
            <ProtectedRoute roles={['Customer', 'Agent', 'Admin', 'SuperAdmin', 'SUPPORT_AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <CreateTicketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute roles={['Customer', 'Agent', 'Admin', 'SuperAdmin', 'SUPPORT_AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <TicketDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute roles={['Customer', 'Agent', 'Admin', 'SuperAdmin', 'SUPPORT_AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={['Customer', 'Agent', 'Admin', 'SuperAdmin', 'SUPPORT_AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-ticket"
          element={
            <ProtectedRoute roles={['Customer', 'Agent', 'Admin', 'SuperAdmin', 'SUPPORT_AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <TrackTicketPage />
            </ProtectedRoute>
          }
        />

        {/* ─── AI Chat (all authenticated roles) ──────────────────────── */}
        <Route
          path="/ai-chat"
          element={
            <ProtectedRoute roles={['Customer', 'Agent', 'Admin', 'SuperAdmin', 'SUPPORT_AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <AIChatPage />
            </ProtectedRoute>
          }
        />

        {/* ─── ANALYTICS (Agent + Admin + SuperAdmin only) ─────────────── */}
        <Route
          path="/analytics"
          element={<ProtectedRoute roles={['Agent', 'Admin', 'SuperAdmin', 'SUPPORT_AGENT', 'COMPANY_ADMIN', 'SUPER_ADMIN']}><AnalyticsPage /></ProtectedRoute>}
        />

        {/* ─── ADMIN & SUPERADMIN ONLY ──────────────────────────────────── */}
        <Route
          path="/reports"
          element={<ProtectedRoute roles={['Admin', 'SuperAdmin', 'COMPANY_ADMIN', 'SUPER_ADMIN']}><ReportsPage /></ProtectedRoute>}
        />
        <Route
          path="/users"
          element={<ProtectedRoute roles={['Admin', 'SuperAdmin', 'COMPANY_ADMIN', 'SUPER_ADMIN']}><UsersPage /></ProtectedRoute>}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute roles={['Admin', 'SuperAdmin', 'COMPANY_ADMIN', 'SUPER_ADMIN']}><SettingsPage /></ProtectedRoute>}
        />
      </Route>

      {/* Catch-all — redirect to public home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
