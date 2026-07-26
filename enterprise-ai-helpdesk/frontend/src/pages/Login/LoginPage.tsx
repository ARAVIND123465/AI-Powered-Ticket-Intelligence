import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, ShieldCheck, Building } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const isSuper = email.toLowerCase().includes('super');
      const isAdmin = email.toLowerCase().includes('admin');
      const isAgent = email.toLowerCase().includes('agent');
      const detectedRole = isSuper ? 'SuperAdmin' : isAdmin ? 'Admin' : isAgent ? 'Agent' : 'Customer';
      
      localStorage.setItem('user_role', detectedRole);
      await login(email, password);
      
      if (detectedRole === 'SuperAdmin') {
        window.location.href = '/super-admin';
      } else if (detectedRole === 'Admin') {
        window.location.href = '/company-admin';
      } else if (detectedRole === 'Agent') {
        window.location.href = '/agent';
      } else {
        window.location.href = '/customer';
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Customer Sign In</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Sign in to submit or manage your support tickets</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          Sign In
        </Button>
      </form>

      {/* Enterprise Admin Portal & Company Registration Links */}
      <div className="mt-5 p-3.5 rounded-xl bg-primary-500/10 border border-primary-500/20 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-400" /> Admin & Super Admin?
          </span>
          <Link to="/admin-login" className="text-primary-400 font-bold hover:underline text-[11px]">
            Enterprise Portal →
          </Link>
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
          Super Admins, Company Admins, and Support Agents can log in via the dedicated Enterprise Portal.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-primary)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <span>Don't have an account? <Link to="/register" className="text-primary-400 font-medium hover:underline">Create one</Link></span>
        <Link to="/register-company" className="text-primary-400 hover:underline flex items-center gap-1">
          <Building className="w-3.5 h-3.5" /> Company Onboarding
        </Link>
      </div>
    </div>
  );
}
