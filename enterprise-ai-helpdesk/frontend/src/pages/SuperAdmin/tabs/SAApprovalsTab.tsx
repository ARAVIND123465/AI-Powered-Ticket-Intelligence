import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, FileText, UserMinus, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import type { SACompany } from '../superAdminData';
import { formatDate } from '@/utils/formatters';

interface Props {
  companies: SACompany[];
  onUpdateCompanies: (companies: SACompany[]) => void;
}

export default function SAApprovalsTab({ companies, onUpdateCompanies }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<SACompany | null>(null);

  const pending = companies.filter(c => c.status === 'Pending');
  const filtered = pending.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (id: string, status: SACompany['status'], successMsg: string) => {
    const updated = companies.map(c => c.id === id ? { ...c, status } : c);
    onUpdateCompanies(updated);
    toast.success(successMsg);
    setSelectedCompany(null);
  };

  const handleRequestDocs = (companyName: string) => {
    toast.info(`Documents requested from ${companyName}. Admin notified via email.`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search pending companies by name, email, or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <span className="text-xs text-[var(--text-tertiary)] font-semibold">{filtered.length} approvals pending</span>
      </motion.div>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Business Type</th>
                <th className="py-3 px-4">Admin Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Country</th>
                <th className="py-3 px-4 text-center">Reg Date</th>
                <th className="py-3 px-4 text-center">Subscription Plan</th>
                <th className="py-3 px-4 text-center">Verification Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[var(--text-tertiary)]">
                    No pending approval requests.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                          {c.logo}
                        </div>
                        <span className="font-bold text-[var(--text-primary)]">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{c.businessType}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{c.adminName}</td>
                    <td className="py-3.5 px-4 font-mono text-[var(--text-secondary)]">{c.adminEmail}</td>
                    <td className="py-3.5 px-4 text-[var(--text-tertiary)]">{c.phone}</td>
                    <td className="py-3.5 px-4 text-center text-[var(--text-secondary)]">{c.country}</td>
                    <td className="py-3.5 px-4 text-center text-[var(--text-tertiary)]">{formatDate(c.registeredAt)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.verificationStatus === 'Verified' ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                        c.verificationStatus === 'Pending Documents' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                        {c.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedCompany(c)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-blue-400 transition-colors" title="View Details">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => updateStatus(c.id, 'Approved', `${c.name} has been approved.`)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-green-400 transition-colors" title="Approve">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => updateStatus(c.id, 'Rejected', `${c.name} registration rejected.`)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-red-400 transition-colors" title="Reject">
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleRequestDocs(c.name)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-amber-400 transition-colors" title="Request Documents">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => updateStatus(c.id, 'Suspended', `${c.name} has been suspended.`)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-rose-400 transition-colors" title="Suspend">
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal isOpen={!!selectedCompany} onClose={() => setSelectedCompany(null)} title="Company Registration Profile" size="lg">
        {selectedCompany && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 border-b border-[var(--border-primary)] pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black flex items-center justify-center text-lg shadow-lg">
                {selectedCompany.logo}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{selectedCompany.name}</h3>
                <p className="text-xs text-[var(--text-tertiary)]">{selectedCompany.businessType} • {selectedCompany.industry}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[var(--text-tertiary)] font-bold">Admin Details:</span>
                <p className="mt-1 text-[var(--text-primary)]">{selectedCompany.adminName} ({selectedCompany.adminEmail})</p>
                <p className="text-[var(--text-secondary)]">{selectedCompany.phone}</p>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] font-bold">Registration parameters:</span>
                <p className="mt-1 text-[var(--text-primary)]">Country: {selectedCompany.country}</p>
                <p className="text-[var(--text-secondary)]">Registered: {formatDate(selectedCompany.registeredAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--border-primary)]">
              <div>
                <span className="text-[var(--text-tertiary)] font-bold">Plan Requested:</span>
                <p className="mt-1 font-semibold text-primary-400">{selectedCompany.plan} Plan</p>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)] font-bold">Verification:</span>
                <p className="mt-1 font-semibold text-[var(--text-primary)]">{selectedCompany.verificationStatus}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-primary)]">
              <Button variant="outline" size="sm" onClick={() => handleRequestDocs(selectedCompany.name)}>
                Request Verify Documents
              </Button>
              <Button size="sm" onClick={() => updateStatus(selectedCompany.id, 'Approved', `${selectedCompany.name} Approved`)}>
                Approve Registration
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
