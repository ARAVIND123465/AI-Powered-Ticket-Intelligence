import { Outlet, Link } from 'react-router-dom';
import PublicNavbar from '@/components/navbar/PublicNavbar';
import { Sparkles, Heart } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      <PublicNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] py-8 mt-12 text-xs text-[var(--text-tertiary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[var(--text-secondary)]">AI Helpdesk Enterprise</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-[var(--text-secondary)]">About</Link>
            <Link to="/contact" className="hover:text-[var(--text-secondary)]">Contact</Link>
            <Link to="/track-ticket" className="hover:text-[var(--text-secondary)]">Track Ticket</Link>
            <Link to="/admin-login" className="hover:text-primary-400 font-semibold">Enterprise Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
