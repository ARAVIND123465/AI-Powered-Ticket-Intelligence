import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DEMO_DATA = [
  { month: 'Jan', tickets: 420 }, { month: 'Feb', tickets: 380 }, { month: 'Mar', tickets: 510 },
  { month: 'Apr', tickets: 470 }, { month: 'May', tickets: 590 }, { month: 'Jun', tickets: 620 },
  { month: 'Jul', tickets: 680 }, { month: 'Aug', tickets: 710 }, { month: 'Sep', tickets: 640 },
  { month: 'Oct', tickets: 720 }, { month: 'Nov', tickets: 780 }, { month: 'Dec', tickets: 850 },
];

export default function MonthlyAreaChart() {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Monthly Volume</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">Ticket volume over the year</p>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={DEMO_DATA}>
          <defs>
            <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 12, fontSize: 12, color: 'var(--text-primary)' }} />
          <Area type="monotone" dataKey="tickets" stroke="#06b6d4" strokeWidth={2} fill="url(#monthlyGrad)" dot={false} activeDot={{ r: 4, fill: '#06b6d4' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
