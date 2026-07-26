import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import type { SAPayment } from '../superAdminData';
import {
  REVENUE_TREND, SUBSCRIPTION_PLAN_DIST, INITIAL_PAYMENTS,
} from '../superAdminData';

interface Props {
  payments: SAPayment[];
}

const tooltipStyle = {
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border-primary)',
  borderRadius: 12,
  fontSize: 11,
  color: 'var(--text-primary)',
};

export default function SARevenueTab({ payments }: Props) {
  const mrr = 8492;
  const arr = mrr * 12;

  const upcomingRenewals = [
    { company: 'RedBus', amount: 1299, date: 'Aug 1, 2026', plan: 'Enterprise' },
    { company: 'IRCTC', amount: 1299, date: 'Aug 1, 2026', plan: 'Enterprise' },
    { company: 'Swiggy', amount: 1299, date: 'Aug 10, 2026', plan: 'Enterprise' },
    { company: 'PVR Cinemas', amount: 499, date: 'Aug 18, 2026', plan: 'Professional' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500 bg-emerald-500/[0.01]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">Monthly Recurring Revenue (MRR)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">${mrr.toLocaleString()}</div>
          <span className="text-[10px] text-[var(--text-tertiary)]">+12.4% vs last month</span>
        </Card>
        <Card className="p-5 border-l-4 border-l-primary-500 bg-primary-500/[0.01]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">Annualized Run Rate (ARR)</span>
          <div className="text-2xl font-black text-primary-400 mt-1">${arr.toLocaleString()}</div>
          <span className="text-[10px] text-[var(--text-tertiary)]">Current run-rate projection</span>
        </Card>
        <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-500/[0.01]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">Active Subscriptions</span>
          <div className="text-2xl font-black text-amber-400 mt-1">9</div>
          <span className="text-[10px] text-[var(--text-tertiary)]">Across onboarded companies</span>
        </Card>
        <Card className="p-5 border-l-4 border-l-purple-500 bg-purple-500/[0.01]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">Avg Customer Value (ACV)</span>
          <div className="text-2xl font-black text-purple-400 mt-1">$943</div>
          <span className="text-[10px] text-[var(--text-tertiary)]">Weighted monthly average</span>
        </Card>
      </div>

      {/* Revenue trends & plan distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Revenue Collection Growth (MRR Trend)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_TREND}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" name="Monthly Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Subscription Plan Distribution Pie */}
        <Card className="p-5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Subscription Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={SUBSCRIPTION_PLAN_DIST} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {SUBSCRIPTION_PLAN_DIST.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Lists row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent payments */}
        <Card className="p-5 space-y-4">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Recent Transactions</h4>
          <div className="divide-y divide-[var(--border-primary)]">
            {payments.map(pay => (
              <div key={pay.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">{pay.company}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{pay.plan} • {formatDate(pay.date)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-xs text-[var(--text-primary)]">${pay.amount}</span>
                  <Badge variant={pay.status === 'Paid' ? 'success' : 'danger'}>{pay.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming renewals */}
        <Card className="p-5 space-y-4">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Upcoming Subscription Renewals</h4>
          <div className="divide-y divide-[var(--border-primary)]">
            {upcomingRenewals.map((r, i) => (
              <div key={i} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">{r.company}</div>
                  <div className="text-[10px] text-[var(--text-tertiary)]">{r.plan} Plan • Renew date: {r.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[var(--text-secondary)]">${r.amount}</span>
                  <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">Auto billing</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
