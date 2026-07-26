import { motion } from 'framer-motion';
import {
  Building2, Clock, CheckCircle2, AlertTriangle, Users, Ticket,
  DollarSign, CreditCard, Brain, Server, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import type { SACompany, SAPlatformUser, SANotification } from '../superAdminData';

interface Props {
  companies: SACompany[];
  users: SAPlatformUser[];
  notifications: SANotification[];
  onSelectTab: (tabId: string) => void;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function SADashboardTab({ companies, users, notifications, onSelectTab }: Props) {
  const totalCompanies = companies.length;
  const pendingApprovals = companies.filter(c => c.status === 'Pending').length;
  const activeCompanies = companies.filter(c => c.status === 'Approved').length;
  const suspendedCompanies = companies.filter(c => c.status === 'Suspended').length;
  const totalUsers = users.length + 3000; // Adding mock base
  const totalTickets = companies.reduce((acc, c) => acc + c.totalTickets, 0);
  const monthlyRevenue = 8492;
  const activeSubscriptions = activeCompanies;
  const aiRequestsToday = 2100;
  const platformUptime = '99.98%';

  const kpis = [
    { label: 'Total Companies', value: totalCompanies, icon: Building2, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', trend: '+2 this week', up: true, tab: 'companies' },
    { label: 'Pending Approvals', value: pendingApprovals, icon: Clock, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', trend: pendingApprovals > 0 ? 'Action needed' : 'All clear', up: pendingApprovals > 0, tab: 'approvals' },
    { label: 'Active Companies', value: activeCompanies, icon: CheckCircle2, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', trend: '100% active plan', up: true, tab: 'companies' },
    { label: 'Suspended Companies', value: suspendedCompanies, icon: AlertTriangle, color: 'from-red-500 to-rose-600', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', trend: 'Compliance issue', up: false, tab: 'companies' },
    { label: 'Total Platform Users', value: totalUsers.toLocaleString(), icon: Users, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', trend: '+140 new today', up: true, tab: 'users' },
    { label: 'Total Tickets (Global)', value: totalTickets.toLocaleString(), icon: Ticket, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', trend: '+12% vs last month', up: true, tab: 'analytics' },
    { label: 'Monthly Revenue', value: `$${monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', trend: '+18.4% MRR growth', up: true, tab: 'revenue' },
    { label: 'Active Subscriptions', value: activeSubscriptions, icon: CreditCard, color: 'from-teal-500 to-cyan-600', bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', trend: 'No failures', up: true, tab: 'subscriptions' },
    { label: 'AI Requests Today', value: aiRequestsToday.toLocaleString(), icon: Brain, color: 'from-pink-500 to-rose-600', bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', trend: '98% confidence avg', up: true, tab: 'ai' },
    { label: 'Platform Uptime', value: platformUptime, icon: Server, color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', trend: 'All systems operational', up: true, tab: 'health' }
  ];

  const recentRegistrants = companies.filter(c => c.status === 'Pending').slice(0, 3);
  const activeAlerts = notifications.filter(n => !n.read).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={item}>
              <button
                onClick={() => onSelectTab(kpi.tab)}
                className="w-full text-left focus:outline-none block"
              >
                <Card className={`p-4 space-y-2.5 h-full ${kpi.border} ${kpi.bg} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">{kpi.label}</span>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-black text-[var(--text-primary)]">{kpi.value}</div>
                    <span className={`text-[9px] font-semibold flex items-center gap-0.5 mt-1 ${kpi.up ? 'text-green-400' : 'text-amber-400'}`}>
                      {kpi.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                      {kpi.trend}
                    </span>
                  </div>
                </Card>
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dynamic Summary sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals Needed */}
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Pending Company Approvals</h3>
              <p className="text-xs text-[var(--text-tertiary)]">Newly registered SaaS tenants awaiting review</p>
            </div>
            <button onClick={() => onSelectTab('approvals')} className="text-xs text-primary-400 hover:text-primary-300 font-semibold">
              View All ({pendingApprovals})
            </button>
          </div>
          {recentRegistrants.length === 0 ? (
            <div className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded-xl p-6 text-center border border-[var(--border-primary)]">
              🎉 No pending registrations to review.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-primary)]">
              {recentRegistrants.map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black flex items-center justify-center text-xs">
                      {c.logo}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">{c.name}</div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">{c.industry} • {c.country}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-lg border border-primary-500/20">
                    {c.plan} Plan
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* System & Operations Alerts */}
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Critical Platform Alerts</h3>
              <p className="text-xs text-[var(--text-tertiary)]">Today's system, security, or subscription issues</p>
            </div>
            <button onClick={() => onSelectTab('notifications')} className="text-xs text-primary-400 hover:text-primary-300 font-semibold">
              Notifications
            </button>
          </div>
          {activeAlerts.length === 0 ? (
            <div className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded-xl p-6 text-center border border-[var(--border-primary)]">
              ✅ All servers healthy & zero critical service anomalies.
            </div>
          ) : (
            <div className="space-y-2">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="flex gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5 animate-pulse" />
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{alert.title}</div>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
