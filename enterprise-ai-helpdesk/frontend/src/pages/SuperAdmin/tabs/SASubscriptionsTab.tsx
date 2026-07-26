import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import type { SACompany } from '../superAdminData';
import { formatDate } from '@/utils/formatters';

interface Props {
  companies: SACompany[];
  onUpdateCompanies: (companies: SACompany[]) => void;
}

export default function SASubscriptionsTab({ companies, onUpdateCompanies }: Props) {
  const [activeCompany, setActiveCompany] = useState<SACompany | null>(null);

  const registered = companies.filter(c => c.status !== 'Pending');

  const handleUpgrade = (id: string, name: string) => {
    const updated = companies.map(c => c.id === id ? { ...c, plan: 'Enterprise' as const } : c);
    onUpdateCompanies(updated);
    toast.success(`🎉 ${name} upgraded to Enterprise Plan.`);
    setActiveCompany(null);
  };

  const handleDowngrade = (id: string, name: string) => {
    const updated = companies.map(c => c.id === id ? { ...c, plan: 'Professional' as const } : c);
    onUpdateCompanies(updated);
    toast.warning(`${name} downgraded to Professional Plan.`);
    setActiveCompany(null);
  };

  const handleRenew = (name: string) => {
    toast.success(`💳 Subscription renewed for ${name}. Next invoice date updated.`);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Subscriptions Master Ledger</h3>
        <p className="text-xs text-[var(--text-tertiary)] font-semibold">Inspect packages, billing cycles, and trigger manual upgrades or renewals</p>
      </motion.div>

      {/* Grid view of packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-gray-400 space-y-2 bg-[var(--bg-secondary)]">
          <span className="text-xs font-bold text-gray-400 uppercase">Starter Plan</span>
          <div className="text-2xl font-black text-[var(--text-primary)]">$199<span className="text-xs text-[var(--text-tertiary)] font-normal"> / mo</span></div>
          <p className="text-[11px] text-[var(--text-tertiary)]">Up to 3 agents, basic AI classification models, static SLA.</p>
        </Card>
        <Card className="p-5 border-l-4 border-l-amber-500 space-y-2 bg-[var(--bg-secondary)]">
          <span className="text-xs font-bold text-amber-500 uppercase">Professional Plan</span>
          <div className="text-2xl font-black text-[var(--text-primary)]">$499<span className="text-xs text-[var(--text-tertiary)] font-normal"> / mo</span></div>
          <p className="text-[11px] text-[var(--text-tertiary)]">Up to 15 agents, sentiment analysis, custom workflow schedules.</p>
        </Card>
        <Card className="p-5 border-l-4 border-l-purple-500 space-y-2 bg-[var(--bg-secondary)]">
          <span className="text-xs font-bold text-purple-500 uppercase">Enterprise Plan</span>
          <div className="text-2xl font-black text-[var(--text-primary)]">$1299<span className="text-xs text-[var(--text-tertiary)] font-normal"> / mo</span></div>
          <p className="text-[11px] text-[var(--text-tertiary)]">Unlimited support agents, full OCR capabilities, private LLMs.</p>
        </Card>
      </div>

      {/* Subscription Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider bg-[var(--bg-tertiary)]/50">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4 text-center">Current Plan</th>
                <th className="py-3 px-4 text-center">Billing Cycle</th>
                <th className="py-3 px-4 text-center">Expiry / Next Renewal</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {registered.map(c => (
                <tr key={c.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                        {c.logo}
                      </div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-semibold text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-lg border border-primary-500/20">
                      {c.plan} Plan
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-[var(--text-secondary)] font-medium">Monthly</td>
                  <td className="py-3.5 px-4 text-center font-mono text-[var(--text-tertiary)]">
                    {formatDate(new Date(new Date(c.registeredAt).getTime() + 30 * 86400000).toISOString())}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={c.status === 'Approved' ? 'success' : 'danger'}>
                      {c.status === 'Approved' ? 'Active' : 'Expired'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => handleRenew(c.name)} className="text-[10px] h-7 px-2.5 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Renew
                      </Button>
                      <Button size="sm" onClick={() => handleUpgrade(c.id, c.name)} disabled={c.plan === 'Enterprise'} className="text-[10px] h-7 px-2.5 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" /> Upgrade
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDowngrade(c.id, c.name)} disabled={c.plan === 'Free' || c.plan === 'Professional'} className="text-[10px] h-7 px-2.5 flex items-center gap-1">
                        <ArrowDown className="w-3 h-3" /> Downgrade
                      </Button>
                    </div>
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
