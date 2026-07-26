import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { formatDateTime } from '@/utils/formatters';
import type { SAAuditLog } from '../superAdminData';

interface Props {
  logs: SAAuditLog[];
}

export default function SAAuditLogsTab({ logs }: Props) {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search platform audit logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <span className="text-xs text-[var(--text-tertiary)] font-semibold">{filtered.length} entries registered</span>
      </motion.div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Scope Company</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4 text-center">IP Address</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)] font-mono">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3 px-4 text-[var(--text-tertiary)]">{formatDateTime(log.timestamp)}</td>
                  <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{log.user}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{log.company}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)] font-sans">{log.action}</td>
                  <td className="py-3 px-4 text-indigo-400 font-sans">{log.module}</td>
                  <td className="py-3 px-4 text-center text-[var(--text-tertiary)]">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      log.status === 'Success' ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
                      'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {log.status === 'Success' ? <CheckCircle className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
