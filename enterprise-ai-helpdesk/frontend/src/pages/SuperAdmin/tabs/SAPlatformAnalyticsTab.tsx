import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Cell, Legend,
} from 'recharts';
import Card from '@/components/ui/Card';
import { CHART_COLORS } from '@/constants';
import {
  COMPANIES_GROWTH, MONTHLY_TICKETS, AI_REQUESTS_TREND,
} from '../superAdminData';

const tooltipStyle = {
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border-primary)',
  borderRadius: 12,
  fontSize: 11,
  color: 'var(--text-primary)',
};

export default function SAPlatformAnalyticsTab() {
  const topCompanies = [
    { name: 'Amazon India', volume: 3200 },
    { name: 'IRCTC', volume: 2890 },
    { name: 'RedBus', volume: 1420 },
    { name: 'Swiggy', volume: 890 },
    { name: 'PVR Cinemas', volume: 610 },
  ];

  const userGrowth = [
    { month: 'Jan', agents: 100, customers: 800 },
    { month: 'Feb', agents: 120, customers: 1100 },
    { month: 'Mar', agents: 140, customers: 1400 },
    { month: 'Apr', agents: 155, customers: 1650 },
    { month: 'May', agents: 180, customers: 2100 },
    { month: 'Jun', agents: 195, customers: 2600 },
    { month: 'Jul', agents: 210, customers: 3000 }
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Platform Analytics</h3>
        <p className="text-xs text-[var(--text-tertiary)] font-semibold">Consolidated data statistics across all onboarded SaaS tenants</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company onboarding growth */}
        <Card className="p-5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Onboarded Companies Growth</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={COMPANIES_GROWTH}>
              <defs>
                <linearGradient id="compGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#compGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Global ticket volume */}
        <Card className="p-5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Monthly Ticket Trends (All Tenants)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_TICKETS}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Companies */}
        <Card className="p-5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Top Companies by Ticket Volume</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCompanies} barSize={20} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="volume" radius={[0, 4, 4, 0]}>
                {topCompanies.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Usage */}
        <Card className="p-5">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Daily AI Engine Predictions</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={AI_REQUESTS_TREND}>
              <defs>
                <linearGradient id="aiTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} fill="url(#aiTrend)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* User Growth */}
        <Card className="p-5 lg:col-span-2">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">User Base Expansion (Customers vs Agents)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="agentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="customers" stroke="#10b981" strokeWidth={2.5} fill="url(#custGrad)" name="Customers" />
              <Area type="monotone" dataKey="agents" stroke="#6366f1" strokeWidth={2.5} fill="url(#agentGrad)" name="Support Agents" />
              <Legend verticalAlign="top" height={36} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
