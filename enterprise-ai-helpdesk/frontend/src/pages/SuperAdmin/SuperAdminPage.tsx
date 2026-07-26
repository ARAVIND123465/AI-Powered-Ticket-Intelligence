import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building, ShieldCheck, CreditCard, Users, Shield,
  BarChart3, DollarSign, Brain, FileText, Server, Megaphone, Settings,
  Bell, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

// Tabs
import SADashboardTab from './tabs/SADashboardTab';
import SAApprovalsTab from './tabs/SAApprovalsTab';
import SARegisteredCompaniesTab from './tabs/SARegisteredCompaniesTab';
import SASubscriptionsTab from './tabs/SASubscriptionsTab';
import SAPlatformUsersTab from './tabs/SAPlatformUsersTab';
import SARolesPermissionsTab from './tabs/SARolesPermissionsTab';
import SAPlatformAnalyticsTab from './tabs/SAPlatformAnalyticsTab';
import SARevenueTab from './tabs/SARevenueTab';
import SAAIConfigTab from './tabs/SAAIConfigTab';
import SAAuditLogsTab from './tabs/SAAuditLogsTab';
import SASystemHealthTab from './tabs/SASystemHealthTab';
import SAAnnouncementsTab from './tabs/SAAnnouncementsTab';
import SASystemSettingsTab from './tabs/SASystemSettingsTab';
import SANotificationsTab from './tabs/SANotificationsTab';
import SAProfileTab from './tabs/SAProfileTab';

// Mock Stores & Initial datasets
import {
  INITIAL_COMPANIES, INITIAL_USERS, INITIAL_PAYMENTS, INITIAL_AUDIT_LOGS,
  INITIAL_ANNOUNCEMENTS, INITIAL_NOTIFICATIONS,
  type SACompany, type SAPlatformUser, type SAAuditLog, type SAPayment,
  type SAAnnouncement, type SANotification
} from './superAdminData';

type TabId =
  | 'dashboard'
  | 'approvals'
  | 'companies'
  | 'subscriptions'
  | 'users'
  | 'roles'
  | 'analytics'
  | 'revenue'
  | 'ai'
  | 'audit'
  | 'health'
  | 'announcements'
  | 'settings'
  | 'notifications'
  | 'profile';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  section: string;
}

const NAV_ITEMS: NavItem[] = [
  // Operations
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Operations' },
  { id: 'approvals', label: 'Company Approvals', icon: ShieldCheck, section: 'Operations' },
  { id: 'companies', label: 'Registered Companies', icon: Building, section: 'Operations' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, section: 'Operations' },
  // Management
  { id: 'users', label: 'Platform Users', icon: Users, section: 'Management' },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield, section: 'Management' },
  // Insights
  { id: 'analytics', label: 'Platform Analytics', icon: BarChart3, section: 'Insights' },
  { id: 'revenue', label: 'Revenue Dashboard', icon: DollarSign, section: 'Insights' },
  // System Governance
  { id: 'ai', label: 'AI Configuration', icon: Brain, section: 'System' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, section: 'System' },
  { id: 'health', label: 'System Health', icon: Server, section: 'System' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, section: 'System' },
  { id: 'settings', label: 'System Settings', icon: Settings, section: 'System' },
  { id: 'notifications', label: 'Notifications', icon: Bell, section: 'System' },
  { id: 'profile', label: 'Profile', icon: Users, section: 'System' },
];

const SECTIONS = ['Operations', 'Management', 'Insights', 'System'];

export default function SuperAdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sideCollapsed, setSideCollapsed] = useState(false);

  // Core managed state
  const [companies, setCompanies] = useState<SACompany[]>(INITIAL_COMPANIES);
  const [users, setUsers] = useState<SAPlatformUser[]>(INITIAL_USERS);
  const [payments, setPayments] = useState<SAPayment[]>(INITIAL_PAYMENTS);
  const [auditLogs, setAuditLogs] = useState<SAAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [announcements, setAnnouncements] = useState<SAAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<SANotification[]>(INITIAL_NOTIFICATIONS);

  const pendingApprovalsCount = companies.filter(c => c.status === 'Pending').length;
  const unreadAlertsCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SADashboardTab companies={companies} users={users} notifications={notifications} onSelectTab={(tabId) => setActiveTab(tabId as TabId)} />;
      case 'approvals':
        return <SAApprovalsTab companies={companies} onUpdateCompanies={setCompanies} />;
      case 'companies':
        return <SARegisteredCompaniesTab companies={companies} onUpdateCompanies={setCompanies} />;
      case 'subscriptions':
        return <SASubscriptionsTab companies={companies} onUpdateCompanies={setCompanies} />;
      case 'users':
        return <SAPlatformUsersTab users={users} />;
      case 'roles':
        return <SARolesPermissionsTab />;
      case 'analytics':
        return <SAPlatformAnalyticsTab />;
      case 'revenue':
        return <SARevenueTab payments={payments} />;
      case 'ai':
        return <SAAIConfigTab />;
      case 'audit':
        return <SAAuditLogsTab logs={auditLogs} />;
      case 'health':
        return <SASystemHealthTab />;
      case 'announcements':
        return <SAAnnouncementsTab announcements={announcements} onUpdateAnnouncements={setAnnouncements} />;
      case 'settings':
        return <SASystemSettingsTab />;
      case 'notifications':
        return <SANotificationsTab notifications={notifications} onUpdateNotifications={setNotifications} />;
      case 'profile':
        return <SAProfileTab />;
      default:
        return <SADashboardTab companies={companies} users={users} notifications={notifications} onSelectTab={(tabId) => setActiveTab(tabId as TabId)} />;
    }
  };

  const currentItem = NAV_ITEMS.find(n => n.id === activeTab);

  return (
    <div className="flex gap-0 -m-4 lg:-m-6 min-h-[calc(100vh-4rem)]">
      {/* Sidebar navigation */}
      <motion.div
        animate={{ width: sideCollapsed ? 56 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-shrink-0 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className={cn('flex items-center h-14 px-4 border-b border-[var(--border-primary)] shrink-0', sideCollapsed && 'justify-center px-2')}>
          {!sideCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-[var(--text-primary)] truncate">Governance Center</h2>
                <p className="text-[9px] text-primary-400 font-semibold uppercase tracking-wider">Super Admin</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
          {SECTIONS.map(section => {
            const items = NAV_ITEMS.filter(n => n.section === section);
            return (
              <div key={section} className="mb-3">
                {!sideCollapsed && (
                  <p className="px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                    {section}
                  </p>
                )}
                {items.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  const hasBadge = (item.id === 'approvals' && pendingApprovalsCount > 0) || (item.id === 'notifications' && unreadAlertsCount > 0);
                  const badgeVal = item.id === 'approvals' ? pendingApprovalsCount : unreadAlertsCount;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative',
                        active
                          ? 'bg-primary-600/15 text-primary-400 shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
                        sideCollapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className={cn('w-[16px] h-[16px] flex-shrink-0', active && 'text-current')} />
                      {!sideCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}

                      {/* Badges */}
                      {hasBadge && !sideCollapsed && (
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold shrink-0">
                          {badgeVal}
                        </span>
                      )}
                      {hasBadge && sideCollapsed && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">
                          {badgeVal}
                        </span>
                      )}

                      {active && !sideCollapsed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                      )}

                      {/* Tooltips */}
                      {sideCollapsed && (
                        <div className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-xs font-medium text-[var(--text-primary)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                          {item.label}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="border-t border-[var(--border-primary)] p-2 shrink-0 space-y-1 bg-[var(--bg-secondary)]">
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all',
              sideCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="w-4 h-4" />
            {!sideCollapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setSideCollapsed(!sideCollapsed)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
          >
            {sideCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <><ChevronLeft className="w-3.5 h-3.5" /><span>Collapse</span></>}
          </button>
        </div>
      </motion.div>

      {/* Page workspace area */}
      <div className="flex-1 overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl px-6 py-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3"
          >
            {currentItem && (
              <>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <currentItem.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[var(--text-primary)]">{currentItem.label}</h1>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {activeTab === 'dashboard' && 'Unified governance parameters and operational updates'}
                    {activeTab === 'approvals' && 'Verify, request documents, and confirm registration requests'}
                    {activeTab === 'companies' && 'Inspect directories, agent capacities, and tenant details'}
                    {activeTab === 'subscriptions' && 'Inspect billing ledger history and package upgrades'}
                    {activeTab === 'users' && 'View all user details registered across the platform'}
                    {activeTab === 'roles' && 'Check platform permission matrices and access restrictions'}
                    {activeTab === 'analytics' && 'Consolidated tickets, AI metrics, and growth stats'}
                    {activeTab === 'revenue' && 'Examine MRR, renewals, and transaction distributions'}
                    {activeTab === 'ai' && 'Adjust global model scopes, confidence rules, and prompting'}
                    {activeTab === 'audit' && 'Verify operational audit logs, operator logs, and actions'}
                    {activeTab === 'health' && 'Monitor CPU utilization, active latencies, and service signals'}
                    {activeTab === 'announcements' && 'Publish system-wide news releases to all company dashboards'}
                    {activeTab === 'settings' && 'Configure baseline mail servers, token signatures, and default SLAs'}
                    {activeTab === 'notifications' && 'Respond to service failures, security spikes, or registration warnings'}
                    {activeTab === 'profile' && 'Inspect security credentials for this Super Admin session'}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Tab Workspace content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
