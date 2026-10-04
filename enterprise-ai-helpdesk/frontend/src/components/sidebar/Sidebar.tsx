import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Ticket, Plus, BarChart3, Bot, Search, Bell, User,
  FileText, Users, Settings, ChevronLeft, ChevronRight, Sparkles, LogOut,
  ShieldCheck, Building, ClipboardList, MessageSquare, TrendingUp, Clock,
  CheckCircle,
} from 'lucide-react';
import { useAuth, normalizeRole } from '@/context/AuthContext';
import { CUSTOMER_NAV, AGENT_NAV, ADMIN_NAV, SUPERADMIN_NAV } from '@/constants';
import { cn } from '@/utils/cn';
import Avatar from '@/components/ui/Avatar';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Ticket, Plus, BarChart3, Bot, Search, Bell, User,
  FileText, Users, Settings, ShieldCheck, Building, ClipboardList,
  MessageSquare, TrendingUp, Clock, CheckCircle,
};

// Role → portal identity config
const PORTAL_IDENTITY = {
  Customer: {
    label: 'Customer Portal',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    accent: 'bg-emerald-600/15 text-emerald-400',
    dot: 'bg-emerald-400',
    gradient: 'from-emerald-600 to-teal-600',
    sections: [
      { title: 'My Workspace', items: CUSTOMER_NAV.main },
      { title: 'Support & AI', items: CUSTOMER_NAV.support },
      { title: 'Account', items: CUSTOMER_NAV.account },
    ],
  },
  Agent: {
    label: 'Agent Panel',
    badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
    accent: 'bg-indigo-600/15 text-indigo-400',
    dot: 'bg-indigo-400',
    gradient: 'from-indigo-600 to-violet-600',
    sections: [
      { title: 'Workspace', items: AGENT_NAV.workspace },
      { title: 'Tools & AI', items: AGENT_NAV.tools },
      { title: 'Account', items: AGENT_NAV.account },
    ],
  },
  Admin: {
    label: 'Company Admin',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    accent: 'bg-amber-600/15 text-amber-400',
    dot: 'bg-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    sections: [
      { title: 'Operations', items: ADMIN_NAV.operations },
      { title: 'Team & Reports', items: ADMIN_NAV.team },
      { title: 'System', items: ADMIN_NAV.system },
    ],
  },
  SuperAdmin: {
    label: 'Super Admin',
    badge: 'bg-red-500/15 text-red-400 border-red-500/25',
    accent: 'bg-red-600/15 text-red-400',
    dot: 'bg-red-400',
    gradient: 'from-red-600 to-rose-600',
    sections: [
      { title: 'Platform', items: SUPERADMIN_NAV.platform },
      { title: 'Management', items: SUPERADMIN_NAV.management },
      { title: 'System', items: SUPERADMIN_NAV.system },
    ],
  },
} as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const canonicalRole = normalizeRole(role);
  const portal = PORTAL_IDENTITY[canonicalRole] || PORTAL_IDENTITY.Customer;

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== '/customer' && path !== '/agent' && path !== '/dashboard' && path !== '/super-admin' &&
     path !== '/customer/dashboard' && path !== '/agent/dashboard' && path !== '/company-admin/dashboard' && path !== '/platform/dashboard' &&
     location.pathname.startsWith(path));

  const renderSection = (title: string, items: readonly { label: string; path: string; icon: string }[]) => (
    <div className="mb-4" key={title}>
      {!collapsed && (
        <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const active = isActive(item.path);
          return (
            <Link key={`${item.path}-${item.label}`} to={item.path}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  active
                    ? `${portal.accent} shadow-sm`
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', active && 'text-current')} />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                {active && !collapsed && (
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', portal.dot)} />
                )}
                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-xs font-medium text-[var(--text-primary)] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen sticky top-0 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] z-30 overflow-hidden"
    >
      {/* Logo + Portal Badge */}
      <div className={cn('flex items-center h-16 px-4 border-b border-[var(--border-primary)] flex-shrink-0', collapsed && 'justify-center px-2')}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0', portal.gradient)}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <h1 className="text-sm font-bold gradient-text leading-tight truncate">AI Helpdesk</h1>
              <span className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border mt-0.5',
                portal.badge
              )}>
                {portal.label}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin">
        {portal.sections.map((section) =>
          renderSection(section.title, section.items as readonly { label: string; path: string; icon: string }[])
        )}
      </nav>

      {/* User Info + Collapse Toggle */}
      <div className="border-t border-[var(--border-primary)] p-2 flex-shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors group">
            <Avatar name={user.full_name || user.email} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.full_name || user.email}</p>
              <p className={cn('text-[10px] font-medium truncate', portal.badge.split(' ')[1])}>{user.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </motion.aside>
  );
}
