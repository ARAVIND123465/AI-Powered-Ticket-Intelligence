import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';
import type { CACustomer, CATicket } from '../companyAdminData';
import { formatRelative } from '@/utils/formatters';

interface Props {
  customers: CACustomer[];
  tickets: CATicket[];
}

export default function CACustomersTab({ customers, tickets }: Props) {
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState<CACustomer | null>(null);

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const customerTickets = viewCustomer
    ? tickets.filter(t => t.customerEmail === viewCustomer.email)
    : [];

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
          <input type="text" placeholder="Search customers by name, email, phone..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors" />
        </div>
      </motion.div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Total Tickets</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">Open</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {filtered.map(customer => (
                <tr key={customer.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={customer.name} size="sm" />
                      <span className="font-medium text-[var(--text-primary)]">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{customer.email}</td>
                  <td className="py-3 px-4 text-[var(--text-tertiary)]">{customer.phone}</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-[var(--text-primary)]">{customer.totalTickets}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{customer.resolvedTickets}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded-md border ${customer.openTickets > 0 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>{customer.openTickets}</span>
                  </td>
                  <td className="py-3 px-4 text-[var(--text-tertiary)]">{formatRelative(customer.lastActivity)}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setViewCustomer(customer)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-blue-400 transition-colors" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Customer Modal */}
      <Modal isOpen={!!viewCustomer} onClose={() => setViewCustomer(null)} title={`Customer — ${viewCustomer?.name}`} size="lg">
        {viewCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={viewCustomer.name} size="lg" />
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{viewCustomer.name}</h3>
                <p className="text-xs text-[var(--text-tertiary)]">{viewCustomer.email}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{viewCustomer.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 text-center bg-blue-500/5 border-blue-500/20">
                <div className="text-lg font-bold text-[var(--text-primary)]">{viewCustomer.totalTickets}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Total Tickets</div>
              </Card>
              <Card className="p-3 text-center bg-emerald-500/5 border-emerald-500/20">
                <div className="text-lg font-bold text-emerald-400">{viewCustomer.resolvedTickets}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Resolved</div>
              </Card>
              <Card className="p-3 text-center bg-amber-500/5 border-amber-500/20">
                <div className="text-lg font-bold text-amber-400">{viewCustomer.openTickets}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">Open</div>
              </Card>
            </div>
            {customerTickets.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[var(--text-primary)] mb-2">Ticket History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerTickets.map(t => (
                    <div key={t.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                      <div>
                        <span className="font-mono text-primary-400 text-[11px] font-semibold">{t.id}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] ml-2">{t.title}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        t.status === 'Open' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                        t.status === 'In_Progress' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        t.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                        t.status === 'Pending' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        'bg-gray-500/15 text-gray-400 border-gray-500/30'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
