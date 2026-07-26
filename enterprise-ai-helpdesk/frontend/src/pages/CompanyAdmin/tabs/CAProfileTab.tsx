import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Building2, Shield, Clock, Calendar, Edit3,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate, formatRelative } from '@/utils/formatters';
import type { CAAdminProfile } from '../companyAdminData';

interface Props {
  profile: CAAdminProfile;
}

export default function CAProfileTab({ profile }: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center text-3xl shadow-xl">
              {profile.avatar}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{profile.name}</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{profile.companyName}</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant="warning" size="md">{profile.role}</Badge>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField icon={<User className="w-4 h-4" />} label="Admin Name" value={profile.name} />
              <ProfileField icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />
              <ProfileField icon={<Phone className="w-4 h-4" />} label="Phone" value={profile.phone} />
              <ProfileField icon={<Building2 className="w-4 h-4" />} label="Company" value={profile.companyName} />
              <ProfileField icon={<Shield className="w-4 h-4" />} label="Role" value={profile.role} />
              <ProfileField icon={<Clock className="w-4 h-4" />} label="Last Login" value={formatRelative(profile.lastLogin)} />
              <ProfileField icon={<Calendar className="w-4 h-4" />} label="Joined" value={formatDate(profile.joinedAt)} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Activity Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { action: 'Assigned TKT-2002 to Alex Rivera', time: '2 hours ago', color: 'text-blue-400' },
              { action: 'Updated SLA configuration', time: '5 hours ago', color: 'text-amber-400' },
              { action: 'Added new agent Anita Desai', time: '1 day ago', color: 'text-emerald-400' },
              { action: 'Generated weekly performance report', time: '2 days ago', color: 'text-purple-400' },
              { action: 'Resolved escalation for TKT-2020', time: '3 days ago', color: 'text-pink-400' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[var(--border-primary)] last:border-0">
                <span className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')}`} />
                <span className="text-xs text-[var(--text-secondary)] flex-1">{activity.action}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
      <div className="text-[var(--text-tertiary)]">{icon}</div>
      <div>
        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-xs font-medium text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
