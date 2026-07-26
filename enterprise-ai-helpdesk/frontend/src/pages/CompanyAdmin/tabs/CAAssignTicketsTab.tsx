import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, UserPlus, ArrowRightLeft, Save, Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import type { CATicket, CASupportAgent } from '../companyAdminData';

interface Props {
  tickets: CATicket[];
  agents: CASupportAgent[];
  onUpdateTickets: (tickets: CATicket[]) => void;
}

// Simple AI agent suggestion based on category → department match
function suggestAgent(ticket: CATicket, agents: CASupportAgent[]): CASupportAgent | null {
  const deptMap: Record<string, string> = {
    'Login': 'Technical Support', 'Payment': 'Billing', 'Refund': 'Refund',
    'Technical': 'Technical Support', 'Security': 'Security', 'Network': 'Network',
    'Software': 'Software', 'Hardware': 'Hardware', 'Billing': 'Billing',
    'Bug': 'Software', 'Access Control': 'Security', 'Account': 'Customer Care',
    'Delivery': 'Customer Care', 'General Inquiry': 'Customer Care', 'Feature Request': 'Software',
  };
  const dept = deptMap[ticket.category] || 'Technical Support';
  const active = agents.filter(a => a.status === 'Active' && a.onlineStatus !== 'Offline' && a.department === dept);
  if (active.length === 0) return agents.find(a => a.status === 'Active' && a.onlineStatus !== 'Offline') || null;
  return active.sort((a, b) => a.assignedTickets - b.assignedTickets)[0];
}

export default function CAAssignTicketsTab({ tickets, agents, onUpdateTickets }: Props) {
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const assignable = tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved');
  const filtered = assignable.filter(t =>
    !search || t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const activeAgents = agents.filter(a => a.status === 'Active');

  const handleSaveAll = () => {
    const changes = Object.entries(assignments);
    if (changes.length === 0) { toast.info('No assignments to save'); return; }
    const updated = tickets.map(t => {
      if (assignments[t.id]) {
        return { ...t, assignedAgent: assignments[t.id], status: t.status === 'Open' ? 'In_Progress' as const : t.status };
      }
      return t;
    });
    onUpdateTickets(updated);
    toast.success(`${changes.length} ticket(s) assigned successfully`);
    setAssignments({});
  };

  const handleAssignSingle = (ticketId: string) => {
    const agent = assignments[ticketId];
    if (!agent) { toast.error('Please select an agent first'); return; }
    const updated = tickets.map(t => t.id === ticketId ? { ...t, assignedAgent: agent, status: t.status === 'Open' ? 'In_Progress' as const : t.status } : t);
    onUpdateTickets(updated);
    toast.success(`Ticket ${ticketId} assigned to ${agent}`);
    setAssignments(prev => { const n = { ...prev }; delete n[ticketId]; return n; });
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors" />
        </div>
        <Button size="sm" onClick={handleSaveAll} className="flex items-center gap-1.5 text-xs">
          <Save className="w-3.5 h-3.5" /> Save All Assignments
        </Button>
      </motion.div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> AI Suggested Agent</span>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Assign Agent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {filtered.map(ticket => {
                const suggested = suggestAgent(ticket, agents);
                return (
                  <tr key={ticket.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-primary-400">{ticket.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[var(--text-primary)]">{ticket.customerName}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">{ticket.category}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        ticket.priority === 'Urgent' || ticket.priority === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        ticket.priority === 'High' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        ticket.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-green-500/15 text-green-400 border-green-500/30'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {suggested ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          <Sparkles className="w-3 h-3" /> {suggested.name}
                        </span>
                      ) : (
                        <span className="text-[var(--text-tertiary)] italic text-[11px]">No suggestion</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        ticket.status === 'Open' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                        ticket.status === 'In_Progress' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-orange-500/15 text-orange-400 border-orange-500/30'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={assignments[ticket.id] || ticket.assignedAgent || ''}
                        onChange={e => setAssignments(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        className="h-8 w-full max-w-[200px] bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg px-2 text-xs text-[var(--text-primary)]"
                      >
                        <option value="">Select Agent...</option>
                        {activeAgents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleAssignSingle(ticket.id)} className="p-1.5 rounded-lg hover:bg-primary-500/10 text-[var(--text-tertiary)] hover:text-primary-400 transition-colors" title="Assign">
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => {
                          if (suggested) {
                            setAssignments(prev => ({ ...prev, [ticket.id]: suggested.name }));
                            toast.info(`AI suggested ${suggested.name} for ${ticket.id}`);
                          }
                        }} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-[var(--text-tertiary)] hover:text-amber-400 transition-colors" title="Use AI suggestion">
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
