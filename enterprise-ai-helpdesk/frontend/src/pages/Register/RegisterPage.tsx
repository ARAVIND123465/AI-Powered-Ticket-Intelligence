import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Mail, Lock, User, ShieldCheck, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Public users register strictly as Customer role
      await registerUser(email, password, fullName, 'Customer');
      toast.success("Account created successfully! Please sign in.");
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Create Customer Account</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Submit & track your support tickets with AI intelligence</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} icon={<User className="w-4 h-4" />} required />
        <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />
        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required />
        
        <Button type="submit" isLoading={isLoading} className="w-full">
          Create Account
        </Button>
      </form>

      {/* Enterprise Company Registration Banner */}
      <div className="mt-5 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]">
          <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-primary-400" /> Enterprise Company?</span>
          <Link to="/register-company" className="text-primary-400 hover:underline text-[11px]">
            Onboard Company →
          </Link>
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed">
          Register your organization (e.g., RedBus, IRCTC, TechCorp) for Super Admin approval & multi-tenant helpdesk.
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-primary)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <span>Already have an account? <Link to="/login" className="text-primary-400 font-medium hover:underline">Sign in</Link></span>
        <Link to="/admin-login" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
        </Link>
      </div>
    </div>
  );
}
