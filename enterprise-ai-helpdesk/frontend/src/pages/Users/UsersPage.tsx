import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

const DEMO_USERS = [
  { id: '1', full_name: 'Alex Martinez', email: 'alex@company.com', role: 'Agent', created_at: '2025-01-15' },
  { id: '2', full_name: 'Sarah Kim', email: 'sarah@company.com', role: 'Agent', created_at: '2025-02-20' },
  { id: '3', full_name: 'James Liu', email: 'james@company.com', role: 'Agent', created_at: '2025-03-10' },
  { id: '4', full_name: 'Emily Robinson', email: 'emily@company.com', role: 'Admin', created_at: '2024-11-01' },
  { id: '5', full_name: 'David Wilson', email: 'david@company.com', role: 'Customer', created_at: '2025-04-05' },
  { id: '6', full_name: 'Lisa Huang', email: 'lisa@company.com', role: 'Agent', created_at: '2025-05-12' },
];

const roleColors: Record<string, string> = { Admin: '#ef4444', Agent: '#6366f1', Customer: '#22c55e' };

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">User Management</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">{DEMO_USERS.length} registered users</p>
        </div>
        <Button size="sm">Add User</Button>
      </motion.div>

      <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {DEMO_USERS.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.full_name} size="sm" />
                      <span className="font-medium text-[var(--text-primary)]">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-secondary)]">{user.email}</td>
                  <td className="px-5 py-3"><Badge color={roleColors[user.role]}>{user.role}</Badge></td>
                  <td className="px-5 py-3 text-[var(--text-tertiary)]">{user.created_at}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
