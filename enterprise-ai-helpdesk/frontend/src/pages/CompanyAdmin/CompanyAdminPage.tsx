import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Ticket, UserPlus, Users, UserCheck, Building2,
  Tag, BarChart3, FileText, Bell, Settings, User, LogOut, ShieldCheck,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

// Tab Components
import CADashboardTab from './tabs/CADashboardTab';
import CATicketsTab from './tabs/CATicketsTab';
import CAAssignTicketsTab from './tabs/CAAssignTicketsTab';
import CASupportAgentsTab from './tabs/CASupportAgentsTab';
import CACustomersTab from './tabs/CACustomersTab';
import CADepartmentsTab from './tabs/CADepartmentsTab';
import CACategoriesTab from './tabs/CACategoriesTab';
import CAAnalyticsTab from './tabs/CAAnalyticsTab';
import CAReportsTab from './tabs/CAReportsTab';
import CANotificationsTab from './tabs/CANotificationsTab';
import CASettingsTab from './tabs/CASettingsTab';
import CAProfileTab from './tabs/CAProfileTab';

// Data
import {
  MOCK_TICKETS, MOCK_AGENTS, MOCK_CUSTOMERS, MOCK_DEPARTMENTS,
  MOCK_CATEGORIES, MOCK_NOTIFICATIONS, MOCK_COMPANY_SETTINGS, MOCK_ADMIN_PROFILE,
  type CATicket, type CASupportAgent, type CADepartment, type CACategory,
  type CANotification, type CACompanySettings,
} from './companyAdminData';

// ── Navigation Config ────────────────────────────────────────

type TabId = 'dashboard' | 'tickets' | 'assign' | 'agents' | 'customers' | 'departments' | 'categories' | 'reports' | 'analytics' | 'settings' | 'notifications' | 'profile';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  section: string;
}

const NAV_ITEMS: NavItem[] = [
  // Operations
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Operations' },
  { id: 'tickets', label: 'Tickets', icon: Ticket, section: 'Operations' },
  { id: 'assign', label: 'Assign Tickets', icon: UserPlus, section: 'Operations' },
  // Team & Management
  { id: 'agents', label: 'Support Agents', icon: Users, section: 'Team' },
  { id: 'customers', label: 'Customers', icon: UserCheck, section: 'Team' },
  { id: 'departments', label: 'Departments', icon: Building2, section: 'Team' },
  { id: 'categories', label: 'Categories', icon: Tag, section: 'Team' },
  // Insights
  { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'Insights' },
  { id: 'reports', label: 'Reports', icon: FileText, section: 'Insights' },
  // System
  { id: 'notifications', label: 'Notifications', icon: Bell, section: 'System' },
  { id: 'settings', label: 'Company Settings', icon: Settings, section: 'System' },
  { id: 'profile', label: 'Profile', icon: User, section: 'System' },
];

const SECTIONS = ['Operations', 'Team', 'Insights', 'System'];

export default function CompanyAdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sideCollapsed, setSideCollapsed] = useState(false);

  // Managed state — lifted from mock data so tabs can mutate
  const [tickets, setTickets] = useState<CATicket[]>(MOCK_TICKETS);
  const [agents, setAgents] = useState<CASupportAgent[]>(MOCK_AGENTS);
  const [departments, setDepartments] = useState<CADepartment[]>(MOCK_DEPARTMENTS);
  const [categories, setCategories] = useState<CACategory[]>(MOCK_CATEGORIES);
  const [notifications, setNotifications] = useState<CANotification[]>(MOCK_NOTIFICATIONS);
  const [companySettings, setCompanySettings] = useState<CACompanySettings>(MOCK_COMPANY_SETTINGS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CADashboardTab tickets={tickets} agents={agents} customers={MOCK_CUSTOMERS} />;
      case 'tickets':
        return <CATicketsTab tickets={tickets} agents={agents} onUpdateTickets={setTickets} />;
      case 'assign':
        return <CAAssignTicketsTab tickets={tickets} agents={agents} onUpdateTickets={setTickets} />;
      case 'agents':
        return <CASupportAgentsTab agents={agents} onUpdateAgents={setAgents} />;
      case 'customers':
        return <CACustomersTab customers={MOCK_CUSTOMERS} tickets={tickets} />;
      case 'departments':
        return <CADepartmentsTab departments={departments} onUpdateDepartments={setDepartments} />;
      case 'categories':
        return <CACategoriesTab categories={categories} onUpdateCategories={setCategories} />;
      case 'analytics':
        return <CAAnalyticsTab tickets={tickets} agents={agents} departments={departments} />;
      case 'reports':
        return <CAReportsTab tickets={tickets} agents={agents} />;
      case 'notifications':
        return <CANotificationsTab notifications={notifications} onUpdateNotifications={setNotifications} />;
      case 'settings':
        return <CASettingsTab settings={companySettings} onUpdateSettings={setCompanySettings} />;
      case 'profile':
        return <CAProfileTab profile={MOCK_ADMIN_PROFILE} />;
      default:
        return <CADashboardTab tickets={tickets} agents={agents} customers={MOCK_CUSTOMERS} />;
    }
  };

  const currentNavItem = NAV_ITEMS.find(n => n.id === activeTab);

  return (
    <div className="flex gap-0 -m-4 lg:-m-6 min-h-[calc(100vh-4rem)]">
      {/* Internal Sidebar */}
      <motion.div
        animate={{ width: sideCollapsed ? 56 : 220 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-shrink-0 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className={cn('flex items-center h-14 px-3 border-b border-[var(--border-primary)] shrink-0', sideCollapsed && 'justify-center px-2')}>
          {!sideCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-[var(--text-primary)] truncate">Company Admin</h2>
                <p className="text-[9px] text-amber-400 font-semibold uppercase tracking-wider">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
          {SECTIONS.map(section => {
            const items = NAV_ITEMS.filter(n => n.section === section);
            return (
              <div key={section} className="mb-3">
                {!sideCollapsed && (
                  <p className="px-2 mb-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                    {section}
                  </p>
                )}
                {items.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative',
                        active
                          ? 'bg-amber-600/15 text-amber-400 shadow-sm'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
                        sideCollapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className={cn('w-[16px] h-[16px] flex-shrink-0', active && 'text-current')} />
                      {!sideCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {/* Notification badge */}
                      {item.id === 'notifications' && unreadCount > 0 && !sideCollapsed && (
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                          {unreadCount}
                        </span>
                      )}
                      {item.id === 'notifications' && unreadCount > 0 && sideCollapsed && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">
                          {unreadCount}
                        </span>
                      )}
                      {active && !sideCollapsed && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      )}
                      {/* Tooltip for collapsed */}
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

        {/* Logout + Collapse */}
        <div className="border-t border-[var(--border-primary)] p-2 shrink-0 space-y-1">
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab Header */}
        <div className="sticky top-0 z-10 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl px-6 py-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3"
          >
            {currentNavItem && (
              <>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <currentNavItem.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[var(--text-primary)]">{currentNavItem.label}</h1>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {activeTab === 'dashboard' && 'Overview of your company support operations'}
                    {activeTab === 'tickets' && 'Manage all tickets belonging to your company'}
                    {activeTab === 'assign' && 'Assign and reassign tickets to support agents'}
                    {activeTab === 'agents' && 'Manage your company support team'}
                    {activeTab === 'customers' && 'View customers who have raised tickets'}
                    {activeTab === 'departments' && 'Manage company support departments'}
                    {activeTab === 'categories' && 'Manage ticket classification categories'}
                    {activeTab === 'analytics' && 'Visual insights into support operations'}
                    {activeTab === 'reports' && 'Generate and export company reports'}
                    {activeTab === 'notifications' && 'Stay updated with important alerts'}
                    {activeTab === 'settings' && 'Configure your company helpdesk preferences'}
                    {activeTab === 'profile' && 'Your admin profile information'}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
