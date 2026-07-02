import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DEMO_DATA = [
  { name: 'Alex M.', resolved: 42, open: 8, avg_time: 3.2 },
  { name: 'Sarah K.', resolved: 38, open: 12, avg_time: 4.1 },
  { name: 'James L.', resolved: 55, open: 5, avg_time: 2.8 },
  { name: 'Emily R.', resolved: 29, open: 15, avg_time: 5.3 },
  { name: 'David W.', resolved: 47, open: 7, avg_time: 3.5 },
  { name: 'Lisa H.', resolved: 34, open: 10, avg_time: 4.0 },
];

export default function PerformanceChart() {
  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Engineer Performance</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-4">Resolved vs open tickets per engineer</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={DEMO_DATA} barGap={2} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 12, fontSize: 12, color: 'var(--text-primary)' }} />
          <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{value}</span>} />
          <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
          <Bar dataKey="open" fill="#f97316" radius={[4, 4, 0, 0]} name="Open" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
