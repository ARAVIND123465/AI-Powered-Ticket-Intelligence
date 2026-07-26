import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Filter, UserCheck, Shield } from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import type { SAPlatformUser } from '../superAdminData';

interface Props {
  users: SAPlatformUser[];
}

const PAGE_SIZE = 8;

export default function SAPlatformUsersTab({ users }: Props) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.companyName.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search users by name, email, or company..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-9 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3 text-xs text-[var(--text-primary)] focus:outline-none"
        >
          <option value="All">All Roles</option>
          <option value="Company Admin">Company Admins</option>
          <option value="Support Agent">Support Agents</option>
          <option value="Customer">Customers</option>
        </select>
        <span className="text-xs text-[var(--text-tertiary)] font-semibold">{filtered.length} users registered</span>
      </motion.div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Company Partner</th>
                <th className="py-3 px-4 text-center">User Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Last Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {paginated.map(user => (
                <tr key={user.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <span className="font-bold text-[var(--text-primary)]">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{user.email}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{user.companyName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      user.role === 'Company Admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      user.role === 'Support Agent' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--text-tertiary)] font-mono">
                    {formatDate(user.lastActive)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border-primary)] px-4 py-3 bg-[var(--bg-secondary)]/50">
          <span className="text-xs text-[var(--text-tertiary)]">Page {safePage} of {totalPages}</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-secondary)] disabled:opacity-30 transition-all font-semibold"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-xs text-[var(--text-secondary)] disabled:opacity-30 transition-all font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
