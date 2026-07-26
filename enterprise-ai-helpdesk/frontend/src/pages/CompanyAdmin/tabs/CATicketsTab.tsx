import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Eye, UserPlus, ArrowRightLeft, RefreshCw, XCircle,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import type { CATicket, CASupportAgent } from '../companyAdminData';
import { formatRelative } from '@/utils/formatters';

interface Props {
  tickets: CATicket[];
  agents: CASupportAgent[];
  onUpdateTickets: (tickets: CATicket[]) => void;
}

const PAGE_SIZE = 8;

const priorityClass = (p: string) =>
  p === 'Urgent' || p === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
  p === 'High' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
  p === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
  'bg-green-500/15 text-green-400 border-green-500/30';

const statusClass = (s: string) =>
  s === 'Open' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
  s === 'In_Progress' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
  s === 'Pending' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
  s === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
  'bg-gray-500/15 text-gray-400 border-gray-500/30';

function getSlaStatus(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const hours = diff / 3600000;
  if (hours <= 0) return { label: 'Breached', cls: 'text-red-400 bg-red-500/10 border-red-500/20' };
  if (hours <= 2) return { label: `${hours.toFixed(1)}h left`, cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
  if (hours <= 8) return { label: `${hours.toFixed(1)}h left`, cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  return { label: `${Math.round(hours)}h left`, cls: 'text-green-400 bg-green-500/10 border-green-500/20' };
}

export default function CATicketsTab({ tickets, agents, onUpdateTickets }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [viewTicket, setViewTicket] = useState<CATicket | null>(null);
  const [assignModal, setAssignModal] = useState<CATicket | null>(null);
  const [statusModal, setStatusModal] = useState<CATicket | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedAgent || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleAssign = () => {
    if (!assignModal || !selectedAgent) return;
    const updated = tickets.map(t => t.id === assignModal.id ? { ...t, assignedAgent: selectedAgent, status: t.status === 'Open' ? 'In_Progress' as const : t.status } : t);
    onUpdateTickets(updated);
    toast.success(`Ticket ${assignModal.id} assigned to ${selectedAgent}`);
    setAssignModal(null);
    setSelectedAgent('');
  };

  const handleStatusUpdate = () => {
    if (!statusModal || !selectedStatus) return;
    const updated = tickets.map(t => t.id === statusModal.id ? { ...t, status: selectedStatus as CATicket['status'], updatedAt: new Date().toISOString() } : t);
    onUpdateTickets(updated);
    toast.success(`Ticket ${statusModal.id} status updated to ${selectedStatus.replace('_', ' ')}`);
    setStatusModal(null);
    setSelectedStatus('');
  };

  const handleClose = (ticket: CATicket) => {
    const updated = tickets.map(t => t.id === ticket.id ? { ...t, status: 'Closed' as const, updatedAt: new Date().toISOString() } : t);
    onUpdateTickets(updated);
    toast.success(`Ticket ${ticket.id} closed`);
  };

  const activeAgents = agents.filter(a => a.status === 'Active');

  return (
    <div className="space-y-4">
      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search tickets by ID, customer, category..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3 text-xs text-[var(--text-primary)]">
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In_Progress">In Progress</option>
          <option value="Pending">Pending</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} className="h-9 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3 text-xs text-[var(--text-primary)]">
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
          <option value="Urgent">Urgent</option>
        </select>
        <span className="text-xs text-[var(--text-tertiary)]">{filtered.length} tickets</span>
      </motion.div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-center">SLA</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {paginated.map(ticket => {
                const sla = getSlaStatus(ticket.slaDeadline);
                return (
                  <tr key={ticket.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary-400">{ticket.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">{ticket.customerName}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{ticket.customerEmail}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{ticket.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusClass(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">{ticket.assignedAgent || <span className="text-[var(--text-tertiary)] italic">Unassigned</span>}</td>
                    <td className="py-3 px-4 text-[var(--text-tertiary)]">{formatRelative(ticket.createdAt)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sla.cls}`}>
                        {sla.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewTicket(ticket)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-blue-400 transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setAssignModal(ticket); setSelectedAgent(ticket.assignedAgent || ''); }} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-amber-400 transition-colors" title="Assign">
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setStatusModal(ticket); setSelectedStatus(ticket.status); }} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-green-400 transition-colors" title="Update Status">
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>
                        {ticket.status !== 'Closed' && (
                          <button onClick={() => handleClose(ticket)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors" title="Close">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[var(--border-primary)] px-4 py-3">
          <span className="text-xs text-[var(--text-tertiary)]">Page {safePage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${safePage === i + 1 ? 'bg-primary-600 text-white' : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* View Ticket Modal */}
      <Modal isOpen={!!viewTicket} onClose={() => setViewTicket(null)} title={`Ticket Details — ${viewTicket?.id}`} size="lg">
        {viewTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-[var(--text-tertiary)]">Title:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewTicket.title}</p></div>
              <div><span className="text-[var(--text-tertiary)]">Customer:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewTicket.customerName}</p></div>
              <div><span className="text-[var(--text-tertiary)]">Category:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewTicket.category}</p></div>
              <div><span className="text-[var(--text-tertiary)]">Priority:</span><p className="mt-0.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityClass(viewTicket.priority)}`}>{viewTicket.priority}</span></p></div>
              <div><span className="text-[var(--text-tertiary)]">Status:</span><p className="mt-0.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusClass(viewTicket.status)}`}>{viewTicket.status.replace('_', ' ')}</span></p></div>
              <div><span className="text-[var(--text-tertiary)]">Assigned Agent:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewTicket.assignedAgent || 'Unassigned'}</p></div>
            </div>
            <div className="text-xs">
              <span className="text-[var(--text-tertiary)]">Description:</span>
              <p className="mt-1 text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-xl p-3">{viewTicket.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title={`Assign Ticket — ${assignModal?.id}`}>
        {assignModal && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">Assign <strong>{assignModal.title}</strong> to a support agent.</p>
            <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} className="w-full h-10 rounded-xl border bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-sm text-[var(--text-primary)] px-3">
              <option value="">Select Agent...</option>
              {activeAgents.map(a => <option key={a.id} value={a.name}>{a.name} — {a.department} ({a.assignedTickets} assigned)</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAssignModal(null)}>Cancel</Button>
              <Button size="sm" onClick={handleAssign} disabled={!selectedAgent}>Assign</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal isOpen={!!statusModal} onClose={() => setStatusModal(null)} title={`Update Status — ${statusModal?.id}`}>
        {statusModal && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)]">Change status of <strong>{statusModal.title}</strong></p>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full h-10 rounded-xl border bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-sm text-[var(--text-primary)] px-3">
              <option value="Open">Open</option>
              <option value="In_Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setStatusModal(null)}>Cancel</Button>
              <Button size="sm" onClick={handleStatusUpdate}>Update</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
