import { motion } from 'framer-motion';
import {
  Ticket, AlertCircle, Clock, CheckCircle2, XCircle,
  AlertTriangle, Timer, Smile, Users, UserCheck, TrendingUp,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import type { CATicket, CASupportAgent, CACustomer } from '../companyAdminData';

interface Props {
  tickets: CATicket[];
  agents: CASupportAgent[];
  customers: CACustomer[];
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function CADashboardTab({ tickets, agents, customers }: Props) {
  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In_Progress').length;
  const pending = tickets.filter(t => t.status === 'Pending').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const closed = tickets.filter(t => t.status === 'Closed').length;
  const highPriority = tickets.filter(t => t.priority === 'High' || t.priority === 'Critical' || t.priority === 'Urgent').length;
  const avgResolution = '2.8 hrs';
  const csat = '4.6 / 5';
  const activeAgents = agents.filter(a => a.status === 'Active' && a.onlineStatus !== 'Offline').length;
  const totalCustomers = customers.length;

  const kpis = [
    { label: 'Total Tickets', value: total, icon: Ticket, color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', trend: '+12%', up: true },
    { label: 'Open Tickets', value: open, icon: AlertCircle, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', trend: '+3', up: true },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', trend: null, up: false },
    { label: 'Pending Tickets', value: pending, icon: Timer, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', trend: '-2', up: false },
    { label: 'Resolved Tickets', value: resolved, icon: CheckCircle2, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', trend: '+8', up: true },
    { label: 'Closed Tickets', value: closed, icon: XCircle, color: 'from-gray-500 to-slate-600', bg: 'bg-gray-500/10', border: 'border-gray-500/20', text: 'text-gray-400', trend: null, up: false },
    { label: 'High Priority', value: highPriority, icon: AlertTriangle, color: 'from-red-500 to-rose-600', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', trend: '+4', up: true },
    { label: 'Avg Resolution', value: avgResolution, icon: TrendingUp, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', trend: '-15%', up: false },
    { label: 'Customer Satisfaction', value: csat, icon: Smile, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', trend: '+0.2', up: true },
    { label: 'Active Agents', value: activeAgents, icon: UserCheck, color: 'from-teal-500 to-emerald-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20', text: 'text-teal-400', trend: null, up: false },
    { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', trend: '+5', up: true },
  ];

  // Recent tickets for quick glance
  const recentTickets = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} variants={item}>
              <Card className={`p-5 space-y-3 ${kpi.border} ${kpi.bg} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${kpi.text}`}>{kpi.label}</span>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[var(--text-primary)]">{kpi.value}</span>
                  {kpi.trend && (
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${kpi.up ? 'text-emerald-400' : 'text-emerald-400'}`}>
                      {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {kpi.trend}
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Tickets */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Recent Tickets</h3>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">Latest 5 tickets from your company</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-primary)] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Priority</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-primary)]">
                {recentTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-primary-400">{ticket.id}</td>
                    <td className="py-3 px-3 text-[var(--text-primary)]">{ticket.customerName}</td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">{ticket.category}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        ticket.priority === 'Urgent' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        ticket.priority === 'Critical' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                        ticket.priority === 'High' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        ticket.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-green-500/15 text-green-400 border-green-500/30'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        ticket.status === 'Open' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                        ticket.status === 'In_Progress' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        ticket.status === 'Pending' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' :
                        ticket.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                        'bg-gray-500/15 text-gray-400 border-gray-500/30'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--text-secondary)]">{ticket.assignedAgent || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
