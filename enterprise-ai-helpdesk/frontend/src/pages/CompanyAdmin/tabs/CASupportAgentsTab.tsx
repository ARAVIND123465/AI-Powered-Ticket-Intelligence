import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Eye, Edit3, Power, PowerOff, KeyRound, X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import ProgressBar from '@/components/ui/ProgressBar';
import { toast } from 'sonner';
import type { CASupportAgent } from '../companyAdminData';

interface Props {
  agents: CASupportAgent[];
  onUpdateAgents: (agents: CASupportAgent[]) => void;
}

const DEPARTMENTS = ['Technical Support', 'Billing', 'Refund', 'Security', 'Network', 'Software', 'Hardware', 'Customer Care'];

export default function CASupportAgentsTab({ agents, onUpdateAgents }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [viewAgent, setViewAgent] = useState<CASupportAgent | null>(null);
  const [editAgent, setEditAgent] = useState<CASupportAgent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add agent form state
  const [form, setForm] = useState({
    employeeId: '', name: '', email: '', phone: '', department: DEPARTMENTS[0],
    designation: '', password: '', confirmPassword: '', status: 'Active' as 'Active' | 'Inactive',
  });

  const filtered = agents.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase()) ||
      a.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const resetForm = () => setForm({
    employeeId: '', name: '', email: '', phone: '', department: DEPARTMENTS[0],
    designation: '', password: '', confirmPassword: '', status: 'Active',
  });

  const handleAddAgent = () => {
    if (!form.name || !form.email || !form.employeeId) { toast.error('Please fill all required fields'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }

    const newAgent: CASupportAgent = {
      id: `AGT-${200 + agents.length + 1}`,
      employeeId: form.employeeId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      designation: form.designation,
      avatar: form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      assignedTickets: 0,
      resolvedTickets: 0,
      performance: 0,
      status: form.status,
      onlineStatus: form.status === 'Active' ? 'Online' : 'Offline',
    };
    onUpdateAgents([...agents, newAgent]);
    toast.success(`Agent ${form.name} added successfully`);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditSave = () => {
    if (!editAgent) return;
    const updated = agents.map(a => a.id === editAgent.id ? editAgent : a);
    onUpdateAgents(updated);
    toast.success(`Agent ${editAgent.name} updated`);
    setEditAgent(null);
  };

  const toggleStatus = (agent: CASupportAgent) => {
    const newStatus = agent.status === 'Active' ? 'Inactive' : 'Active';
    const updated = agents.map(a => a.id === agent.id ? { ...a, status: newStatus as 'Active' | 'Inactive', onlineStatus: newStatus === 'Inactive' ? 'Offline' as const : 'Online' as const } : a);
    onUpdateAgents(updated);
    toast.success(`${agent.name} ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
  };

  const resetPassword = (agent: CASupportAgent) => {
    toast.success(`Password reset link sent to ${agent.email}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
            <input type="text" placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="h-9 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3 text-xs text-[var(--text-primary)]">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Agent
        </Button>
      </motion.div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Assigned</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-center">Performance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {filtered.map(agent => (
                <tr key={agent.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                        {agent.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{agent.name}</div>
                        <div className="text-[10px] text-[var(--text-tertiary)]">{agent.designation}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--text-secondary)]">{agent.employeeId}</td>
                  <td className="py-3 px-4 text-[var(--text-secondary)]">{agent.department}</td>
                  <td className="py-3 px-4 text-[var(--text-tertiary)]">{agent.email}</td>
                  <td className="py-3 px-4 text-[var(--text-tertiary)]">{agent.phone}</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-[var(--text-primary)]">{agent.assignedTickets}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{agent.resolvedTickets}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-center">
                      <ProgressBar value={agent.performance} size="sm" className="w-16" />
                      <span className="text-[11px] font-mono font-semibold text-[var(--text-primary)]">{agent.performance}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      agent.status === 'Active'
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'Active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                      {agent.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewAgent(agent)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-blue-400 transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditAgent({ ...agent })} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-amber-400 transition-colors" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleStatus(agent)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-green-400 transition-colors" title={agent.status === 'Active' ? 'Deactivate' : 'Activate'}>
                        {agent.status === 'Active' ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => resetPassword(agent)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-purple-400 transition-colors" title="Reset Password"><KeyRound className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Agent Modal */}
      <Modal isOpen={!!viewAgent} onClose={() => setViewAgent(null)} title={`Agent Profile — ${viewAgent?.name}`} size="lg">
        {viewAgent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center text-xl shadow-lg">
                {viewAgent.avatar}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{viewAgent.name}</h3>
                <p className="text-xs text-[var(--text-tertiary)]">{viewAgent.designation}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{viewAgent.department}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-[var(--text-tertiary)]">Employee ID:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewAgent.employeeId}</p></div>
              <div><span className="text-[var(--text-tertiary)]">Email:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewAgent.email}</p></div>
              <div><span className="text-[var(--text-tertiary)]">Phone:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewAgent.phone}</p></div>
              <div><span className="text-[var(--text-tertiary)]">Status:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewAgent.status}</p></div>
              <div><span className="text-[var(--text-tertiary)]">Assigned Tickets:</span><p className="font-medium text-[var(--text-primary)] mt-0.5">{viewAgent.assignedTickets}</p></div>
              <div><span className="text-[var(--text-tertiary)]">Resolved Tickets:</span><p className="font-medium text-emerald-400 mt-0.5">{viewAgent.resolvedTickets}</p></div>
              <div className="col-span-2"><span className="text-[var(--text-tertiary)]">Performance:</span><div className="mt-1 flex items-center gap-3"><ProgressBar value={viewAgent.performance} className="flex-1" /><span className="font-mono font-bold text-[var(--text-primary)]">{viewAgent.performance}%</span></div></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Agent Modal */}
      <Modal isOpen={!!editAgent} onClose={() => setEditAgent(null)} title={`Edit Agent — ${editAgent?.name}`}>
        {editAgent && (
          <div className="space-y-4">
            <Input label="Full Name" value={editAgent.name} onChange={e => setEditAgent({ ...editAgent, name: e.target.value })} />
            <Input label="Email" value={editAgent.email} onChange={e => setEditAgent({ ...editAgent, email: e.target.value })} />
            <Input label="Phone" value={editAgent.phone} onChange={e => setEditAgent({ ...editAgent, phone: e.target.value })} />
            <Input label="Designation" value={editAgent.designation} onChange={e => setEditAgent({ ...editAgent, designation: e.target.value })} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Department</label>
              <select value={editAgent.department} onChange={e => setEditAgent({ ...editAgent, department: e.target.value })}
                className="w-full h-10 rounded-xl border bg-[var(--bg-input)] border-[var(--border-primary)] text-[var(--text-primary)] px-3 text-sm">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditAgent(null)}>Cancel</Button>
              <Button size="sm" onClick={handleEditSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Agent Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Support Agent" size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center text-2xl shadow-lg">
              {form.name ? form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Employee ID *" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} placeholder="EMP-XXXX" />
            <Input label="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            <Input label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
            <Input label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full h-10 rounded-xl border bg-[var(--bg-input)] border-[var(--border-primary)] text-[var(--text-primary)] px-3 text-sm">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <Input label="Designation" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="Support Engineer" />
            <Input label="Password *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <Input label="Confirm Password *" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })}
              className="w-full h-10 rounded-xl border bg-[var(--bg-input)] border-[var(--border-primary)] text-[var(--text-primary)] px-3 text-sm">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddAgent}>Create Agent</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
