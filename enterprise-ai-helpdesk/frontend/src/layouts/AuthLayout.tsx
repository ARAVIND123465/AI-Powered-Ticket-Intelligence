import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center p-4">
      {/* Decorative orbs */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-accent-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">AI Helpdesk</h1>
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium tracking-wide">ENTERPRISE PLATFORM</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl border border-[var(--border-primary)]">
          <Outlet />
        </div>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
          Powered by Machine Learning, RAG & Gemini AI
        </p>
      </div>
    </div>
  );
}
