import { motion } from 'framer-motion';
import { User, Mail, Phone, ShieldCheck, Clock, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDateTime } from '@/utils/formatters';

export default function SAProfileTab() {
  const profile = {
    name: 'Aravindhan Natarajan',
    email: 'superadmin@ai-helpdesk.io',
    phone: '+91-99001-12233',
    role: 'Platform Owner / Super Admin',
    avatar: 'SA',
    lastLogin: new Date(Date.now() - 600000).toISOString(),
    joinedAt: new Date('2026-01-15T09:00:00Z').toISOString(),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-3xl shadow-xl shrink-0">
              {profile.avatar}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{profile.name}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{profile.role}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="warning" size="md">Platform Owner</Badge>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Session
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
              <User className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">Username</p>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{profile.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
              <Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">Direct Email</p>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
              <Phone className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">Direct Phone</p>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{profile.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
              <ShieldCheck className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">Authorization Scope</p>
                <p className="text-xs font-semibold text-[var(--text-primary)]">Full Control</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
              <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">Last Authenticated</p>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{formatDateTime(profile.lastLogin)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
              <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div>
                <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">Joined Platform</p>
                <p className="text-xs font-semibold text-[var(--text-primary)]">{formatDateTime(profile.joinedAt)}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
