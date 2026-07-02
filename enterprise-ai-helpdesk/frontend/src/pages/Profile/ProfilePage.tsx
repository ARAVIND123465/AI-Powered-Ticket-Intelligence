import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Mail, Calendar, Shield, Ticket, CheckCircle2, Clock, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export default function ProfilePage() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const displayUser = user || {
    full_name: 'John Doe',
    email: 'john@company.com',
    role: 'Admin' as const,
    created_at: '2025-01-15T00:00:00Z',
    id: '1'
  };

  const password = localStorage.getItem('mock_user_password') || 'password123';

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Your account information</p>
      </motion.div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-5">
          <Avatar name={displayUser.full_name} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{displayUser.full_name || displayUser.email}</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]"><Mail className="w-3.5 h-3.5" /> {displayUser.email}</div>
              <Badge color={displayUser.role === 'Admin' ? '#ef4444' : displayUser.role === 'Agent' ? '#6366f1' : '#22c55e'}>{displayUser.role}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Ticket className="w-5 h-5" />, label: 'Tickets Created', value: '142', color: '#6366f1' },
          { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Resolved', value: '118', color: '#22c55e' },
          { icon: <Clock className="w-5 h-5" />, label: 'Avg Resolution', value: '3.2h', color: '#06b6d4' },
          { icon: <Shield className="w-5 h-5" />, label: 'SLA Met', value: '97%', color: '#f59e0b' },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${stat.color}18`, color: stat.color }}>{stat.icon}</div>
            <p className="text-xl font-bold text-[var(--text-primary)]">{stat.value}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Account details */}
      <Card>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Account Details</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-tertiary)]">Full Name</span>
            <span className="text-sm text-[var(--text-primary)] font-medium">{displayUser.full_name || 'Not set'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-tertiary)]">Email Address</span>
            <span className="text-sm text-[var(--text-primary)] font-medium">{displayUser.email}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-tertiary)]">Role</span>
            <span className="text-sm text-[var(--text-primary)] font-medium">{displayUser.role}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[var(--border-primary)]">
            <span className="text-sm text-[var(--text-tertiary)]">Member Since</span>
            <span className="text-sm text-[var(--text-primary)] font-medium">{formatDate(displayUser.created_at)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[var(--text-tertiary)]">Password</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-primary)] font-mono font-medium">
                {showPassword ? password : '••••••••'}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

