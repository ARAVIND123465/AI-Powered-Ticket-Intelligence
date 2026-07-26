import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function SARolesPermissionsTab() {
  const permissionsAllowed = [
    'Approve New Companies',
    'Reject Company Registrations',
    'Suspend Companies',
    'Activate Companies',
    'Manage All Companies',
    'Manage Platform Users',
    'Manage Subscription Plans',
    'View Platform Analytics',
    'Configure AI Models',
    'Manage System Settings',
    'Broadcast Announcements',
    'View Audit Logs',
    'Monitor Platform Health',
    'Access Every Company Dashboard (Read Only)'
  ];

  const permissionsDenied = [
    'Resolve Customer Tickets',
    'Reply to Customer Chats',
    'Act as Support Agent',
    'Modify Company Ticket Conversations'
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Platform Master Governance Matrix</h3>
        <p className="text-xs text-[var(--text-tertiary)] font-semibold">Overall permission checks for the Platform Super Admin role</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Permitted */}
        <Card className="p-6 space-y-4 border-emerald-500/20 bg-emerald-500/[0.01]">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="text-sm font-bold">Authorized Operations</h4>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">The Platform Super Admin owns administrative & provisioning governance over all tenants</p>
          <div className="space-y-2.5">
            {permissionsAllowed.map((perm, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <span className="text-emerald-400 font-bold shrink-0">✔</span>
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Prohibited */}
        <Card className="p-6 space-y-4 border-red-500/20 bg-red-500/[0.01]">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h4 className="text-sm font-bold">Enforced Security Boundaries</h4>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">Super Admins do not handle individual customer operations or agent resolutions</p>
          <div className="space-y-2.5">
            {permissionsDenied.map((perm, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <span className="text-rose-400 font-bold shrink-0">✘</span>
                <span className="line-through decoration-rose-500/30">{perm}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Compliance banner */}
      <Card className="p-4 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] flex gap-3 text-xs text-[var(--text-secondary)] items-start">
        <HelpCircle className="w-5 h-5 text-primary-400 shrink-0" />
        <div>
          <span className="font-bold text-[var(--text-primary)]">Why these boundaries exist?</span>
          <p className="mt-0.5 leading-relaxed text-[var(--text-tertiary)]">
            Platform Owners manage SaaS operations, subscription levels, approvals, global billing, infrastructure, and generic parameters. In contrast, individual ticket routing rules, resolutions, discussions, and conversations remain completely confidential to their respective Company Admins.
          </p>
        </div>
      </Card>
    </div>
  );
}
