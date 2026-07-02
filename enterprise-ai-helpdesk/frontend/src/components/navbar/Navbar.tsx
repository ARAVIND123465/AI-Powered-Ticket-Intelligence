import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, Search, Menu } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="h-16 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        {onMenuClick && (
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center relative max-w-md flex-1">
          <Search className="absolute left-3 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, docs…"
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </form>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
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
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all"
          >
            <Avatar name={user?.full_name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-[var(--text-primary)]">{user?.full_name || 'User'}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">{user?.role}</p>
            </div>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-lg z-50 py-1 overflow-hidden">
                <button onClick={() => { navigate('/profile'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  Profile
                </button>
                <button onClick={() => { navigate('/settings'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                  Settings
                </button>
                <hr className="border-[var(--border-primary)] my-1" />
                <button onClick={() => { logout(); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
