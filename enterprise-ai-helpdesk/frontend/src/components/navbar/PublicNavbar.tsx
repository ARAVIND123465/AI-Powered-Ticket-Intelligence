import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles, Home, Bot, Ticket, Search, Info, PhoneCall,
  LogIn, ShieldCheck, Menu, X, ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PublicNavbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Create Ticket', path: '/public-create-ticket', icon: Ticket },
    { label: 'Track Tickets', path: '/track-ticket', icon: Search },
    { label: 'AI Chat', path: '/public-assistant', icon: Bot },
    { label: 'Contact', path: '/contact', icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold gradient-text block leading-tight">AI Helpdesk</span>
            <span className="text-[9px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider block">Enterprise Platform</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400 font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link to="/login">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" /> Customer Sign In
            </Button>
          </Link>
          <Link to="/admin-login">
            <Button size="sm" className="text-xs flex items-center gap-1.5 shadow-lg shadow-primary-500/10">
              <ShieldCheck className="w-3.5 h-3.5" /> Enterprise Portal <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 space-y-2 animate-fadeIn">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-primary-500/15 text-primary-400' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-2 border-t border-[var(--border-primary)] flex flex-col gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full text-xs">Customer Sign In</Button>
            </Link>
            <Link to="/admin-login" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" className="w-full text-xs">Enterprise Admin Portal</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
