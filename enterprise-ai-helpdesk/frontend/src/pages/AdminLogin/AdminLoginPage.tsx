import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Mail, Lock, ShieldCheck, Building, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'super' | 'company' | 'agent'>('super');
  const [email, setEmail] = useState('superadmin@company.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (tab: 'super' | 'company' | 'agent') => {
    setActiveTab(tab);
    setError('');
    if (tab === 'super') {
      setEmail('superadmin@company.com');
    } else if (tab === 'company') {
      setEmail('admin@redbus.in');
    } else {
      setEmail('agent@helpdesk.com');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const targetRole = activeTab === 'super' ? 'SuperAdmin' : activeTab === 'company' ? 'Admin' : 'Agent';
      localStorage.setItem('user_role', targetRole);

      await login(email, password);
      
      toast.success(`Logged in successfully!`);
      
      const storedRole = localStorage.getItem('user_role') || targetRole;
      const r = storedRole.toUpperCase();
      if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN') {
        window.location.href = '/platform/dashboard';
      } else if (r === 'COMPANY_ADMIN' || r === 'ADMIN' || r === 'COMPANYADMIN') {
        window.location.href = '/company-admin/dashboard';
      } else if (r === 'SUPPORT_AGENT' || r === 'AGENT' || r === 'SUPPORTAGENT') {
        window.location.href = '/agent/dashboard';
      } else {
        window.location.href = '/customer/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Enterprise & Admin Portal</h2>
        <p className="text-xs text-[var(--text-tertiary)]">
          Dedicated login for Super Admins, Approved Company Administrators, and Support Agents
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex gap-1.5 p-1 bg-[var(--bg-tertiary)] rounded-2xl border border-[var(--border-primary)]">
        <button
          type="button"
          onClick={() => handleTabChange('super')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'super'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('company')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'company'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Company Admin
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('agent')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'agent'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> Support Agent
        </button>
      </div>

      {/* Login Card */}
      <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-xl space-y-4">
        {error && (
          <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={activeTab === 'super' ? 'Super Admin Email' : activeTab === 'company' ? 'Company Admin Email' : 'Agent Email'}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full flex items-center justify-center gap-2">
            Sign In to {activeTab === 'super' ? 'Super Admin' : activeTab === 'company' ? 'Company Admin' : 'Agent'} Portal
          </Button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="pt-3 border-t border-[var(--border-primary)] space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">Quick Demo Login Shortcuts:</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => { setEmail('superadmin@company.com'); setPassword('password123'); setActiveTab('super'); }}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-primary-500/10 text-left border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-primary-400"
            >
              <div className="font-semibold text-primary-400">👑 Super Admin</div>
              <div className="text-[9px] text-[var(--text-tertiary)] truncate">superadmin@company.com</div>
            </button>

            <button
              onClick={() => { setEmail('admin@redbus.in'); setPassword('password123'); setActiveTab('company'); }}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-primary-500/10 text-left border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-primary-400"
            >
              <div className="font-semibold text-red-400">🚌 RedBus Admin</div>
              <div className="text-[9px] text-[var(--text-tertiary)] truncate">admin@redbus.in</div>
            </button>

            <button
              onClick={() => { setEmail('admin@irctc.co.in'); setPassword('password123'); setActiveTab('company'); }}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-primary-500/10 text-left border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-primary-400"
            >
              <div className="font-semibold text-blue-400">🚆 IRCTC Admin</div>
              <div className="text-[9px] text-[var(--text-tertiary)] truncate">admin@irctc.co.in</div>
            </button>

            <button
              onClick={() => { setEmail('agent@helpdesk.com'); setPassword('password123'); setActiveTab('agent'); }}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-primary-500/10 text-left border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-primary-400"
            >
              <div className="font-semibold text-purple-400">🎧 Support Agent</div>
              <div className="text-[9px] text-[var(--text-tertiary)] truncate">agent@helpdesk.com</div>
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-[var(--text-tertiary)] flex items-center justify-between">
          <Link to="/login" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            ← Public Customer Login
          </Link>
          <Link to="/register-company" className="text-primary-400 font-semibold hover:underline flex items-center gap-1">
            <Building className="w-3.5 h-3.5" /> Register New Company
          </Link>
        </div>
      </div>
    </div>
  );
}
