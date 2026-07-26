import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import Card from '@/components/ui/Card';
import { CHART_COLORS } from '@/constants';
import type { CATicket, CASupportAgent, CADepartment } from '../companyAdminData';
import {
  ANALYTICS_MONTHLY_TRENDS, ANALYTICS_WEEKLY_TRENDS,
  ANALYTICS_SATISFACTION, ANALYTICS_RESOLUTION_TIME,
} from '../companyAdminData';

interface Props {
  tickets: CATicket[];
  agents: CASupportAgent[];
  departments: CADepartment[];
}

const tooltipStyle = {
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border-primary)',
  borderRadius: 12,
  fontSize: 12,
  color: 'var(--text-primary)',
};

export default function CAAnalyticsTab({ tickets, agents, departments }: Props) {
  // Compute chart data from tickets
  const statusData = [
    { name: 'Open', value: tickets.filter(t => t.status === 'Open').length },
    { name: 'In Progress', value: tickets.filter(t => t.status === 'In_Progress').length },
    { name: 'Pending', value: tickets.filter(t => t.status === 'Pending').length },
    { name: 'Resolved', value: tickets.filter(t => t.status === 'Resolved').length },
    { name: 'Closed', value: tickets.filter(t => t.status === 'Closed').length },
  ];
  const statusColors = ['#6366f1', '#f59e0b', '#f97316', '#22c55e', '#6b7280'];

  const priorityData = [
    { name: 'Low', value: tickets.filter(t => t.priority === 'Low').length },
    { name: 'Medium', value: tickets.filter(t => t.priority === 'Medium').length },
    { name: 'High', value: tickets.filter(t => t.priority === 'High').length },
    { name: 'Critical', value: tickets.filter(t => t.priority === 'Critical').length },
    { name: 'Urgent', value: tickets.filter(t => t.priority === 'Urgent').length },
  ];
  const priorityColors = ['#22c55e', '#f59e0b', '#f97316', '#ef4444', '#dc2626'];

  // Category distribution
  const categoryMap: Record<string, number> = {};
  tickets.forEach(t => { categoryMap[t.category] = (categoryMap[t.category] || 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Agent performance
  const agentPerf = agents.filter(a => a.status === 'Active').map(a => ({
    name: a.name.split(' ')[0],
    performance: a.performance,
    resolved: a.resolvedTickets,
  }));

  // Department performance radar
  const deptPerf = departments.map(d => ({
    department: d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name,
    tickets: d.ticketCount,
    agents: d.agentCount * 20,
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Company Analytics</h3>
        <p className="text-xs text-[var(--text-tertiary)]">Visual insights into your company's support operations</p>
      </motion.div>

      {/* Row 1: Status + Priority + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ticket Status — Donut */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Ticket Status</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Distribution by current status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {statusData.map((_, i) => <Cell key={i} fill={statusColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Priority — Pie */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Priority Distribution</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Tickets by priority level</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {priorityData.map((_, i) => <Cell key={i} fill={priorityColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Category — Bar */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Category Distribution</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Tickets by category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData.slice(0, 8)} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {categoryData.slice(0, 8).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 2: Agent Performance + Resolution Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agent Performance — Horizontal Bar */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Agent Performance</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Performance score by agent</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={agentPerf} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="performance" radius={[0, 6, 6, 0]} fill="#f59e0b">
                {agentPerf.map((entry, i) => (
                  <Cell key={i} fill={entry.performance >= 90 ? '#22c55e' : entry.performance >= 80 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Resolution Time — Line */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Resolution Time Trend</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Average resolution time (hours) per month</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={ANALYTICS_RESOLUTION_TIME}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="avgHours" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 3: Satisfaction + Monthly + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer Satisfaction — Bar */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Customer Satisfaction</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Rating distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ANALYTICS_SATISFACTION} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="rating" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {ANALYTICS_SATISFACTION.map((_, i) => <Cell key={i} fill={['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981'][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Trends — Area */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Monthly Ticket Trends</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Tickets vs resolved per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ANALYTICS_MONTHLY_TRENDS}>
              <defs>
                <linearGradient id="caMonthlyTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="caMonthlyResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={2} fill="url(#caMonthlyTickets)" />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="url(#caMonthlyResolved)" />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Trends — Area */}
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Weekly Ticket Trends</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">This week's daily volume</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ANALYTICS_WEEKLY_TRENDS}>
              <defs>
                <linearGradient id="caWeeklyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="tickets" stroke="#f59e0b" strokeWidth={2} fill="url(#caWeeklyGrad)" dot={false} />
              <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="none" dot={false} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 4: Department Performance — Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Department Performance</h4>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">Ticket volume by department</p>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={deptPerf} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="var(--border-primary)" />
              <PolarAngleAxis dataKey="department" tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} />
              <PolarRadiusAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }} />
              <Radar name="Tickets" dataKey="tickets" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
