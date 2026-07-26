import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Edit3, CheckCircle, Slash, Trash2, Building, Bot, Ticket, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';
import type { SACompany } from '../superAdminData';

interface Props {
  companies: SACompany[];
  onUpdateCompanies: (companies: SACompany[]) => void;
}

export default function SARegisteredCompaniesTab({ companies, onUpdateCompanies }: Props) {
  const [search, setSearch] = useState('');
  const [viewCompany, setViewCompany] = useState<SACompany | null>(null);
  const [editCompany, setEditCompany] = useState<SACompany | null>(null);

  const registered = companies.filter(c => c.status !== 'Pending');
  const filtered = registered.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.adminName.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string, currentStatus: SACompany['status']) => {
    const nextStatus = currentStatus === 'Approved' ? 'Suspended' : 'Approved';
    const updated = companies.map(c => c.id === id ? { ...c, status: nextStatus as any } : c);
    onUpdateCompanies(updated);
    toast.success(`Company status changed to ${nextStatus}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      onUpdateCompanies(companies.filter(c => c.id !== id));
      toast.success(`${name} deleted from database.`);
    }
  };

  const handleEditSave = () => {
    if (!editCompany) return;
    const updated = companies.map(c => c.id === editCompany.id ? editCompany : c);
    onUpdateCompanies(updated);
    toast.success('Company details updated.');
    setEditCompany(null);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search registered companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <span className="text-xs text-[var(--text-tertiary)] font-semibold">{filtered.length} active platform companies</span>
      </motion.div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Company Admin</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4 text-center">Plan</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Tickets</th>
                <th className="py-3 px-4 text-center">Agents</th>
                <th className="py-3 px-4 text-center">Customers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                        {c.logo}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-secondary)]">{c.adminName}</td>
                  <td className="py-3.5 px-4 text-[var(--text-tertiary)]">{c.industry}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      {c.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={c.status === 'Approved' ? 'success' : 'danger'}>
                      {c.status === 'Approved' ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-400">{c.totalTickets}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-[var(--text-secondary)]">{c.agentsCount}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-[var(--text-secondary)]">{c.customersCount}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewCompany(c)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-blue-400 transition-colors" title="View Profile"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditCompany({ ...c })} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-amber-400 transition-colors" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toggleStatus(c.id, c.status)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-orange-400 transition-colors" title={c.status === 'Approved' ? 'Suspend' : 'Activate'}>
                        {c.status === 'Approved' ? <Slash className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal isOpen={!!viewCompany} onClose={() => setViewCompany(null)} title="Company Governance Ledger" size="lg">
        {viewCompany && (
          <div className="space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-4 border-b border-[var(--border-primary)] pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black flex items-center justify-center text-lg shadow-lg">
                {viewCompany.logo}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{viewCompany.name} Profile</h3>
                <p className="text-xs text-[var(--text-tertiary)]">{viewCompany.industry} • {viewCompany.country}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[var(--text-tertiary)] font-bold">Business Information</span>
                <p className="text-[var(--text-secondary)]">Business Type: {viewCompany.businessType}</p>
                <p className="text-[var(--text-secondary)]">Country: {viewCompany.country}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[var(--text-tertiary)] font-bold">Company Administrator</span>
                <p className="text-[var(--text-secondary)]">{viewCompany.adminName}</p>
                <p className="text-[var(--text-tertiary)]">{viewCompany.adminEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-b border-[var(--border-primary)] py-4">
              <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                <Ticket className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                <div className="font-bold text-[var(--text-primary)]">{viewCompany.totalTickets}</div>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-semibold">Total Tickets</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                <Users className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <div className="font-bold text-[var(--text-primary)]">{viewCompany.agentsCount}</div>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-semibold">Support Agents</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                <Users className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                <div className="font-bold text-[var(--text-primary)]">{viewCompany.customersCount}</div>
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase font-semibold">Customers</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" /> AI Engine Analytics
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-[var(--bg-tertiary)] p-3 rounded-xl border border-[var(--border-primary)]">
                <div>
                  <span className="text-[var(--text-tertiary)]">Auto Classification Success:</span>
                  <p className="font-semibold text-[var(--text-primary)]">94.5% Accuracy</p>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)]">Today's Token Consumption:</span>
                  <p className="font-semibold text-[var(--text-primary)]">14,250 Tokens</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editCompany} onClose={() => setEditCompany(null)} title="Update Company Settings">
        {editCompany && (
          <div className="space-y-4">
            <Input label="Company Name" value={editCompany.name} onChange={e => setEditCompany({ ...editCompany, name: e.target.value })} />
            <Input label="Company Admin Name" value={editCompany.adminName} onChange={e => setEditCompany({ ...editCompany, adminName: e.target.value })} />
            <Input label="Admin Email" value={editCompany.adminEmail} onChange={e => setEditCompany({ ...editCompany, adminEmail: e.target.value })} />
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Subscription Plan</label>
              <select
                value={editCompany.plan}
                onChange={e => setEditCompany({ ...editCompany, plan: e.target.value as any })}
                className="w-full h-10 rounded-xl border bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-sm text-[var(--text-primary)] px-3 focus:outline-none"
              >
                <option value="Free">Free Plan</option>
                <option value="Professional">Professional Plan</option>
                <option value="Enterprise">Enterprise Plan</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-primary)]">
              <Button variant="outline" size="sm" onClick={() => setEditCompany(null)}>Cancel</Button>
              <Button size="sm" onClick={handleEditSave}>Save Settings</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
