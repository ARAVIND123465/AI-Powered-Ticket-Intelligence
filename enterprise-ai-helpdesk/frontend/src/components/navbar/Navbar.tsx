import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, Search, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

interface NavbarProps {
  onMenuClick?: () => void;
}

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  Customer: { label: 'Customer', color: 'text-emerald-400' },
  Agent: { label: 'Support Agent', color: 'text-indigo-400' },
  Admin: { label: 'Company Admin', color: 'text-amber-400' },
  SuperAdmin: { label: 'Super Admin', color: 'text-red-400' },
};

const roleHome = (role: string | null): string => {
  if (!role) return '/';
  const r = role.toUpperCase();
  if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN') return '/platform/dashboard';
  if (r === 'COMPANY_ADMIN' || r === 'ADMIN' || r === 'COMPANYADMIN') return '/company-admin/dashboard';
  if (r === 'SUPPORT_AGENT' || r === 'AGENT' || r === 'SUPPORTAGENT') return '/agent/dashboard';
  if (r === 'CUSTOMER') return '/customer/dashboard';
  return '/';
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const roleMeta = ROLE_BADGE[role || 'Customer'] || ROLE_BADGE.Customer;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        {onMenuClick && (
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center relative max-w-md flex-1">
          <Search className="absolute left-3 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets…"
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </form>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
          title="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--bg-secondary)]" />
        </button>

        {/* User avatar dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all"
          >
            <Avatar name={user?.full_name || user?.email || 'U'} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                {user?.full_name || 'User'}
              </p>
              <p className={cn('text-[10px] font-medium leading-tight', roleMeta.color)}>
                {roleMeta.label}
              </p>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform', showDropdown && 'rotate-180')} />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-xl z-50 py-1.5 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[var(--border-primary)]">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.full_name || 'User'}</p>
                  <p className="text-[11px] text-[var(--text-tertiary)] truncate">{user?.email}</p>
                  <span className={cn('text-[10px] font-semibold mt-1 inline-block', roleMeta.color)}>
                    {roleMeta.label}
                  </span>
                </div>

                {/* Navigation */}
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" /> Profile
                  </button>
                  <button
                    onClick={() => { navigate('/notifications'); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5" /> Notifications
                  </button>
                  {(role === 'Admin' || role === 'SuperAdmin') && (
                    <button
                      onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" /> Company Settings
                    </button>
                  )}
                </div>

                {/* Switch Role (dev shortcut) */}
                <div className="border-t border-[var(--border-primary)] pt-1.5 pb-1">
                  <div className="px-4 py-1 text-[9px] uppercase font-bold text-[var(--text-tertiary)] tracking-widest">
                    Dev: Switch Role
                  </div>
                  {(['SuperAdmin', 'Admin', 'Agent', 'Customer'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        localStorage.setItem('user_role', r);
                        const home = r === 'Customer' ? '/customer/dashboard' : r === 'Agent' ? '/agent/dashboard' : r === 'SuperAdmin' ? '/platform/dashboard' : '/company-admin/dashboard';
                        window.location.href = home;
                      }}
                      className={cn(
                        'w-full text-left px-4 py-1.5 text-xs flex items-center justify-between transition-colors',
                        role === r
                          ? 'text-primary-400 font-bold bg-primary-500/10'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                      )}
                    >
                      <span>{r}</span>
                      {role === r && <span className="text-[10px] text-primary-400">✓</span>}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-[var(--border-primary)] pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
