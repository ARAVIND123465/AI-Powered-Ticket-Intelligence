import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Ticket, Plus, BarChart3, Bot, Search,
  FileText, Users, Settings, ChevronLeft, ChevronRight, Sparkles, LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SIDEBAR_NAV } from '@/constants';
import { cn } from '@/utils/cn';
import Avatar from '@/components/ui/Avatar';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Ticket, Plus, BarChart3, Bot, Search, FileText, Users, Settings,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const renderSection = (title: string, items: readonly { label: string; path: string; icon: string; roles: readonly string[] }[]) => {
    const visibleItems = items.filter((item) => role && item.roles.includes(role));
    if (visibleItems.length === 0) return null;

    return (
      <div className="mb-4">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            {title}
          </p>
        )}
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-600/15 text-primary-400 shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-primary-400')} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen sticky top-0 flex flex-col border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] z-30"
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-[var(--border-primary)]', collapsed && 'justify-center px-2')}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-sm font-bold gradient-text leading-tight">AI Helpdesk</h1>
              <p className="text-[9px] text-[var(--text-tertiary)] font-medium">Enterprise Platform</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {renderSection('Main', SIDEBAR_NAV.main)}
        {renderSection('AI Features', SIDEBAR_NAV.ai)}
        {renderSection('Management', SIDEBAR_NAV.management)}
      </nav>

      {/* User & Collapse */}
      <div className="border-t border-[var(--border-primary)] p-2">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <Avatar name={user.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user.full_name || user.email}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">{user.role}</p>
            </div>
            <button onClick={logout} className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Logout">
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
